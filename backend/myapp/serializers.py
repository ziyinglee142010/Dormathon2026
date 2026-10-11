from rest_framework import serializers
from .models import UserProfile, Clinic, Video, Emotion, Patient, Session

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'clinic', "password"]
        extra_kwargs = {'password': {'write_only': True}} # cannot read password but can write it

    def create(self, validated_data):
        user = UserProfile.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
    
class ClinicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Clinic
        fields = ['id', 'name', 'address', 'phone_number', 'email']

class EmotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Emotion
        fields = ['id', 'category', 'confidence', 'source', 'start_time', 'end_time']

class VideoSerializer(serializers.ModelSerializer):
    emotions = EmotionSerializer(many=True, read_only=True)
    class Meta:
        model = Video
        fields = ['id', 'video_file_path','created_at','session','status','emotions']

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ['id', 'name', 'email', 'date_of_birth', 'gender', 'photo_url', 'photo_firebase_path']

class SessionSerializer(serializers.ModelSerializer):
    # retrieve related fields (therapist, patient, clinic, video)
    patient = PatientSerializer(read_only=True)
    clinic = ClinicSerializer(read_only=True)
    video = VideoSerializer(read_only=True)

    class Meta:
        model = Session
        fields = ['id', 'therapist', 'patient', 'clinic', 'video', 'date','time', 'description', 'notes','summary','zoom_link_host','zoom_link_participant']

class SessionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = ['id', 'therapist', 'patient', 'clinic', 'date', 'time', 'description', 'notes']

class UpdateSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = ['id', 'date', 'description', 'notes']



    





