import json
import asyncio
import random
import sys
import os
import jwt
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async

def result_dir_y():
    sign = -1 if round(random.random() * 100) % 2 != 1 else 1
    return random.random() * sign

class Game:
    def __init__(self):
        # Initialisation des variables du jeu
        self.canvas_width = 100
        self.canvas_height = 100
        self.paddle_width = 2
        self.paddle_height = 20
        self.radius = 1
        self.speed = 0.65
        self.winning_score = 11
        self.x_paddleright = 93
        self.y_paddleright = 40
        self.x_paddleleft = 5
        self.y_paddleleft = 40
        self.x_ball = 50
        self.y_ball = 50
        self.dir_x = -1 if round(random.random() * 100) % 2 != 1 else 1
        self.dir_y = result_dir_y()
        self.score_paddleright = 0
        self.score_paddleleft = 0
        self.running = True

    def point(self):
        if self.x_ball <= 0:
            self.score_paddleright += 1
        else:
            self.score_paddleleft += 1
        self.x_ball = self.canvas_width / 2
        self.y_ball = self.canvas_height / 2
        self.dir_x = -1 if round(random.random() * 100) % 2 != 1 else 1
        self.dir_y = result_dir_y()

    def move_ball(self):
        self.x_ball += self.dir_x * self.speed
        self.y_ball += self.dir_y * self.speed

        if self.x_ball <= 0 or self.x_ball >= self.canvas_width:
            self.point()
        else:
            self.dir_x, self.dir_y = collision(
                self.canvas_width, 
                self.canvas_height, 
                self.paddle_width, 
                self.paddle_height, 
                self.x_paddleleft, 
                self.y_paddleleft, 
                self.x_paddleright, 
                self.y_paddleright, 
                self.x_ball, 
                self.y_ball, 
                self.radius, 
                self.dir_x, 
                self.dir_y
            )

    def check_game_over(self):
        return self.score_paddleright > self.winning_score - 1 or self.score_paddleleft > self.winning_score - 1

    def get_winner(self):
        if self.score_paddleright >= self.winning_score:
            return 'paddleRight'
        else:
            return 'paddleLeft'

def angle(paddle_start_y, paddle_height, x_ball, y_ball, radius, dir_y):
    len_segment = paddle_height / 3
    edge = len_segment / 3
    from_top = y_ball - paddle_start_y
    from_bot = y_ball - (paddle_start_y + paddle_height)

    if from_top >= 0 and from_top <= len_segment:
        if from_top >= 0 and from_top <= edge:
            dir_y += from_bot / 100
        else:
            dir_y -= from_top / 100
    elif from_top >= (len_segment * 2) + 1 and from_top <= paddle_height:
        if from_top > ((len_segment * 2) + edge):
            dir_y += from_top / 100
        else:
            dir_y -= from_bot / 100
    return dir_y

def collision_corner(paddle_width, paddle_height, x_paddleleft, y_paddleleft, x_paddleright, y_paddleright, x_ball, y_ball, radius, dir_x, dir_y):
    if dir_x < 0:
        if ((y_ball - radius) <= (y_paddleleft + paddle_height) and 
            y_ball >= (y_paddleleft + paddle_height) and 
            (x_ball - radius) <= (x_paddleleft + paddle_width) and 
            x_ball >= (x_paddleleft + paddle_width)):
            
            dir_x *= -1
            if dir_y < 0:
                dir_y *= -1
        
        elif ((y_ball + radius) >= y_paddleleft and 
              y_ball <= y_paddleleft and 
              (x_ball - radius) <= (x_paddleleft + paddle_width) and 
              x_ball >= (x_paddleleft + paddle_width)):
            
            dir_x *= -1
            if dir_y > 0:
                dir_y *= -1
        
    elif dir_x > 0:
        if ((y_ball - radius) <= (y_paddleright + paddle_height) and 
            y_ball >= (y_paddleright + paddle_height) and 
            (x_ball + radius) >= x_paddleright and 
            x_ball <= (x_paddleright + paddle_width)):
            
            dir_x *= -1
            if dir_y < 0:
                dir_y *= -1
        
        elif ((y_ball + radius) >= y_paddleright and 
              y_ball <= y_paddleright and 
              (x_ball + radius) >= x_paddleright and 
              x_ball <= (x_paddleright + paddle_width)):
            
            dir_x *= -1
            if dir_y > 0:
                dir_y *= -1
    
    return dir_x, dir_y

