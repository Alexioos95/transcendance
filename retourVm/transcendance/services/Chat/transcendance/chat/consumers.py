# chat/consumers.py
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
import json
import bleach
from channels.generic.websocket import AsyncWebsocketConsumer
#import jwt

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Définir le nom du groupe de chat (ici, chat_1)
        self.room_group_name = f"chat_{1}"

        # Rejoindre le groupe de chat
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        # Accepter la connexion WebSocket
        await self.accept()

    async def disconnect(self, close_code):
        # Quitter le groupe de chat lors de la déconnexion
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    # Recevoir un message du WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json.get("message", "")

        # Désinfecter le message pour prévenir les attaques XSS
        clean_message = bleach.clean(message, tags=[], attributes={}, strip=True)

        # Envoyer le message désinfecté au groupe de chat
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "chat.message", "message": clean_message}
        )

    # Recevoir un message du groupe de chat
    async def chat_message(self, event):
        message = event["message"]

        # Envoyer le message au WebSocket
        await self.send(text_data=json.dumps({"message": message}))
