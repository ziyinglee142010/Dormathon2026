from celery import shared_task
from .models import Video, Session
import requests
import os
from firebase_admin import storage
from .models import Video, Session, Emotion, REPORT_STATUSES, Patient
from datetime import timedelta
import google.generativeai as genai
from django.db import connection
from django.conf import settings

@shared_task(
    bind=True,
    max_retries=3,
    soft_time_limit=7200,
    time_limit=7500,
)
def upload_and_process_video_timestamp(self, video_id):
    """
    Process video using ML service
    Keeps using integer status codes
    """
    try:
        print(f"=" * 60)
        print(f"Starting video processing: {video_id}")
        print(f"=" * 60)
        
        # Get video
        video = Video.objects.get(id=video_id)
        
        # Already set to running in save() method
        
        # Get session and patient
        session = video.session
        patient = session.patient
        
        print(f"Patient: {patient.name}")
        print(f"Session: {session.id}")
        
        # Check patient photo
        if not patient.photo_firebase_path:
            raise Exception(f"Patient {patient.id} has no photo")
        
        # Generate signed URLs
        bucket = storage.bucket()
        
        print(f"Generating signed URLs...")
        
        # Video URL - handle both Firebase path and full URL
        if video.video_file_path.startswith('http'):
            video_url = video.video_file_path
        else:
            video_blob = bucket.blob(video.video_file_path)
            if not video_blob.exists():
                raise Exception(f"Video not found: {video.video_file_path}")
            video_url = video_blob.generate_signed_url(
                version="v4",
                expiration=timedelta(hours=2),
                method="GET"
            )
        
        # Photo URL
        photo_blob = bucket.blob(patient.photo_firebase_path)
        if not photo_blob.exists():
            raise Exception(f"Photo not found: {patient.photo_firebase_path}")
        
        photo_url = photo_blob.generate_signed_url(
            version="v4",
            expiration=timedelta(hours=2),
            method="GET"
        )
        
        print(f"URLs generated")

        connection.close()
        
        # Send to ML service
        api_url = "http://localhost:8080/analyze"  
        
        payload = {
            "video_url": video_url,
            "patient_photo_url": photo_url,
            "frame_interval": 60
        }
        
        print(f"Sending to ML service...")
        response = requests.post(
            api_url,
            json=payload,
            timeout=7200
        )
        response.raise_for_status()
        api_response = response.json()
        
        print(f"ML service completed")
        
        # Check success
        if not api_response.get('success'):
            raise Exception(api_response.get('error', 'Processing failed'))
        
        # Save duration
        duration_seconds = api_response.get('duration_seconds', 0)
        video.duration = duration_seconds
        video.save(update_fields=['duration'])
        print(f"Duration: {duration_seconds}s ({duration_seconds/60:.1f} min)")
        
        # Save emotions using existing method
        print(f"Saving emotions to database...")
        video.insert_emotion_with_timestamp(api_response)
        
        print(f"=" * 60)
        print(f"PROCESSING COMPLETED SUCCESSFULLY")
        print(f"Total predictions: {len(api_response.get('predictions', []))}")
        print(f"=" * 60)
        
        return {
            "success": True,
            "video_id": str(video_id),
            "total_predictions": len(api_response.get('predictions', []))
        }
        
    except Video.DoesNotExist:
        print(f"Video {video_id} not found")
        return {"error": f"Video {video_id} not found"}
        
    except requests.exceptions.Timeout:
        print(f"Timeout")
        try:
            video = Video.objects.get(id=video_id)
            video.status = REPORT_STATUSES.error
            video.save(update_fields=['status'])
        except:
            pass
        raise self.retry(countdown=300, exc=Exception("Timeout"))
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        
        try:
            connection.close()
            video = Video.objects.get(id=video_id)
            video.status = REPORT_STATUSES.error
            video.save(update_fields=['status'])
        except:
            pass
        
        return {"error": str(e)}
    finally:
        connection.close()

@shared_task
def generate_video_summary(session_id):
    """Generate AI summary using Gemini - takes session_id"""
    video = None
    session = None
    
    try:
        
        # Get session and video
        session = Session.objects.get(id=session_id)
        
        # Check if session has a video
        if not hasattr(session, 'video') or not session.video:
            raise Exception("Session has no video")
        
        video = session.video
        patient = session.patient
        emotions = Emotion.objects.filter(video=video)
        
        if emotions.count() == 0:
            raise Exception("No emotions found to summarize")
        
        # Configure Gemini
        genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Build emotion summary
        emotion_data = {}
        for emotion in emotions:
            category = emotion.category
            if category not in emotion_data:
                emotion_data[category] = {
                    'count': 0,
                    'total_duration': 0,
                    'avg_confidence': []
                }
            emotion_data[category]['count'] += 1
            duration = (emotion.end_time - emotion.start_time).total_seconds()
            emotion_data[category]['total_duration'] += duration
            emotion_data[category]['avg_confidence'].append(emotion.confidence)
        
        # Calculate averages
        for category in emotion_data:
            confidences = emotion_data[category]['avg_confidence']
            emotion_data[category]['avg_confidence'] = sum(confidences) / len(confidences)
        
        # Create prompt
        prompt = f"""You are a professional therapist analyzing a patient's emotional state during a therapy session.

Patient Information:
- Name: {patient.name}
- Session Date: {session.date}
- Video Duration: {video.duration} seconds ({video.duration/60:.1f} minutes)

Emotion Analysis Results:
"""
        
        for category, data in sorted(emotion_data.items(), key=lambda x: x[1]['count'], reverse=True):
            percentage = (data['total_duration'] / video.duration * 100) if video.duration else 0
            prompt += f"\n- {category.capitalize()}: {data['count']} occurrences, {data['total_duration']:.1f}s total ({percentage:.1f}%), avg confidence: {data['avg_confidence']:.1%}"
        
        prompt += """

Please provide:
1. Overall emotional state summary (2-3 sentences)
2. Key observations about the patient's emotions
3. Patterns or notable emotional transitions

Keep the response professional, concise, and actionable for therapists.
"""
        
        
        # Generate summary
        response = model.generate_content(prompt)
        summary_text = response.text
        
        print(f"Summary generated ({len(summary_text)} chars)")
        
        # Save to session
        session.summary = summary_text
        session.save(update_fields=['summary'])
        
        
        return {
            "success": True,
            "session_id": str(session_id),
            "video_id": str(video.id),
            "summary_length": len(summary_text)
        }
        
    except Session.DoesNotExist:
        print(f"Session {session_id} not found")
        return {"error": f"Session {session_id} not found"}
        
    except Exception as e:
        print(f"Error generating summary: {e}")
        import traceback
        traceback.print_exc()
        
        # Save error message to session if possible
        try:
            if session:
                session.summary = f"Error generating summary: {str(e)}"
                session.save(update_fields=['summary'])
        except:
            pass
        
        return {"error": str(e)}