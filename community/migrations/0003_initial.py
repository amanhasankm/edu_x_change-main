# Generated by Django 4.2 on 2023-06-19 06:04

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('community', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='community',
            name='moderator',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='moderator_of', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='community',
            name='participants',
            field=models.ManyToManyField(related_name='communities_joined', to=settings.AUTH_USER_MODEL),
        ),
    ]
