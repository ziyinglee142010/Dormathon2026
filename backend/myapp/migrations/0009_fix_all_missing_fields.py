from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0007_patient_photo_firebase_path_patient_photo_url'),
    ]

    operations = [
        # Session fields
      
        migrations.AddField(
            model_name='session',
            name='zoom_link_host',
            field=models.URLField(blank=True, null=True, max_length=500),
        ),
        migrations.AddField(
            model_name='session',
            name='zoom_link_participant',
            field=models.URLField(blank=True, null=True, max_length=500),
        ),
    ]
