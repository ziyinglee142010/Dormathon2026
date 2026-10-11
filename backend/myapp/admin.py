from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Clinic, UserProfile, Session, Video, Emotion, Patient

class UserProfileAdmin(UserAdmin):
    pass

# Register your models here.

admin.site.register(Clinic)
admin.site.register(UserProfile,UserProfileAdmin)
admin.site.register(Session)
admin.site.register(Video)
admin.site.register(Emotion)
admin.site.register(Patient)




