from django.shortcuts import render
from django.http import HttpResponse
import requests

# Create your views here.

def testRoutes(request):
    services = ["user", "chat", "ping", "mail"]
    pingResponses = {}
    for _ in services:
        try:
            pingResponses.append({_: requests.get('http://' + _ + '/ping').status_code})
        except Exception:
            pingResponses.append({_: 0})
    for _ in pingResponses:
        if pingResponses[_] != 204:
            print("No Ping")
    print(pingResponses)
	return JsonResponse(pingResponses, status=200)

#definir les routes actives en fonction du retour des pings

#    path('user/register/', views.register),
#    path('user/login/', views.login),
#    path('user/checkJwt/', views.checkJwt),
#  	  path('user/auth42/', views.auth42),
#    path('user/set2fa/', views.checkCodeSet),
#    path('user/log2fa/', views.checkCodeLog),
#    path('user/init2fa/', views.set2FA),
#    path('user/disconnect/', views.disconnect),
#    path('user/checkAuth42/', views.checkAuth42),
#    path('user/updateUserInfos/', views.updateUserInfos),
#    path('user/addFriend/', views.addFriend),
#    path('user/blockUser/', views.blockUser),
#    path('user/deleteFriend/', views.deleteFriend),
#    path('user/deleteBlockedUser/', views.deleteBlockedUser),
#    path('user/resetPaswd/', views.resetPasswd),
#    path('user/sendNewPaswd/', views.sendNewPaswd),
#    path('user/matchMaking/', views.matchMaking),
#    path('user/updateInfo/', views.updateInfo),
#    path('user/ping/', views.ping),

def ping(request):
    HttpResponse(status=204)
