from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging
import asyncio
import time
from tetris import tetrisGame as tetrisFct
from channels.db import database_sync_to_async
from django.db import transaction

logger = logging.getLogger(__name__)

class Consumer(AsyncWebsocketConsumer):
    active_connections = set()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.logger = logging.getLogger(__name__)
        self.game_task = None
        self.instance_id = None

    async def connect(self):
        from .models import Game
        self.__class__.active_connections.add(self.channel_name)
        headers = dict(self.scope["headers"])
        if b"cookie" in headers:
            cookies = headers[b"cookie"].decode()  # Decode les cookies en string
            cookies_dict = dict(item.split("=") for item in cookies.split("; "))  # Parse cookies en dictionnaire
            auth_cookie = cookies_dict.get('auth')  # Récupérer le cookie 'auth'
            print(f'auth cookie == {auth_cookie}')
            # decoder le jwt
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
        for game in self.dataGame:
            print(f"Game ID: {game.id}")
            print(f"Player 1: {game.Player1}")
            print(f"Player 2: {game.Player2}")
            print("---")
        self.nb = len(self.__class__.active_connections)
        while len(self.__class__.active_connections) != 2:
            await asyncio.sleep(0.5)
            print(len(self.__class__.active_connections))
        print(len(self.__class__.active_connections))
        await self.accept()
        print('Channel name == ', self.channel_name)
        self.map = [['#FFFFFF' for _ in range(10)] for _ in range(20)]
        self.map2 = [['#FFFFFF' for _ in range(10)] for _ in range(20)]        
        await self.channel_layer.group_add("tetris", self.channel_name)
        self.logger.info('WebSocket connection established.')
        self.start_time = time.time()
        self.game_task = asyncio.create_task(self.game())
        self.current_piece = tetrisFct.get_next_piece()
        self.next_piece = tetrisFct.get_next_piece()
        self.nb_line = 0
        self.lineToSend = 0
        self.current_piece2 = ''
        self.next_piece2 = ''
        self.lineToAdd = 0
        self.nb_line2 = 0
        self.oldRand = -1
        self.event = []
        self.lock = asyncio.Lock()
        self.lastEvent = 0
        self.dropSpeed = 0.75
        self.dropSpeed2 = self.dropSpeed / 5
        self.currentDropSpeed = self.dropSpeed

    @database_sync_to_async
    def get_game(self):
        from .models import Game
        # with transaction.atomic():
        return list(Game.objects.all())

    # @database_sync_to_async
    # def get_game(self):
    #     from .models import Game
    #     return database_sync_to_async(lambda: Game.objects.all())()

    # @database_sync_to_async
    # def get_game(self):
    #     from .models import Game
    #     return Game.objects.all()  # Directly return the QuerySet

    async def disconnect(self, close_code):
        self.logger.info(f'Disconnected with code {close_code}.')
        if self.game_task:
            self.game_task.cancel()
        self.__class__.active_connections.remove(self.channel_name)

        await self.channel_layer.group_discard("tetris", self.channel_name)
        self.logger.info(f'Connection removed. Current connections: {len(self.__class__.active_connections)}')

    async def receive(self, text_data):
        # Décoder le JSON reçu
        text_data_json = json.loads(text_data)

        # Extraire le message
        message = text_data_json.get('message', None)
        currentTime = time.time()
        # Vérifier le message et appeler les fonctions appropriées
        allowed_actions = ['PressArrowUp','PressArrowLeft', 'PressArrowRight', 'PressArrowDown', 'ReleaseArrowDown']
        if message not in allowed_actions:
            return
        # catch arrowdown pour etre sur que l'acceleration s'arrete
        async with self.lock:
            if currentTime > (self.lastEvent + 0.05):
                self.event.append(message)
                self.lastEvent = currentTime
        # if message == 'a' or message == 'ArrowUp' or message == 'd':
        #     tetrisFct.rotate_piece(self, message)
        # elif message == 'ArrowLeft':
        #     tetrisFct.lateralMove(-1, self.map, self.current_piece)
        # elif message == 'ArrowRight':
        #     tetrisFct.lateralMove(1, self.map, self.current_piece)
        # elif message == 'ArrowDown':
        #     tetrisFct.drop_piece(self)


        # def to_dict(self):
        #     return {
        #         'map': self.map,
    #         'current_piece': self.game1Data.current_piece, default=tetrisFct.custom_serializer,
    #         'next_piece': self.game1Data.next_piece, default=tetrisFct.custom_serializer,
    #         'nb_line': self.nb_line
    #     }

    async def tetris_message(self, event):
        map2 = event['map']
        current_piece2 = event['current']
        next_piece2 = event['next']
        line2 = event['line']
        # print(f"Test message received: {line2}")
        # print(event.get('sender'))
        if event.get('sender') != self.channel_name:
            # print(f"le message recu par: {self.nb} est {message}")
            self.map2 = map2
            self.current_piece2 = current_piece2
            self.next_piece2 = next_piece2
            self.lineToAdd = line2
            if self.lineToAdd != 0:
                print(f'consuemer{self.nb} line to add dans reception == {self.lineToAdd}')

    async def game(self):
        drop_time = time.time()
        while True:
            if self.lineToAdd != 0:
                print(f'consuemer{self.nb} line to send dans game loop == {self.lineToSend}')
            if self.lineToAdd != 0:
                print(f'consuemer{self.nb} line to adddansloop game == {self.lineToAdd}')
            # raise Exception("wtf ?")
            current_time = time.time()
            elapsed_time = current_time - self.start_time
            # Envoyer un message de test
            # if elapsed_time >= 0.12:
            # await self.channel_layer.group_send(
            #     "tetris",
            #     {
            #         'type': 'tetris_message',
            #         'message': 'Test message'
            #     }
            # )
            # print(f"je suis le consimer: {self.nb} et j'envoie au groupe")
            # try:

            if self.lineToAdd != 0:
                tetrisFct.add_line(self)
                self.lineToAdd = 0
            try:
                async with self.lock:
                    if self.event:
                        print(self.event)
                        action = self.event.pop()
                        print(self.event)
                        print(f'action == {action}')
                        if action == 'PressArrowUp':
                            tetrisFct.rotate_piece(self, action)
                        elif action == 'PressArrowLeft':
                            tetrisFct.lateralMove(-1, self.map, self.current_piece)
                        elif action == 'PressArrowRight':
                            tetrisFct.lateralMove(1, self.map, self.current_piece)
                        elif action == 'PressArrowDown':
                            self.currentDropSpeed = self.dropSpeed2
                        elif action == 'ReleaseArrowDown':
                            self.currentDropSpeed = self.dropSpeed
            except Esception as e:
                print(f'ceci est un catch : {e}')
            # print(f'consuemer{self.nb} line to add apres reset dans game loop == {self.lineToSend}')
            if current_time - drop_time > self.currentDropSpeed:
                tetrisFct.drop_piece(self)
                drop_time = time.time()
            # except Exception as e:
                # print(f'exeception == {e}')
            try:
                await self.channel_layer.group_send(
                "tetris",
                {
                    'sender': self.channel_name,
                    'type': 'tetris_message',
                    'map': self.map,
                    'current': json.dumps(self.current_piece, default=tetrisFct.custom_serializer),
                    'next': json.dumps(self.next_piece, default=tetrisFct.custom_serializer),
                    'line': self.lineToSend,
                }
            )
            except Exception as e:
                print(f"Error in group_send: {e}")
            self.lineToSend = 0
            # print(f'consuemer{self.nb} line to send apres reset dans loop game  == {self.lineToAdd}')
            # game2_data = {
            #     'map': self.game2Data.map,
            #     'current': json.dumps(self.game2Data.current_piece, default=tetrisFct.custom_serializer),
            #     'next': json.dumps(self.game2Data.next_piece, default=tetrisFct.custom_serializer),
            #     'line': self.game2Data.nb_line
            # }
            # print(f"je suis le consimer: {self.nb} et j'ai envoye au groupe")
            # try:
            #     json_data = json.dumps(self.current_piece, default=tetrisFct.custom_serializer)
            # except (TypeError, OverflowError) as e:
            #     print(f"Serialization error: {e}")

            if elapsed_time >= 0.05:
                try:
                    game_data = {
                        'map': self.map,
                        'current': json.dumps(self.current_piece, default=tetrisFct.custom_serializer),
                        'next': json.dumps(self.next_piece, default=tetrisFct.custom_serializer),
                        'line': self.nb_line}
                    game_data2 = {
                        'map2': self.map2,
                        'current2': self.current_piece2,
                        'next2': self.next_piece2,
                        'line2': self.nb_line2}
                    combined_data = {
                        "game1": game_data,
                        "game2": game_data2
                    }
                    # print(f'{self.nb} envoie {combined_data}')
                    await self.send(text_data=json.dumps(combined_data))
                except Exception as e:
                    print(f'exception == {e}')
                self.start_time = time.time()
            # await self.send(text_data=json.dumps(f'ce message est envoye par {self.nb}'))
            await asyncio.sleep(0.04)
