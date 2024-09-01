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
    path('user/register/', views.register),
    path('user/login/', views.login),
    path('user/checkJwt/', views.checkJwt),
    path('user/auth42/', views.auth42),
    path('user/2fa/', views.twoFA),
    path('user/set2FA/', views.set2FA),
    path('user/disconnect/', views.disconnect),
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
