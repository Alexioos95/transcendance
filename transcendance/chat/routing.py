from django.urls import re_path
from django.urls import path
# from mysite import consumers
from chat import consumers

# from . import consumers

websocket_urlpatterns = [
    path("ws/chat/" , consumers.ChatConsumer.as_asgi()),
]