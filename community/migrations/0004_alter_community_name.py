# Generated by Django 4.2 on 2023-06-20 14:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('community', '0003_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='community',
            name='name',
            field=models.CharField(db_collation='utf8mb4_bin', max_length=25),
        ),
    ]
