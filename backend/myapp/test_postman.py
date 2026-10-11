import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from myapp.models import Patient, Session
from firebase_admin import storage
from datetime import timedelta

def get_test_data():
    """Get all data needed for Postman testing"""
    
    # Get patient
    patient = Patient.objects.last()
    if not patient:
        print("❌ No patient found. Create a patient first!")
        return
    
    # Get session
    session = Session.objects.filter(patient=patient).last()
    if not session:
        print("❌ No session found. Create a session first!")
        return
    
    # Generate URLs
    bucket = storage.bucket()
    
    # Video URL (get from latest video or use example)
    video = session.video if hasattr(session, 'video') and session.video else None
    if video and video.video_file_path:
        video_blob = bucket.blob(video.video_file_path)
        video_url = video_blob.generate_signed_url(
            version="v4",
            expiration=timedelta(hours=2),
            method="GET"
        )
    else:
        video_url = "No video found"
    
    # Photo URL
    if patient.photo_firebase_path:
        photo_blob = bucket.blob(patient.photo_firebase_path)
        photo_url = photo_blob.generate_signed_url(
            version="v4",
            expiration=timedelta(hours=2),
            method="GET"
        )
    else:
        photo_url = "No photo found"
    
    print("=" * 70)
    print("POSTMAN TEST DATA")
    print("=" * 70)
    print(f"\nPatient ID: {patient.id}")
    print(f"Patient Name: {patient.name}")
    print(f"\nSession ID: {session.id}")
    
    if video:
        print(f"\nVideo ID: {video.id}")
        print(f"Video Status: {video.get_status_display()}")
    
    print("\n" + "=" * 70)
    print("ML SERVICE TEST (POST /analyze)")
    print("=" * 70)
    print("\nJSON Body:")
    print(f"""{{
  "video_url": "{video_url}",
  "patient_photo_url": "{photo_url}",
  "frame_interval": 60
}}""")
    
    print("\n" + "=" * 70)
    print("DJANGO BACKEND TEST (POST /api/videos/)")
    print("=" * 70)
    print("\nJSON Body:")
    print(f"""{{
  "session": "{session.id}",
  "video_file_path": "videos/{session.id}/test-video.mp4"
}}""")
    
    print("\n" + "=" * 70)

if __name__ == "__main__":
    get_test_data()