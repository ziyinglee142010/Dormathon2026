# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0007_patient_photo_firebase_path_patient_photo_url'),  # Use your last migration number
    ]

    operations = [
        migrations.AddField(
            model_name='session',
            name='summary',
            field=models.TextField(blank=True, null=True),
        ),
    ]
