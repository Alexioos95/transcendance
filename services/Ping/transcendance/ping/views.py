from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
import requests

# Create your views here.

def testRoutes(request):
    services = ["user", "chat", "mail", "pong"]
    pingResponses = {}
    for _ in services:
        try:
            pingResponses.append({_: requests.get('http://' + _ + '/ping').status_code})
        except Exception:
            pingResponses.append({_: 0})
#    for _ in pingResponses:
#        if pingResponses[_] != 204:
#            print("No Ping", file=sys.stderr)
#    print(pingResponses)
    return JsonResponse(pingResponses, status=200)

def ping(request):
    return HttpResponse(status=204)
