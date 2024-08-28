from django.urls import re_path
from django.urls import path
from chat import consumers

websocket_urlpatterns = [
    path("ws/chat/" , consumers.ChatConsumer.as_asgi()),
]
