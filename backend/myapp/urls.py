from django.urls import path
from . import views
from .views import start_session


# Handle CRUD Operations in the application side 



# urlpatterns = [
#     # Patient URLs
#     path('patients/', views.get_all_patients, name='get_all_patients'),
#     path('patient/<uuid:patient_id>/', views.get_patient_data, name='get_patient_data'),
#     path('patients/add/', views.add_patient, name='add_patient'),
#     path('patients/delete/<uuid:patient_id>/', views.delete_patient, name='delete_patient'),
#     path('patients/update/<uuid:patient_id>/', views.update_patient, name='update_patient'),
#     # Sesssion URLs
#     path('sessions/therapist/<uuid:therapist_id>/', views.get_sessions_by_therapist, name='get_sessions_by_therapist'),
#     path('sessions/', views.get_all_sessions, name='get_all_sessions'),
#     path('sessions/<uuid:session_id>/', views.get_session_by_id, name='get_session_by_id'),
#     path('sessions/add/', views.add_session, name='add_session'),
#     path('sessions/delete/<uuid:session_id>/', views.delete_session, name='delete_session'),
#     # Video URLs
#     path('video/<uuid:video_id>/emotions/', views.get_emotions_by_video, name='get_emotions_by_video'),
#     # Clinic URLs
#     path('clinics/', views.get_all_clinics, name='get_all_clinics'),
#     # Therapist(User) URLs
#     path('therapists/', views.get_all_therapists, name='get_all_therapists'),

    
# ]

urlpatterns = [
    # Patient Data
    path('patients/', views.GetAllPatientsView.as_view(), name='get_all_patients'),
    path('patient/<uuid:pk>/', views.GetPatientView.as_view(), name='get_patient'),
    path('patients/add/', views.CreatePatientView.as_view(), name='add_patient'),
    path('patients/update/<uuid:pk>/', views.UpdatePatientView.as_view(), name='update_patient'),
    path('patients/delete/<uuid:pk>/', views.DeletePatientView.as_view(), name='delete_patient'),

    # Patient Photo Management - NEW
    path('patients/<uuid:pk>/upload-photo/', views.UploadPatientPhotoView.as_view(), name='upload_patient_photo'),
    path('patients/<uuid:pk>/delete-photo/', views.DeletePatientPhotoView.as_view(), name='delete_patient_photo'),
    
    # Session Data
    path('sessions/', views.GetAllSessionsView.as_view(), name='get_all_sessions'),
    path('sessions/<uuid:pk>/', views.GetSessionView.as_view(), name='get_session_by_id'),
    path('sessions/add/', views.CreateSessionView.as_view(), name='add_session'),
    path('sessions/delete/<uuid:pk>/', views.DeleteSessionView.as_view(), name='delete_session'),
    path('sessions/update/<uuid:pk>/', views.UpdateSessionView.as_view(), name='update_session'),
    path('sessions/<uuid:pk>/summarize/', views.GenerateSummaryView.as_view(), name='generate_summary_view'),
    # Get Sessions by Therapist ID
    path('sessions/patient/<uuid:patient_id>/', views.GetSessionsByPatientIDView.as_view(), name='get_sessions_by_patient'),
    # clinic data
    path('clinics/', views.GetAllClinicsView.as_view(), name='get_all_clinics'),
    # all user data
    path('therapists/', views.GetAllTherapistsView.as_view(), name='get_all_therapists'),
    path("sessions/start/", start_session, name="start-session"),
]