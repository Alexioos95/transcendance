from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.

def ping(request):
    return HttpResponse(status=204)
