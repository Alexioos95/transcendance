from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from tetrisApp import consumers

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": URLRouter([
        path('ws/tetris/', consumers.TetrisConsumer.as_asgi()), 
    ]),
})