def collision_side(paddle_width, paddle_height, x_paddleleft, y_paddleleft, x_paddleright, y_paddleright, x_ball, y_ball, radius, dir_x, dir_y):
    if dir_x < 0 and (x_ball - radius) <= (x_paddleleft + paddle_width) and \
       y_ball >= y_paddleleft and y_ball <= (y_paddleleft + paddle_height):
        dir_y = angle(y_paddleleft, paddle_height, x_ball, y_ball, radius, dir_y)
        dir_x *= -1
    elif dir_x > 0 and (x_ball + radius) >= x_paddleright and \
         y_ball >= y_paddleright and y_ball <= (y_paddleright + paddle_height):
        dir_y = angle(y_paddleright, paddle_height, x_ball, y_ball, radius, dir_y)
        dir_x *= -1
    else:
        dir_x, dir_y = collision_corner(paddle_width, paddle_height, x_paddleleft, y_paddleleft, x_paddleright, y_paddleright, x_ball, y_ball, radius, dir_x, dir_y)
    
    return dir_x, dir_y

def collision_top(paddle_width, paddle_height, x_paddleleft, y_paddleleft, x_paddleright, y_paddleright, x_ball, y_ball, radius, dir_x, dir_y):
    if dir_x < 0 and y_ball < y_paddleleft and (y_ball + radius) >= y_paddleleft:
        if (x_ball + radius) >= x_paddleleft and (x_ball - radius) <= (x_paddleleft + paddle_width):
            dir_y *= -1
    
    elif dir_x > 0 and y_ball < y_paddleright and (y_ball + radius) >= y_paddleright:
        if (x_ball - radius) <= (x_paddleright + paddle_width) and (x_ball + radius) >= x_paddleright:
            dir_y *= -1
    
    return dir_x, dir_y

def collision_bot(paddle_width, paddle_height, x_paddleleft, y_paddleleft, x_paddleright, y_paddleright, x_ball, y_ball, radius, dir_x, dir_y):
    if dir_x < 0 and y_ball > (y_paddleleft + paddle_height) and (y_ball - radius) <= (y_paddleleft + paddle_height):
        if (x_ball + radius) >= x_paddleleft and (x_ball - radius) <= (x_paddleleft + paddle_width):
            dir_y *= -1
    
    elif dir_x > 0 and y_ball > (y_paddleright + paddle_height) and (y_ball - radius) <= (y_paddleright + paddle_height):
        if (x_ball + radius) >= x_paddleright and (x_ball - radius) <= (x_paddleright + paddle_width):
            dir_y *= -1
    
    return dir_x, dir_y

def collision(canvas_width, canvas_height, paddle_width, paddle_height, x_paddleleft, y_paddleleft, x_paddleright, y_paddleright, x_ball, y_ball, radius, dir_x, dir_y):
    if y_ball <= radius or y_ball >= (canvas_height - radius):
        dir_y *= -1
    elif x_ball >= (x_paddleleft + paddle_width) and x_ball <= x_paddleright:
        dir_x, dir_y = collision_side(paddle_width, paddle_height, x_paddleleft, y_paddleleft, x_paddleright, y_paddleright, x_ball, y_ball, radius, dir_x, dir_y)
    elif dir_y > 0:
        dir_x, dir_y = collision_top(paddle_width, paddle_height, x_paddleleft, y_paddleleft, x_paddleright, y_paddleright, x_ball, y_ball, radius, dir_x, dir_y)
    elif dir_y < 0:
        dir_x, dir_y = collision_bot(paddle_width, paddle_height, x_paddleleft, y_paddleleft, x_paddleright, y_paddleright, x_ball, y_ball, radius, dir_x, dir_y)
    
    return dir_x, dir_y


