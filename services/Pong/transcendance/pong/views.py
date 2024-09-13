from django.http import JsonResponse, HttpResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from .models import Game
import json

@csrf_exempt
@require_http_methods(["POST"])
def initGame(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    player1 = data.get('player1')
    player2 = data.get('player2')

    if player1 is None or player2 is None:
        print(f'player 1 == {player1} player 2 == {player2}')
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
	
def getPlayerGames(request):
	try:
		data = json.loads(request.body)
	except json.JSONDecodeError as e:
		return JsonResponse({'error': e.msg}, status=403)
	
	user = data['username']

	query = Game.objects.filter(Player1 == user).values() | Game.objects.filter(Player2 == user).values()   # What if no occurence in db ?
	print(f'query: {query}', file=sys.stderr)
	response = []
	for x in query:
		print(f'x: {x.values()}', file=sys.stderr)
		response.append(x.values())

	return JsonResponse({'data': response}, status=200)

def PlayerPlaying(requet):
	try:
		data = json.loads(request.body)
	except json.JSONDecodeError as e:
		return JsonResponse({'error': e.msg}, status=403)

	user = data['username']

	query = Game.objects.filter(Player1 == user, gameEnde == False).values() | Game.objects.filter(Player2 == user, gameEnde == False).values()   # What if no occurence in db ?
	print(f'query: {query}', file=sys.stderr)
	response = []
	for x in query:
		print(f'x: {x.values()}', file=sys.stderr)
		response.append(x.values())

	return JsonResponse({'data': response}, status=200)

def index(request):
    return render(request, 'index.html')

def ping(request):
    return HttpResponse(status=204)
