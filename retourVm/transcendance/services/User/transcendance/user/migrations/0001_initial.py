# Generated by Django 5.0.7 on 2024-09-01 17:36

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('Email', models.CharField(max_length=1000, unique=True)),
                ('Username', models.CharField(max_length=30, unique=True)),
                ('Password', models.CharField(blank=True, max_length=1000)),
                ('Avatar', models.CharField(max_length=1000)),
                ('key2FA', models.CharField(max_length=100)),
                ('lastTimeOnline', models.DateTimeField()),
                ('pongLvl', models.PositiveBigIntegerField()),
                ('tetrisLvl', models.PositiveBigIntegerField()),
            ],
        ),
    ]
