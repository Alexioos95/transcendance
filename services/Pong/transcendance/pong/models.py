from django.db import models

class Game(models.Model):
    Player1 = models.CharField(max_length=30, blank=False, unique=False) #remplir tout de suite!
    Player2 = models.CharField(max_length=30, blank=True, unique=False) #remplir tout de suite!
    gameDate = models.DateTimeField()#date de debut de la partie #remplir tout de suite!
    gameEnded = models.BooleanField(default=False)#indiquee si partie finie ou non #champ a remplir en fin de partie
    scorePlayer1 = models.PositiveBigIntegerField()#champ a remplir en fin de partie
    scorePlayer2 = models.PositiveBigIntegerField()#champ a remplir en fin de partie
    winner = models.CharField(max_length=30, blank=True, unique=False)#champ a remplir en fin de partie