class GameConsumer(AsyncWebsocketConsumer):
    games = {}  # Dictionnaire pour stocker les instances de jeux par room_name
    players_in_room = {}
    
    async  def get_username_from_jwt(self, auth_cookie):
                try:
                    # Décrypter le JWT avec la clé secrète
                    decoded_token = jwt.decode(auth_cookie, os.environ['SERVER_JWT_KEY'], algorithms=["HS256"])
                    # Extraire le nom d'utilisateur du JWT
                    username = decoded_token.get('userName')
                    id = decoded_token.get('id')                  
                    if not username or not id:
                        return None
                    return {'username': username, 'id': id}

                except Exception as e:
                    return None

    @database_sync_to_async
    def get_game(self):
        from .models import Game
        # with transaction.atomic():
        query = Game.objects.filter(Player1__exact=self.user_id, gameEnded__exact=False).order_by('-id') | Game.objects.filter(Player2__exact=self.user_id, gameEnded__exact=False).order_by('-id')
        #return list(Game.objects.all())
        return query.first()

    async def connect(self):
        headers = dict(self.scope["headers"])
        if b"cookie" in headers:
            cookies = headers[b"cookie"].decode()  # Decode les cookies en string
            cookies_dict = dict(item.split("=") for item in cookies.split("; "))  # Parse cookies en dictionnaire
            auth_cookie = cookies_dict.get('auth')  # Récupérer le cookie 'auth'
            print(f'auth cookie == {auth_cookie}', file=sys.stderr)
            if auth_cookie:
                name_id = await self.get_username_from_jwt(auth_cookie)
                if name_id:
                    self.username = name_id["username"]
                    self.user_id = name_id["id"] 
            # decoder le jwt //set sevret dans l'env 
            # requete bdd avec username et partie status false
            # si rien trouve rejeter la co sinon rejoindre le groupe (avec l'id de a partie)
            # attendre le 2nd joueur puis lancer la partie 

        # print(f'coockie == self.user = {self.scope["COOCKIE"]}')
        # all_entries = await get_game() 
        # print(all_entries.values_list())
        # self.dataGame = await (await self.get_game())
        # print(self.dataGame)
        self.dataGame = await self.get_game()
        print(self.dataGame)  # Maintenant, cela devrait fonctionner
        i = 0
        #for game in self.dataGame:
        #    print(f"---Game ID: {game.id}", file=sys.stderr)
        #    print(f"---Player 1: {game.Player1}", file=sys.stderr)
        #    print(f"---Player 2: {game.Player2}", file=sys.stderr)
        #    print("---", file=sys.stderr)
        #    i = i + 1
        print(f"---i = :{i}", file=sys.stderr)
        print(f'---i with complex query: {self.dataGame.id}', file=sys.stderr)
        # self.room_name = self.scope['url_route']['kwargs']['room_name']
        #Recuperer le nom de la room name
        self.room_name = f"Game_{i-1}"
        print(f"room_name = {self.room_name}", file=sys.stderr)
        self.room_group_name = f"game_{self.room_name}"
        print(f"romm_group_name = {self.room_group_name}", file=sys.stderr)

        #id derniere partie en db, ou joueur1 ou joueur2 == id dans jwt

        # Créer une nouvelle instance de jeu si elle n'existe pas
        if self.room_name not in GameConsumer.games:
            GameConsumer.games[self.room_name] = Game()
            GameConsumer.players_in_room[self.room_name] = 0

        # Refuser la connexion si la room est pleine
        if GameConsumer.players_in_room[self.room_name] >= 2:
            await self.close()
            return

        # Ajouter le joueur au groupe de la room
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        self.opponent = None
        await self.accept()
        headers = dict(self.scope["headers"])
        cookies = headers[b"cookie"].decode()
        cookies_dict = dict(item.split("=") for item in cookies.split("; "))
        auth_cookie = cookies_dict.get('auth')
        # Définir le rôle du joueur
        if auth_cookie:
            name_id = await self.get_username_from_jwt(auth_cookie)
            if name_id:
                self.username = name_id["username"]
                self.user_id = name_id["id"] 
                print("titi", file=sys.stderr)
            else: 
                print("trtr", file=sys.stderr)
                await self.close()
                return
        else:
            print("tttt", file=sys.stderr)
            await self.close()
            return
        if GameConsumer.players_in_room[self.room_name] == 0:
            self.role = 'paddleLeft'
        else:
            self.role = 'paddleRight'

        GameConsumer.players_in_room[self.room_name] += 1

        # Envoyer un message à tous les consommateurs pour informer du nombre actuel de joueurs
        print("tutu", file=sys.stderr)
        await self.channel_layer.group_send(
            
            self.room_group_name,
            {
                'type': 'player_count_update',
                'player_count': GameConsumer.players_in_room[self.room_name],
                'username': self.username
            }
        )

        self.player_actions = []

        # Attendre que les deux joueurs se connectent
        print("toto", file=sys.stderr)
        while GameConsumer.players_in_room[self.room_name] != 2:
            print("tata", file=sys.stderr)
            await asyncio.sleep(0.16)

        asyncio.create_task(self.send_game_updates())

    async def disconnect(self, close_code):
        # Retirer le joueur du groupe
        print(f"username: {self.username}", file=sys.stderr)
        print("on est dans disconnect", file=sys.stderr)
        print(f"nombre utilisateur = {GameConsumer.players_in_room[self.room_name]}", file=sys.stderr)
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        # Réduire le nombre de joueurs
        GameConsumer.players_in_room[self.room_name] -= 1

        # Si le nombre de joueurs tombe à 1, déclarer le joueur restant vainqueur
        if GameConsumer.players_in_room[self.room_name] == 1:
            game = GameConsumer.games[self.room_name]

            # Déterminer qui est le joueur restant et le déclarer vainqueur
            remaining_role = 'paddleLeft' if self.role == 'paddleRight' else 'paddleRight'
            winner = 'Player1' if remaining_role == 'paddleLeft' else 'Player2'

            if self.role == 'paddleLeft':
                winner = self.username
            else:
                winner = self.username
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_over',
                    'winner': winner,
                    'game_score_paddleLeft': game.score_paddleleft,
                    'game_score_paddleRight':  game.score_paddleright,
                }
            )

            # Arrêter le jeu en cours
            game.running = False

        # Si aucun joueur ne reste, supprimer le jeu
        if GameConsumer.players_in_room[self.room_name] == 0:
            del GameConsumer.games[self.room_name]

        # Informer tous les autres joueurs de la room du nouveau nombre de joueurs
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'player_count_update',
                'player_count': GameConsumer.players_in_room[self.room_name]
            }
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        player_action = data.get('key')
        print("momo", file=sys.stderr)
        if player_action:
            print("mumu", file=sys.stderr)
            self.player_actions.append((self.role, player_action))

    async def process_player_actions(self):
        game = GameConsumer.games[self.room_name]
        print("riri", file=sys.stderr)
        for role, action in self.player_actions:
            if role == 'paddleRight':
                if action == 'w' or action == 'ArrowUp' or action == 'top':
                    game.y_paddleright -= 1
                    if game.y_paddleright < 0:
                        game.y_paddleright = 0
                elif action == 's' or action == 'ArrowDown' or action == 'bot':
                    game.y_paddleright += 1
                    if game.y_paddleright > 80:
                        game.y_paddleright = 80
            elif role == 'paddleLeft':
                if action == 'w' or action == 'ArrowUp' or action == 'top':
                    game.y_paddleleft -= 1
                    if game.y_paddleleft < 0:
                        game.y_paddleleft = 0
                elif action == 's' or action == 'ArrowDown' or action == 'bot':
                    game.y_paddleleft += 1
                    if game.y_paddleleft > 80:
                        game.y_paddleleft = 80

        self.player_actions = []

    async def send_game_updates(self):
        game = GameConsumer.games[self.room_name]
        print("fifi", file=sys.stderr)
        while game.running:
            await self.process_player_actions()
            game.move_ball()
            game_state = {
                "username": self.username,
                "canvas_width": game.canvas_width,
                "canvas_height": game.canvas_height,
                "paddle_width": game.paddle_width,
                "paddle_height": game.paddle_height,
                "x_paddleRight": game.x_paddleright,
                "y_paddleRight": game.y_paddleright,
                "x_paddleLeft": game.x_paddleleft,
                "y_paddleLeft": game.y_paddleleft,
                "ball": {
                    "x": game.x_ball,
                    "y": game.y_ball,
                    "radius": game.radius,
                "game_score_paddleLeft": game.score_paddleleft,
                "game_score_paddleRight":  game.score_paddleright,
                },
                # "score": [game.score_paddleleft, game.score_paddleright]
            }

            if game.check_game_over():
                #print(f"game_score_paddleLeft: {game.score_paddleleft}", file=sys.stderr)
                #print(f"game_score_paddleRight: {game.score_paddleRight}", file=sys.stderr)
                winner = game.get_winner()
                print("loulou", file=sys.stderr)
                if (self.role == 'paddleLeft'):
                    winner: self.paddleLeft_name
                else:
                    winner: self.paddleRight_name
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'game_over',
                        'winner': winner,
                        'game_score_paddleLeft': game.score_paddleleft,
                        'game_score_paddleRight':  game.score_paddleright,
                    }
                )
                game.running = False
                continue

            await self.channel_layer.group_send(
                

                self.room_group_name,
                {
                    'type': 'game_update',
                    'game_state': game_state
                    
                }
            )

            await asyncio.sleep(0.016)

    async def game_update(self, event):
        game_state = event['game_state']
        nameRight = None
        nameLeft = None
        print("coco", file=sys.stderr)
        if self.role == 'paddleLeft':
            nameLeft = self.username
            nameRight = self.opponent
        else:
            nameRight = self.username
            nameLeft = self.opponent
        print(f"nameright: {nameRight}", file=sys.stderr)
        print(f"nameLeft: {nameLeft}", file=sys.stderr)
        await self.send(text_data=json.dumps({
            'type': 'game_update',
            'game_state': game_state,
            'nameRight':nameRight,
            'nameLeft': nameLeft
        }))

    async def player_count_update(self, event):
        print("pupu", file=sys.stderr)
        player_count = event['player_count']
        self.opponent = event['username']
        await self.send(text_data=json.dumps({
            'type': 'player_count_update',
            'player_count': player_count
        }))

    async def game_over(self, event):
        print("ploplo", file=sys.stderr)
        winner = event['winner']
        game = GameConsumer.games[self.room_name]
        print("on est dans gameover", file=sys.stderr)
        # Déterminer si ce consommateur est le vainqueur
        print(f'----self.role: {self.role}, winner: {winner}', file=sys.stderr)
        if (self.role == 'paddleLeft' and winner == 'paddleLeft') or (self.role == 'paddleRight' and winner == 'paddleRight'):
            # Obtenir les noms réels des joueurs (à ajuster selon votre logique)
            # player1 = self.paddleLeft_name  # Remplacer par la logique réelle pour obtenir le nom du joueur 1
            # player2 =  self.paddleRight_name#"Player2"  # Remplacer par la logique réelle pour obtenir le nom du joueur 2

            print('WRITING TO DB', file=sys.stderr)

            # Créer un objet Pong pour sauvegarder les résultats du jeu
        #    pong_game = Game(
        #        Player1=player1,
        #        Player2=player2,
        #        gameEnded=True,
        #        scorePlayer1=game.score_paddleleft,
        #        scorePlayer2=game.score_paddleright,
        #        winner=winner,
        #    )
            self.dataGame.gameEnded=True
            self.dataGame.winner=winner

            # Utiliser sync_to_async pour sauvegarder l'objet de manière asynchrone
            await sync_to_async(self.dataGame.save)()

        # Envoyer un message WebSocket au client pour annoncer la fin du jeu
        print("brubru", file=sys.stderr)
        await self.send(text_data=json.dumps({
            'type': 'game_over',
            'winner': winner
        }))
        self.close()
