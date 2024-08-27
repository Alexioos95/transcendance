from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from .models import Game
import json

def index(request):
    response = render(request, 'index.html')
    response.set_cookie('auth', 'coucou')
    return response

@csrf_exempt
def initGame(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    player1 = data.get('player1')
    player2 = data.get('player2')

    if player1 is None or player2 is None:
        print(f'player 2 == {player1} player 2 == {player2}')
        return JsonResponse({'error': 'player1 and player2 are required'}, status=403)
    
    # Créer une nouvelle instance de Game avec la date actuelle
    game = Game(
        Player1=player1,
        Player2=player2,
        gameDate=timezone.now(), # Utiliser la date et l'heure actuelles
        gameEnded=False,  # Définir les valeurs par défaut
        scorePlayer1=0,
        scorePlayer2=0,
        winner=''
    )
    game.save()
    
    return JsonResponse({'status': 'Game created successfully'}, status=201)
