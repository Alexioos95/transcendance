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
# {"2fa": 'False', "username":dbUserList[0].Username, "Avatar":dbUserList[0].Avatar, "Language": dbUserList[0].Language}
#ajouter le type de methode sur chaqaue route

urlpatterns = [
    path('', views.index),#faire une route static via nginx a enlever d'ici
    path('user/register/', views.register),#prend du json en entree attend les champ username password et email, return 201 ainsi qu'un json contenant les infos user  si l'user a ete cree et set un coockie auth jwt sinon un code adapte ainsi qu'un json contenant error
    path('user/login/', views.login),#prend du json en entree attend les champ username et password retourn 200 si ok ainsi qu'un json contenant les infos user  et set un coockie auth contant un jwt sinon  un code adapte ainsi qu'un json contenant error
    path('user/checkJwt/', views.checkJwt),#route servant a verifier si un user est deja connecte via un coockie auth return 200 ainsi qu'un json contenant les infos user sinon un autre code est retourne
    path('user/auth42/', views.auth42),
    path('user/2fa/', views.twoFA),
    path('user/set2FA/', views.set2FA),
    path('user/disconnect/', views.disconnect),#supprime le coockie auth
    path('user/checkAuth42/', views.checkAuth42),
    path('user/updateUserInfos/', views.updateUserInfos),
    # path('user/addFriend/', views.addFriend),en attene de postgres
    # path('user/blockUser/', views.blockUser),en attene de postgres
    path('user/updateInfo/', views.updateInfo),
    path('user/resetPaswd/', views.resetPasswd),
    path('user/matchMaking/', views.matchMaking),
    path('user/ping/', views.ping),
]

# route matchmaking servie a part ou service user
