from django.db import models
# from django.contrib.postgres.fields import ArrayField

# Create your models here.
class User(models.Model):
    Email = models.CharField(max_length=1000, blank=False, unique=True)
    Username = models.CharField(max_length=30, blank=False, unique=True)
    Password = models.CharField(max_length=1000, blank=True) #hash
    Avatar = models.CharField(max_length=1000)
    Language = models.TextChoices("LangType", "FR")
    twoFA = models.TextChoices("2fatype", "NONE MAIL APK")
    key2FA = models.CharField(max_length=100)
    lastTimeOnline = models.DateTimeField() # instance de datetime.date //si inferieur a temps ?30s? l'user est connecte //date
    # friendsList = ArrayField(models.CharField(max_length=30, blank=True))
    # foeList = ArrayField(models.CharField(max_length=30, blank=True))
    pongLvl = models.PositiveBigIntegerField()
    tetrisLvl = models.PositiveBigIntegerField() #start a 0 pas de negatif +1 -1 win loose
