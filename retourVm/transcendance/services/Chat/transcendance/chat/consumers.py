from channels.generic.websocket import AsyncWebsocketConsumer
import json
import bleach
import jwt
import os
import time

# Exception personnalisée pour gérer les erreurs spécifiques
class customException(Exception):
    def __init__(self, data, code):
        super().__init__(data)
        self.data = data
        self.code = code

    def __str__(self):
        return f"Error {self.code}: {self.data}"

# ChatConsumer pour gérer les connexions WebSocket
class ChatConsumer(AsyncWebsocketConsumer):
    # Fonction pour récupérer le nom d'utilisateur à partir du JWT
    def get_username_from_jwt(self, auth_cookie):
        try:
            # Décrypter le JWT avec la clé secrète
            decoded_token = jwt.decode(auth_cookie, os.environ['SERVER_JWT_KEY'], algorithms=["HS256"])
            
            # Extraire le nom d'utilisateur du JWT
            username = decoded_token.get('userName')
            if not username:
                raise customException("Invalid token structure", 403)
            
            # Vérifier si le token est expiré
            expiration_date = decoded_token.get("expirationDate")
            if expiration_date and expiration_date < time.time():
                raise customException("Token expired", 401)

            return username

        except jwt.InvalidTokenError:
            # Gérer les erreurs de token JWT invalide
            raise customException("Forbidden", 403)

        except KeyError:
            # Gérer les erreurs de structure du token
            raise customException("Malformed token", 400)

    async def connect(self):
        # Extraire les headers pour récupérer les cookies
        headers = dict(self.scope["headers"])

        # Extraire le cookie JWT depuis les headers
        if b"cookie" in headers:
            cookies = headers[b"cookie"].decode()  # Décoder les cookies en chaîne de caractères
            cookies_dict = dict(item.split("=") for item in cookies.split("; "))  # Parse cookies en dictionnaire
            auth_cookie = cookies_dict.get('auth')  # Récupérer le cookie 'auth'

            # Si le cookie auth est trouvé, décoder le JWT pour obtenir le nom d'utilisateur
            if auth_cookie:
                try:
                    username = self.get_username_from_jwt(auth_cookie)
                except customException as e:
                    # Si le JWT est invalide, on ferme la connexion
                    await self.close()
                    return
            else:
                # Si le cookie auth n'est pas trouvé, fermer la connexion
                await self.close()
                return
        else:
            # Si aucun cookie n'est présent, fermer la connexion
            await self.close()
            return

        # Si le JWT est valide, définir le nom du groupe de chat (ici, chat_1)
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
        headers = dict(self.scope["headers"])

        # Extraire le cookie JWT depuis les headers
        if b"cookie" in headers:
            cookies = headers[b"cookie"].decode()  # Décoder les cookies en chaîne de caractères
            cookies_dict = dict(item.split("=") for item in cookies.split("; "))  # Parse cookies en dictionnaire
            auth_cookie = cookies_dict.get('auth')  # Récupérer le cookie 'auth'

            # Si le cookie auth est trouvé, décoder le JWT pour obtenir le nom d'utilisateur
            if auth_cookie:
                try:
                    username = self.get_username_from_jwt(auth_cookie)
                except customException as e:
                    # Si une erreur JWT est détectée, fermer la connexion
                    await self.close()
                    return
            else:
                await self.close()
                return
        else:
            await self.close()
            return

        # Décoder le message reçu
        data = json.loads(text_data)
        message = data.get('message', '')

        # Nettoyer le message avec bleach pour protéger contre les attaques XSS
        clean_message = bleach.clean(message, tags=[], attributes={}, strip=True)

        # Construire un message avec le nom d'utilisateur à la place du titre
        final_message = f"{clean_message}"

        # Envoyer le message à tous les utilisateurs dans le groupe
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'user': username
                'type': 'chat_message',
                'message': final_message
            }
        )

    # Recevoir un message du groupe de chat
    async def chat_message(self, event):
        message = event["message"]

        # Envoyer le message au WebSocket
        await self.send(text_data=json.dumps({"message": message}))
