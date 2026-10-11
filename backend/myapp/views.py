from django.shortcuts import render
from django.http import JsonResponse
from .models import UserProfile, Patient, Session, Clinic, Video, Emotion ,REPORT_STATUSES
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
from django.conf import settings


from rest_framework import generics, status
from .serializers import UserSerializer, ClinicSerializer, PatientSerializer, SessionCreateSerializer, SessionSerializer, UpdateSessionSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.parsers import JSONParser
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from .zoom import get_zoom_s2s_token
from rest_framework import status
from rest_framework.response import Response
from myapp.tasks import generate_video_summary
from firebase_admin import storage

import requests
import json

### Patient ###

# create a new patient
class CreatePatientView(generics.CreateAPIView):
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]  # Only authenticated users can create patients

# get all patients
class GetAllPatientsView(generics.ListAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]  # Only authenticated users can view patients
    

# get a single patient
class GetPatientView(generics.RetrieveAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]  # Only authenticated users can view patients

# update a patient
class UpdatePatientView(generics.UpdateAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]  # Only authenticated users can update patients
# delete a patient
class DeletePatientView(generics.DestroyAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]  # Only authenticated users can delete patients


class UploadPatientPhotoView(generics.UpdateAPIView):
    """
    Upload patient photo to Firebase Storage
    
    PATCH /api/patients/{pk}/upload-photo/
    Body (multipart/form-data):
        - photo: file
    """
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def update(self, request, *args, **kwargs):
        import traceback
        
        patient = self.get_object()

        # Check for uploaded file
        photo_file = request.FILES.get('photo')
        if not photo_file:
            return Response({'error': 'No photo file provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate type and size
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if photo_file.content_type not in allowed_types:
            return Response(
                {'error': f'Invalid file type. Allowed types: {", ".join(allowed_types)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if photo_file.size > 10 * 1024 * 1024:  # 10 MB
            return Response({'error': 'File size too large. Max 10MB.'}, status=status.HTTP_400_BAD_REQUEST)

        print("="*50)
        print("Request FILES:", request.FILES)
        print("Photo file:", photo_file.name)
        print("="*50)

        try:
            # Delete old photo if exists
            if patient.photo_firebase_path:
                try:
                    print("Attempting to delete old photo...")
                    bucket = storage.bucket()
                    print(f"Bucket: {bucket}")
                    old_blob = bucket.blob(patient.photo_firebase_path)
                    old_blob.delete()
                    print(f"✓ Deleted old photo: {patient.photo_firebase_path}")
                except Exception as e:
                    print(f"⚠ Warning: Could not delete old photo: {e}")
                    traceback.print_exc()

            # Upload new photo
            print("Starting upload...")
            bucket = storage.bucket()
            print(f"Bucket obtained: {bucket}")
            
            if bucket is None:
                raise Exception("Firebase Storage bucket is None. Check your Firebase initialization.")
            
            ext = photo_file.name.split('.')[-1]
            blob_path = f'patients/{patient.id}/profile.{ext}'
            print(f"Blob path: {blob_path}")
            
            blob = bucket.blob(blob_path)
            print(f"Blob created: {blob}")
            
            # Reset file pointer and read content
            photo_file.seek(0)
            file_content = photo_file.read()
            print(f"File content read: {len(file_content)} bytes")
            
            # Upload from string (bytes)
            print("Uploading to Firebase...")
            blob.upload_from_string(
                file_content,
                content_type=photo_file.content_type
            )
            print("✓ Upload complete")
            
            print("Making blob public...")
            blob.make_public()
            print("✓ Blob is now public")

            # Save URL + path
            patient.photo_url = blob.public_url
            patient.photo_firebase_path = blob_path
            patient.save()
            print(f"✓ Patient updated with photo URL: {blob.public_url}")

            serializer = self.get_serializer(patient)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            print("="*50)
            print("❌ ERROR OCCURRED:")
            print(f"Error type: {type(e).__name__}")
            print(f"Error message: {str(e)}")
            print("\nFull traceback:")
            traceback.print_exc()
            print("="*50)
            return Response(
                {'error': f'Upload failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# Delete patient photo
class DeletePatientPhotoView(generics.DestroyAPIView):
    """
    DELETE /api/patients/{pk}/delete-photo/
    Deletes patient photo from Firebase Storage
    """
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        patient = self.get_object()

        if not patient.photo_firebase_path:
            return Response({'error': 'No photo found for this patient'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Delete photo from Firebase
            bucket = storage.bucket()
            blob = bucket.blob(patient.photo_firebase_path)
            blob.delete()

            # Clear fields
            patient.photo_url = None
            patient.photo_firebase_path = None
            patient.save()

            return Response({'message': 'Photo deleted successfully'}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': f'Failed to delete photo: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



### Session ###

# TODO only therapist can create, view, update and delete their own sessions

# Create a new session
class CreateSessionView(generics.CreateAPIView):
    queryset = Session.objects.all()
    serializer_class = SessionCreateSerializer
    permission_classes = [AllowAny]  # Only authenticated users can create sessionss

    def perform_create(self, serializer):
        session = serializer.save()
        try:
            token = get_zoom_s2s_token()
            # create a new zoom meeting and save the link to the session
            headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
            payload = {
                "topic": "Therapy Session",
                "type": 1,  # instant meeting
                "settings": {
                    "join_before_host": True,
                    "waiting_room": False,
                    "auto_recording": "none",  # MVP: therapist records manually
                },
            }
            z = requests.post("https://api.zoom.us/v2/users/me/meetings", json=payload, headers=headers, timeout=15)
            if not z.ok:
                return Response({"error": "Zoom create failed", "detail": z.text}, status=z.status_code)
            data = z.json()
            session.zoom_link_host = data["start_url"]
            session.zoom_link_participant = data["join_url"]
            session.save()
        except Exception as e:
            print(f"Error creating Zoom meeting: {e}")
            return Response({"error": "Zoom create failed", "detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        

# Get Sessions based on Patient ID
class GetSessionsByPatientIDView(generics.ListAPIView):
    serializer_class = SessionSerializer
    permission_classes = [IsAuthenticated]  # Only authenticated users can view sessions

    def get_queryset(self):
        patient_id = self.kwargs['patient_id']
        return Session.objects.filter(patient__id=patient_id).order_by('-date')
       
# get all sessions
class GetAllSessionsView(generics.ListAPIView):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    permission_classes = [AllowAny]  # Only authenticated users can view sessions

# View a single session
class GetSessionView(generics.RetrieveAPIView):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    permission_classes = [AllowAny]  # Only authenticated users can view sessions

# Generate Summary
class GenerateSummaryView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self,request,pk):
        generate_video_summary.delay(pk)
        return Response({"message": "Summary generation started."}, status=status.HTTP_202_ACCEPTED)


# update a session
class UpdateSessionView(generics.UpdateAPIView):
    queryset = Session.objects.all()
    serializer_class = UpdateSessionSerializer
    permission_classes = [AllowAny]
    parser_classes = [JSONParser]

    def perform_update(self, serializer):
        session = serializer.save()
        video_url = self.request.data.get("video_file_path")
        if video_url:
            Video.objects.update_or_create(
                session=session,
                defaults={
                    "video_file_path": video_url,
                    "status": REPORT_STATUSES.pending
                }
            )


# delete a session
class DeleteSessionView(generics.DestroyAPIView):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    permission_classes = [AllowAny]  # Only authenticated users can delete sessions

    
### Therapist (UserProfile) ###

# get all therapists/user profiles
class GetAllTherapistsView(generics.ListAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]  # Only authenticated users can view therapists


### Clinic ###

# get all clinics
class GetAllClinicsView(generics.ListAPIView):
    queryset = Clinic.objects.all()
    serializer_class = ClinicSerializer
    permission_classes = [IsAuthenticated]  # Only authenticated users can view clinics

### Zoom ###
@api_view(["POST"])
@permission_classes([AllowAny])  # for quick testing
def start_session(request):
    token = get_zoom_s2s_token()
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    payload = {
        "topic": "Therapy Session",
        "type": 1,  # instant meeting
        "settings": {
            "join_before_host": True,
            "waiting_room": False,
            "auto_recording": "none",  # MVP: therapist records manually
        },
    }

    z = requests.post("https://api.zoom.us/v2/users/me/meetings", json=payload, headers=headers, timeout=15)
    if not z.ok:
        return Response({"error": "Zoom create failed", "detail": z.text}, status=z.status_code)

    data = z.json()
    zoom_link_host = data["start_url"]
    zoom_link_participant = data["join_url"]

    # Send Zoom link to patient email 
    patient_id = request.data.get("patient")
    if not patient_id:
        return Response({"error": "Missing patient ID"}, status=400)

    try:
        patient = Patient.objects.get(id=patient_id)
    except Patient.DoesNotExist:
        return Response({"error": "Patient not found"}, status=404)

    send_mail(
        subject="Your Therapy Session Link",
        message=(
            f"Hello {patient.name},\n\n"
            f"This is {request.user.username if request.user.is_authenticated else 'your therapist'}.\n\n"
            f"I’ve started our therapy session.\n\n"
            f"You can join using the Zoom link below:\n{zoom_link_participant}\n\n"
            f"Looking forward to speaking with you soon.\n\n"
            f"Best regards,\n"
            f"{request.user.username if request.user.is_authenticated else 'Your Therapist'}"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[patient.email],
        fail_silently=False,
    )

    return Response(
        {"zoom_link": zoom_link_host, "join_url": zoom_link_participant},
        status=status.HTTP_201_CREATED
    )
