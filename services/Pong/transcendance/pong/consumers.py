import json
import asyncio
import random
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async

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
        self.speed = 0.25
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
        return self.score_paddleright >= self.winning_score or self.score_paddleleft >= self.winning_score

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

async  def get_username_from_jwt(self, auth_cookie):
                try:
                    # Décrypter le JWT avec la clé secrète
                    decoded_token = jwt.decode(auth_cookie, os.environ['SERVER_JWT_KEY'], algorithms=["HS256"])
                    # Extraire le nom d'utilisateur du JWT
                    username = decoded_token.get('userName')                    
                    if not username:
                        return None
                    return username
                except Exception as e:
                    return None

class GameConsumer(AsyncWebsocketConsumer):
    games = {}  # Dictionnaire pour stocker les instances de jeux par room_name
    players_in_room = {}

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f"game_{self.room_name}"

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

        await self.accept()
        headers = dict(self.scope["headers"])
        cookies = headers[b"cookie"].decode()
        cookies_dict = dict(item.split("=") for item in cookies.split("; "))
        auth_cookie = cookies_dict.get('auth')
        # Définir le rôle du joueur
        if GameConsumer.players_in_room[self.room_name] == 0:
            self.role = 'paddleLeft'
            self.paddleLeft_name = ''
            if auth_cookie:
                
                self.paddleLeft_name = self.get_username_from_jwt(auth_cookie)
                if self.paddleLeft_name is None: 
                    await self.close()
                    return
            else:
                await self.close()
                return
        else:
            self.role = 'paddleRight'
            self.paddleRight_name = ''
            if auth_cookie:
                self.paddleRight_name = self.get_username_from_jwt(auth_cookie)
                if self.paddleRight_name is None:
                    await self.close()
                    return
            else:
                await self.close()
                return

        GameConsumer.players_in_room[self.room_name] += 1

        # Envoyer un message à tous les consommateurs pour informer du nombre actuel de joueurs
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'player_count_update',
                'player_count': GameConsumer.players_in_room[self.room_name]
            }
        )

        self.player_actions = []

        # Attendre que les deux joueurs se connectent
        while GameConsumer.players_in_room[self.room_name] != 2:
            await asyncio.sleep(0.1)

        asyncio.create_task(self.send_game_updates())

    async def disconnect(self, close_code):
        # Retirer le joueur du groupe
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
                winner = self.paddleLeft_name
            else:
                winner = self.paddleRight_name
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_over',
                    'winner': winner
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
        if player_action:
            self.player_actions.append((self.role, player_action))

    async def process_player_actions(self):
        game = GameConsumer.games[self.room_name]
       
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

        while game.running:
            await self.process_player_actions()
            game.move_ball()

            game_state = {
                "paddleLeft_name": self.paddleLeft_name,
                "paddleRight_name": self.paddleRight_name,
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
                    "radius": game.radius
                },
                "score": [game.score_paddleright, game.score_paddleleft]
            }

            if game.check_game_over():
                winner = game.get_winner()

                if (self.role == 'paddleLeft'):
                    winner: self.paddleLeft_name
                else:
                    winner: self.paddleRight_name
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'game_over',
                        'winner': winner
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
        await self.send(text_data=json.dumps({
            'type': 'game_update',
            'game_state': game_state
        }))

    async def player_count_update(self, event):
        player_count = event['player_count']
        await self.send(text_data=json.dumps({
            'type': 'player_count_update',
            'player_count': player_count
        }))

    async def game_over(self, event):
        winner = event['winner']
        game = GameConsumer.games[self.room_name]

        # Déterminer si ce consommateur est le vainqueur
        if (self.role == 'paddleLeft' and winner == 'Player1') or (self.role == 'paddleRight' and winner == 'Player2'):
            # Obtenir les noms réels des joueurs (à ajuster selon votre logique)
            player1 = self.paddleLeft_name  # Remplacer par la logique réelle pour obtenir le nom du joueur 1
            player2 =  self.paddleRight_name#"Player2"  # Remplacer par la logique réelle pour obtenir le nom du joueur 2

            # Créer un objet Pong pour sauvegarder les résultats du jeu
            pong_game = Pong(
                Player1=player1,
                Player2=player2,
                Winner=winner,
                player1_score=game.score_paddleleft,
                player2_score=game.score_paddleright
            )

            # Utiliser sync_to_async pour sauvegarder l'objet de manière asynchrone
            await sync_to_async(pong_game.save)()

        # Envoyer un message WebSocket au client pour annoncer la fin du jeu
        await self.send(text_data=json.dumps({
            'type': 'game_over',
            'winner': winner
        }))
