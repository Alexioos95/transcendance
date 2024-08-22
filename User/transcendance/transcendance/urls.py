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
    path('register/', views.register),
    path('login/', views.login),
    path('checkJwt/', views.checkJwt),
    path('auth42/', views.auth42),
    path('2fa/', views.twoFA),
    path('set2FA/', views.set2FA),
    path('disconnect/', views.disconnect),
    path('checkAuth42/', views.checkAuth42),
    path('updateUserInfos/', views.updateUserInfos),
    # path('addFriend/', views.addFriend),
    # path('blockUser/', views.blockUser),
    path('updateOnline/', views.updateOnline),
    path('resetPaswd/', views.resetPasswd),
]

# route matchmaking servie a part ou service user
