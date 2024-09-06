from django.shortcuts import render
from django.http import HttpResponse
import requests

# Create your views here.

def testRoutes(request):
    services = ["user", "chat", "ping", "mail"]
   # pingResponses = [0] * 4
    pingResponses = {}
    #index = 0
    for _ in services:
        try:
            #pingResponses[index] = requests.get('http://' + _ + '/ping').status_code
            pingResponses[_] = requests.get('http://' + _ + '/ping').status_code
        except Exception:
            print("No ping for " + _ + " !")
            pingResponses[_] = "0"
        #index = index + 1
    for _ in pingResponses:
        if pingResponses[_] != 204:
            print("No Ping")
    print(pingResponses)
    return HttpResponse(status=200)

def ping(request):
    HttpResponse(status=204)
