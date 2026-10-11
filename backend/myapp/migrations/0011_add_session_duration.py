from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0007_patient_photo_firebase_path_patient_photo_url'),
    ]

    operations = [
        migrations.AddField(
            model_name='video',
            name='duration',
            field=models.FloatField(blank=True, null=True, help_text="video duration in minutes"),
        ),
    ]
