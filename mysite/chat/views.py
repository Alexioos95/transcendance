# chat/views.py
from django.shortcuts import render, redirect


def index(request):
    return redirect('/chat/general/')


def room(request, room_name):
    return render(request, "chat/room.html", {"room_name": room_name})