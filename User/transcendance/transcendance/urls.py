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

urlpatterns = [
    path('', views.index),#faire une route static via nginx a enlever d'ici
    path('User/register/', views.register),
    path('User/login/', views.login),
    path('User/checkJwt/', views.checkJwt),
    path('User/auth42/', views.auth42),
    path('User/2fa/', views.twoFA),
    path('User/set2FA/', views.set2FA),
    path('User/disconnect/', views.disconnect),
    path('User/checkAuth42/', views.checkAuth42),
    path('User/updateUserInfos/', views.updateUserInfos),
    # path('User/addFriend/', views.addFriend),en attene de postgres
    # path('User/blockUser/', views.blockUser),en attene de postgres
    path('User/updateInfo/', views.updateInfo),
    path('User/resetPaswd/', views.resetPasswd),
    path('User/matchMaking/', views.matchMaking),
]

# route matchmaking servie a part ou service user
