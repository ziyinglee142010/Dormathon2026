from django.db import models
from django.contrib.auth.models import AbstractUser
from collections import namedtuple
from django.utils import timezone
import uuid
from django.db import transaction
from functools import partial


class REPORT_STATUSES:
    """Status constants - Keep as integers"""
    pending = 0
    running = 1
    finished = 2
    error = 3

# Create your models here.

# create the models based on the uml diagram

class UserProfile(AbstractUser):
    id = models.UUIDField(primary_key=True, default= uuid.uuid4, editable=False)
    clinic = models.ForeignKey('Clinic', on_delete=models.CASCADE, related_name='users', null=True, blank=True)

class Clinic(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)

    def __str__(self):
        return self.name

class Video(models.Model):
    
    REPORT_STATUS_CHOICES = [
        (REPORT_STATUSES.pending, "Pending"),      # 0 
        (REPORT_STATUSES.running, "Running"),      # 1 
        (REPORT_STATUSES.finished, "Finished"),    # 2
        (REPORT_STATUSES.error, "Error"),          # 3
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    video_file_path = models.URLField(max_length=500)  # Keep as URLField
    created_at = models.DateTimeField(auto_now_add=True)
    session = models.OneToOneField('Session', on_delete=models.CASCADE, related_name='video', null=True, blank=True)
    duration = models.FloatField(null=True, blank=True)  # duration in seconds
    status = models.IntegerField(
        choices=REPORT_STATUS_CHOICES, 
        default=REPORT_STATUSES.pending
    )

    def __str__(self):
        return f"Video {self.id}"

    # Override the save function
    def save(self, *args, **kwargs):
        # Only the status or duration is being updated
        if kwargs.get('update_fields') in [['status'], ['duration'], ['status', 'duration']]:
            super().save(*args, **kwargs)
            return
        
        super().save(*args, **kwargs)  # save the video

        # if the video is pending or error
        if self.status == REPORT_STATUSES.pending or self.status == REPORT_STATUSES.error:
            print(f"🎬 Triggering processing for video {self.id}")
            try:
                # Change status to running
                self.status = REPORT_STATUSES.running
                self.save(update_fields=['status'])
                
                # Queue the task - UPDATED to use new task name
                from .tasks import upload_and_process_video_timestamp
                transaction.on_commit(
                    partial(upload_and_process_video_timestamp.delay, str(self.id))
                )
                
            except Exception as error:
                print(f"❌ Tasks Queue Error: {error}")
                self.status = REPORT_STATUSES.error
                self.save(update_fields=['status'])
                return

    def get_video_url(self, expiration_hours=24):
        """Generate signed URL for video file from Firebase path"""
        if not self.video_file_path:
            return None
        
        try:
            from firebase_admin import storage
            from datetime import timedelta
            
            bucket = storage.bucket()
            
            # If video_file_path is already a full URL, return it
            if self.video_file_path.startswith('http'):
                return self.video_file_path
            
            # Otherwise treat it as a Firebase path
            blob = bucket.blob(self.video_file_path)
            
            if not blob.exists():
                return None
            
            url = blob.generate_signed_url(
                version="v4",
                expiration=timedelta(hours=expiration_hours),
                method="GET"
            )
            
            return url
        except Exception as e:
            print(f"Error generating video URL: {e}")
            return None
           
    def insert_emotion(self, response_data):
        """
        Legacy method for backward compatibility
        
        Current input file format: 
        {
            'video_path': '/tmp/tmpdc9c580h.mp4', 
            'predictions': {
                'angry': 9, 
                'disgust': 1, 
                'fear': 2, 
                'happiness': 10, 
                'sad': 5, 
                'surprise': 3, 
                'neutral': 16
            } 
        }
        """
        try:
            with transaction.atomic():
                # delete emotion data associated with this video
                Emotion.objects.filter(video=self).delete()
                emotion_data = response_data["predictions"]
                emotions_to_create = []
                
                # iterate all the results from the api call and insert it into the orm 
                for emotion, total_count in emotion_data.items():
                    # the value of each emotion represents the count and we need to insert every single value into the table
                    for _ in range(total_count):
                        # Create an Emotion object in memory (but don't save it yet)
                        new_emotion = Emotion(
                            category=emotion,
                            confidence=0.0,  # Placeholder confidence
                            source="automatic",
                            video=self,      # This correctly links to the current Video instance
                            start_time=timezone.timedelta(seconds=0), # Provide a value for the required field
                            end_time=timezone.timedelta(seconds=0)   # Provide a value for the required field
                        )
                        emotions_to_create.append(new_emotion)

                if emotions_to_create:
                    Emotion.objects.bulk_create(emotions_to_create)
                    print(f"Successfully created {len(emotions_to_create)} emotion records.")

                self.status = REPORT_STATUSES.finished
                # manually pass in update_fields to flag the save() function to only update the status
                self.save(update_fields=['status'])
                return
            
        except (KeyError, TypeError) as e:
            # Handle errors during parsing of the response data
            print(f"Error parsing API response: {e}")
            self.status = REPORT_STATUSES.error
            self.save(update_fields=['status'])
        
        return
    
    def insert_emotion_with_timestamp(self, response_data):
        """
        Insert emotions from ML service response
        
        Expected input format from NEW ML service:
        {
            "success": true,
            "duration_seconds": 120.5,
            "predictions": [
                {
                    "start": "00:00:02",
                    "end": "00:00:04",
                    "emotion": "happy",
                    "confidence": 0.87
                },
                ...
            ]
        }
        
        OLD format (still supported):
        {
            'video_path': '/tmp/tmp9jzf17ga.mp4', 
            'video_duration': '00:00:15',
            'predictions': [
                {'start': '00:00:04', 'end': '00:00:10', 'emotion': 'sad'}, 
                {'start': '00:00:10', 'end': '00:00:12', 'emotion': 'happiness'}, 
                {'start': '00:00:12', 'end': '00:00:14', 'emotion': 'fear'},
                ...
            ]
        }
        """

        def parse_duration(duration_str):
            """Convert a duration string 'HH:MM:SS' to a timedelta object."""
            try:
                h, m, s = map(int, duration_str.split(':'))
                return timezone.timedelta(hours=h, minutes=m, seconds=s)
            except:
                # Fallback for invalid format
                return timezone.timedelta(seconds=0)

        try:
            with transaction.atomic():
                # delete emotion data associated with this video
                Emotion.objects.filter(video=self).delete()
                
                predictions = response_data.get("predictions", [])
                
                if not predictions:
                    print(f"No predictions in response")
                    self.status = REPORT_STATUSES.error
                    self.save(update_fields=['status'])
                    return
                
                emotions_to_create = []

                # iterate all the results from the api call and insert it into the orm
                for prediction in predictions:
                    new_emotion = Emotion(
                        category=prediction.get("emotion", "neutral"),
                        confidence=prediction.get("confidence", 0.0),  # Now uses actual confidence
                        source="automatic",
                        video=self,
                        start_time=parse_duration(prediction.get("start", "00:00:00")),
                        end_time=parse_duration(prediction.get("end", "00:00:00")),
                    )
                    emotions_to_create.append(new_emotion)

                if emotions_to_create:
                    Emotion.objects.bulk_create(emotions_to_create, batch_size=100)
                    print(f"Successfully created {len(emotions_to_create)} emotion records.")

                self.status = REPORT_STATUSES.finished
                # manually pass in update_fields to flag the save() function to only update the status
                self.save(update_fields=['status'])
                return
            
        except (KeyError, TypeError) as e:
            # Handle errors during parsing of the response data
            print(f"Error parsing API response: {e}")
            import traceback
            traceback.print_exc()
            self.status = REPORT_STATUSES.error
            self.save(update_fields=['status'])
        
        except Exception as e:
            print(f"Unexpected error: {e}")
            import traceback
            traceback.print_exc()
            self.status = REPORT_STATUSES.error
            self.save(update_fields=['status'])
        
        return

        
class Emotion(models.Model):
    id = models.AutoField(primary_key=True)
    category = models.CharField(max_length=50)
    confidence = models.FloatField()
    source = models.CharField(max_length=50, choices=[('manual', 'Manual'), ('automatic', 'Automatic')], default='automatic')
    start_time = models.DurationField()
    end_time = models.DurationField()
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='emotions')


class Patient(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=[
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ], default='other')

    photo_url = models.URLField(max_length=1000, null=True, blank=True, help_text="Firebase Storage URL for patient photo")
    photo_firebase_path = models.CharField(max_length=500, null=True, blank=True, help_text="Firebase Storage path (e.g., patients/uuid/profile.jpg)")

    def __str__(self):
        return self.name
    

class Session(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    therapist = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='sessions')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='patient_sessions')
    clinic = models.ForeignKey(Clinic, on_delete=models.CASCADE, related_name='sessions', null=True, blank=True)
    date = models.DateField()
    time = models.TimeField(null=True, blank=True) # added this for session time
    description = models.TextField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    summary = models.TextField(null=True, blank=True)
    zoom_link_host = models.URLField(max_length=500, null=True, blank=True)
    zoom_link_participant = models.URLField(max_length=500, null=True, blank=True)

    def __str__(self):
        return f"Session {self.id} - {self.therapist.username} with {self.patient.name} on {self.date}"
            
