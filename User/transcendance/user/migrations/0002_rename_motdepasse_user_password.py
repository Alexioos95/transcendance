# Generated by Django 5.0.7 on 2024-08-06 17:04

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='user',
            old_name='MotDePasse',
            new_name='Password',
        ),
    ]
