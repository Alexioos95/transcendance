from django.http import JsonResponse, HttpResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from .models import Game
import json
import sys


@csrf_exempt
@require_http_methods(["POST"])
def initGame(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=403)
    
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
	
@csrf_exempt
@require_http_methods(["POST"])
def getPlayerGames(request):
	try:
		data = json.loads(request.body)
	except json.JSONDecodeError as e:
		return JsonResponse({'error': e.msg}, status=403)
	
	user = data['username']

	query = Game.objects.filter(Player1 == user) | Game.objects.filter(Player2 == user)   # What if no occurence in db ?
	print(f'query: {query}', file=sys.stderr)
	response = []
	for x in query:
		print(f'x: {x.values()}', file=sys.stderr)
		response.append(x.values())

	return JsonResponse({'data': response}, status=200)

@csrf_exempt
@require_http_methods(["POST"])
def PlayerPlaying(request):
	print(f'Can It print ??!', file=sys.stderr)
	print(f'PlayerPlaying data: {request.body}', file=sys.stderr)
	try:
		data = json.loads(request.body)
	except json.JSONDecodeError as e:
		print(f'PlayerPlaying : Coucou msg= {e.msg}', file=sys.stderr)
		return JsonResponse({'error': e.msg}, status=403)
	if 'username' not in data:
		return JsonResponse({'error': 'invalid Json'}, status=403)
	user = data['username']
	print(f'PlayerPlaying username: {data['username']}', file=sys.stderr)

	# query = Game.objects.all()
	query = Game.objects.filter(Player1__exact=user, gameEnded__exact=False) | Game.objects.filter(Player2__exact=user, gameEnded__exact=False)   # What if no occurence in db ? # Should only return 1 occurence
	if not query:
		print(f'emptyquery', file=sys.stderr)
		return HttpResponse(status=418)
	print(f'query: {query}', file=sys.stderr)
	for x in query: # To debug print
		print(f'x: {x.values()}', file=sys.stderr)
	return HttpResponse(status=200)

def index(request):	# A virer ?
    return render(request, 'index.html')

@csrf_exempt
@require_http_methods(["GET"])
def ping(request):
    return HttpResponse(status=204)
