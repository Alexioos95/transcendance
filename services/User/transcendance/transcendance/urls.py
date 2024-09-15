"""
URL configuration for transcendance project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from user import views

#data user
# {"2fa": 'False', "username":"username", "avatar":PATH, "language": "FR", friends:[], blockedUser:[]}//ajouter les amis et bloques
#ajouter le type de methode sur chaqaue route
#code 2fa valide 10 minutes?
#tout les echanges client serveur se font en json

urlpatterns = [
    #POST
    path('user/register/', views.register),#prend du json en entree attend les champ username password et email, return 201 ainsi qu'un json contenant les infos user  si l'user a ete cree et set un coockie auth jwt sinon un code adapte ainsi qu'un json contenant error
    #POST
    path('user/login/', views.login),#prend du json en entree attend les champ username et password retourn 200 si ok ainsi qu'un json contenant les infos user  et set un coockie auth contant un jwt sinon  un code adapte ainsi qu'un json contenant error
    #GET
    path('user/checkJwt/', views.checkJwt),#route servant a verifier si un user est deja connecte via un coockie auth return 200 ainsi qu'un json contenant les infos user sinon un autre code est retourne
    #non publique redirecion du line 42
    path('user/auth42/', views.auth42),
    #POST
    
    path('user/set2fa/', views.checkCodeSet),#verifie le code recu si il est valide sset la 2fa en bdd. get code en cache
    path('user/log2fa/', views.checkCodeLog), #verifie le code recu si il est valide retourn 200 + # {"username":"username", "Avatar":PATH, "Language": "FR"} si le code est valide
    #POST
    path('user/init2fa/', views.set2FA),#on identifie l'user , on envoie le mail, si le mail echoue 200 + informer error le mail doit etre valide sinon 200 en attente du code. set code en cache
    #GET
    path('user/disconnect/', views.disconnect), #supprime le coockie auth
    #GET
    path('user/checkAuth42/', views.checkAuth42), #ping a intervalle reguliere pour savoir si la connection 42 a reussi a ne pas ajouter a la doc retourne 200 et les infos de l'user si correct
    #POST
    path('user/updateUserInfos/', views.updateUserInfos), #envoyer les infos a modifer pour l'user sauf 2fa
    # POST envoi un username a jouter a une des liste ami bloque
    path('user/addFriend/', views.addFriend),
    path('user/blockUser/', views.blockUser),
    path('user/deleteFriend/', views.deleteFriend),
    path('user/deleteBlockedUser/', views.deleteBlockedUser),
    #POST
    path('user/resetPaswd/', views.resetPasswd), #envoi un mail auquel sera envoye un mail de reset de son password via un lien fourni
    #POST
    path('user/sendNewPaswd/', views.sendNewPaswd),
    #GET
    path('user/matchMaking/', views.matchMaking), #a ping regulierement renverra 403 si token invalide une 100 si la recherche et en cours une 200 si un adveraire a ete trouve il faudra ensuite se connecter a la socket du jeu
    #GET
    path('user/updateInfo/', views.updateInfo), #requete a effetuer regulierement (1s?) afin de recevoir les defis/acceptation de defi liste d'ami avec leur date de connection liste de bloque a jour {defi:"nom du jeu si defi accepte ping la route du jeu sinon vide", friendList:[], blockedList:[]}
    path('user/sendInvitation/', views.sendInvitation),
    #POST
    path('user/sendFile/', views.sendFile),
    path('user/acceptInvitation/', views.acceptInvitation),
    #GET
    path('user/ping/', views.ping), #renvoi 204 si ok sinon vtf

]

# route matchmaking servie a part ou service user
