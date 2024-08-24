from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from user import userMiddleware as middleware
from datetime import date, datetime, timedelta
from user.models import User
from django.http import JsonResponse
from django.http import HttpResponse
from django.core.cache import cache
import time
import json
import pytz
import requests
import os
import pyotp
import qrcode
import jwt
import bcrypt

def index(request):
    print('coucou')
    if request.method == 'POST':
        form_data = request.POST
        print('data =', form_data)
    return render(request , 'index.html')

def checkCookie(request, str):
    if str in request.COOKIES:
        print('Le cookie "auth" est présent.')
        return request.COOKIES[str]
    else:
        print('Le cookie "auth" n\'est pas présent.')
        return null

# @csrf_exempt
# def register(request):
#     print('register')
#     if request.method == 'POST':
#         salt = bcrypt.gensalt()
#         data = json.loads(request.body)
#         nom = data['nom']
#         password = data['password'] #hash moi ca avant de push
#         prevpassword = password.encode('utf-8') 
#         print(f'password={password}')
#         password = bcrypt.hashpw(password.encode('utf-8'), salt)
#         print(f'ceci est un mdp hash {password}')
#         response_data = {}
#         # print(datetime.datetime())
#         time = datetime.now()
#         timebdd = datetime(time.year,time.month, time.day, time.hour, time.minute, time.second)
#         tz = pytz.timezone('CET')
#         tzTime = tz.localize(time)
#         timebdd2 = tzTime.replace()
#         # print(timebdd)
#         # print(timebdd2)
#         # print(datetime.datetime.now())
#         # print(datetime.datetime.now().timestamp())
#         # print(datetime.datetime.total_seconds())
#         # print(datetime.datetime.strftime)
#         new_user = User(Username = nom, Password = password, lastTimeOnline = timebdd2, pongLvl = 0, tetrisLvl = 0)
#         new_user.save()
#         all_entries = User.objects.all()
#         # print(all_entries.values_list())
#         user = User.objects.all().filter(Username__exact='ntestdumercredi')
#         print(user)
#         print("\n\n")
#         print(user.values_list())
#         print(f"res == {User.objects.get(Username='ntestdumercredi')}")
#         bcrypt.checkpw(prevpassword, User.objects.all().filter(Username="ntestdumercredi").first().Password)
#         #check si dans bdd si oui return erreur sinon creer et return 201 et data user connecte set le coockie
#         return JsonResponse(response_data, status=201)
#     else:
#         return JsonResponse({'error': 'Méthode non autorisée'}, status=405)

@csrf_exempt
def register(request):#check si user est unique sinon refuser try except get?
    if request.method == 'POST':
        # Génération du sel pour bcrypt
        salt = bcrypt.gensalt()
        # Chargement des données envoyées dans la requête
        data = json.loads(request.body)
        nom = data['nom']
        password = data['password']  # Mot de passe brut
        prevpassword = password.encode('utf-8')
        # Hachage du mot de passe
        password = bcrypt.hashpw(password.encode('utf-8'), salt) # Hache le mot de passe
        print(f'ceci est un mdp hash {password}')
        # Gestion du temps
        time = datetime.now()
        tz = pytz.timezone('CET')
        tzTime = tz.localize(time)
        # Création du nouvel utilisateur
        new_user = User(
            Username=nom,
            Password=password.decode('utf-8'),  # Conserver en bytes ou utiliser `.decode('utf-8')` si nécessaire
            lastTimeOnline=tzTime,
            pongLvl=0,
            tetrisLvl=0
        )
        new_user.save()
        # Vérification du mot de passe juste après son insertion
        user = User.objects.filter(Username__exact='h').first()
        if user:
            print(f'user={user}')
            print(f'user.password={user.Password}')
            if bcrypt.checkpw(prevpassword, user.Password.encode('utf-8')):
                print("Le mot de passe est valide.")
            else:
                print("Le mot de passe est invalide.")
        # Réponse JSON
        mailData = {'title':'transcendance registration','body':f'welcome {nom}, successfully registered', 'destinataire':'ftTranscendanceAMFEA@gmail.com'}
        response = requests.post('http://localhost:8001/sendMail/', json=mailData)#mettre la route dans l'env ou set la route definitive dans le build final?
        print(response.status_code)
        response_data = JsonResponse({"message": "User successfully registered"})
        response_data.status = 201
        response_data.set_cookie(
        'auth',
        f'test{nom}',#
        httponly=True,   # Empêche l'accès JavaScript au cookie
        # secure=True,     # Assure que le cookie est envoyé uniquement sur HTTPS
        samesite='None',
        expires=datetime.utcnow() + timedelta(hours=1))
        encoded_jwt = jwt.encode({"userName": nom, "expirationDate": time.time() + 300}, os.environ['SERVER_JWT_KEY'], algorithm="HS256")    #    Export to .env file        #    Add env_example file
        response_data.set_cookie(key='auth', value=encoded_jwt, max_age=300)
        return (response_data)
    else:
        return JsonResponse({'error': 'Méthode non autorisée'}, status=405)

def checkJwt(request):
    if request.method == 'GET':
        auth = checkCookie(request, 'auth')	#jwt?
        if auth == null:
            return JsonResponse({'error': 'not connected'}, status=204)

        # Check if JWT present
        #  Check JWT validity
        #  Check JWT expiracy date
        decodedJwt = ""

        try:
            decodedJwt = jwt.decode(auth, os.environ['SERVER_JWT_KEY'], algorithm="HS256")
        except Exception as error:
            print(error)
            return JsonResponse({'error': 'Forbidden'}, status=403)

        decodedJwt = json.loads(decodedJwt)
        if decodedJwt["expirationDate"] < time.time():
            return JsonResponse({'error': 'Token expired'}, status=401)

        # check si user existe toujours en db
        user = User.objects.all().filter(Username__exact=decodedJwt["userName"]).value_list()
        if not user:
            return JsonResponse({'error': 'User does not exist'}, status=401)
        return JsonResponse({'success': 'User connected'}, status=200)

@csrf_exempt
def login(request):
    print('on estp asse par ici')
    if request.method != 'POST':
        return JsonResponse({'error': 'Méthode non autorisée'}, status=405)
    data = json.loads(request.body)
    requestUserName = data['nom']
    password = data['password']    #hash for comparison with db
    #    Guard against injection/xss here?
    #    Check if empty name or password?
    #    Check for minimum lengths?
    dbUser = User.objects.filter(Username__exact=requestUserName)
    print('on estp asse par la')
    encoded_jwt = jwt.encode({"userName": requestUserName, "expirationDate": time.time() + 300}, os.environ.get('SERVER_JWT_KEY'), algorithm="HS256")    #    Export to .env file        #    Add env_example file
    print(f'var == {os.environ.get("SERVER_JWT_KEY")} et encoded jwt == {encoded_jwt}')
    try:
        dbUser = User.objects.filter(Username__exact=requestUserName).get()
    except:
        print('user not found')
        return JsonResponse({'error': 'invalid credentials'}, status=401)
    if bcrypt.checkpw(password.encode('utf-8'), dbUser.Password.encode('utf-8')):
        print("Le mot de passe est valide.")
        response_data = JsonResponse({'data': 'pein de data user'})
        response_data.status = 200
        response_data.set_cookie(
        'auth',
        encoded_jwt,
        httponly=True,   # Empêche l'accès JavaScript au cookie
        secure=True,     # Assure que le cookie est envoyé uniquement sur HTTPS
        samesite='None',
        expires=datetime.utcnow() + timedelta(hours=1))
        return (response_data)
        response_data.set_cookie(key='auth', value=encoded_jwt, max_age=300)
        # return JsonResponse({'data': 'pein de data user'}, status=200)
    else:
        print("Le mot de passe est invalide.")
        return JsonResponse({'error': 'invalid credentials'}, status=401)
    # if not dbUser:
        # return JsonResponse({'error': 'User does not exist'}, status=401)
    # if dbUser.password != hash_function(requestPassword):
        # return JsonResponse({'error': 'Wrong password'}, status=401)
    #si 2fa si mail genere code stoker en cache et envoyer le mail via route mail
    # if 2FA active
    # if User.objects.all().filter(Username=requestUserName).value_list().twoFA != 'NONE':
    #     if User.objects.all().filter(Username=requestUserName).value_list().twoFA == 'MAIL':
    #     #    Gen random code
    #     #    Save code to cache
    #     #    Send code to user's mail
    #     #    Ask for user's code
    #     #    Compare with code in cache
    #     #    If code OK, user is logged in, send JWT
    #     #    Else, ask code again
    #     elif User.objects.all().filter(Username=requestUserName).value_list().twoFA == 'APK':
        #    Ask user authenticator app's code
        #    Compare with generated code
        #    If code OK, user is logged in, send JWT
        #    Else, ask code again
    #recuperer info user en bdd et construirel la response et set le cookie
    #generate user jwt encode/decode secret and save it in db
    # user = User.objects.filter(Username='h').first()
    encoded_jwt = jwt.encode({"userName": requestUserName, "expirationDate": time.time() + 300}, os.environ['SERVER_JWT_KEY'], algorithm="HS256")    #    Export to .env file        #    Add env_example file	#	Already above...
    response_data = JsonResponse({'success': 'User logged in'}, status=200);
#= {nom: password}
    # userIp = request.META.get('REMOTE_ADDR')
    # print(f"voici l'ip user{userIp}")
    response_data.set_cookie(key='auth', value=encoded_jwt, max_age=300)
    return response_data

@csrf_exempt
def auth42(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    authorization_code = request.GET.get('code')
    data = {
        'grant_type': 'authorization_code',
        'client_id': 'u-s4t2ud-f59fbc2018cb22b75560aad5357e1680cd56b1da8404e0155abc804bc0d6c4b9',
        'client_secret': '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',
        'code': authorization_code,
        'redirect_uri': 'http://localhost:8000/auth42'
    }
    response = requests.post('https://api.intra.42.fr/oauth/token', json=data)
    if response.status_code != 200:
        return JsonResponse({'error': 'Failed to obtain access token'}, status=response.status_code)
    access_token = response.json().get('access_token')
    if not access_token:
        return JsonResponse({'error': 'Access token not found in response'}, status=500)
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    user_response = requests.get(f'https://api.intra.42.fr/v2/me', headers=headers)
    
    if user_response.status_code == 200:
        user_data = user_response.json()
        login = user_data.get('login', '')
        token = "ceci est un token jwt"
        auth_data = {
            'login': login,
            'token': token
        }
        authDataJson = json.dumps(auth_data)
        userIp = request.META.get('REMOTE_ADDR')
        cache.set(userIp, authDataJson, 300)
        # check si user est en data base sinon l'ajouter creer un jwt permettant de l'identifier
        # first_name = user_data.get('first_name', '')
        # last_name = user_data.get('last_name', '')
        # html_response = f'<html><body><h1>Bonjour {first_name} {last_name}</h1></body></html>'
        # return JsonResponse(user_response.json(), status=user_response.status_code)
        # //response = HttpResponse("Cookie Set")
        # //response.set_cookie('java-tutorial', 'javatpoint.com')
        # response.set_cookie('coucou', 'coucou')

        try:
            User.objects.filter(Username__exact=login).get()
            encoded_jwt = jwt.encode({"userName": login, "expirationDate": time.time() + 300}, os.environ['SERVER_JWT_KEY'], algorithm="HS256")    #    Export to .env file        #    Add env_example file
            response_data = JsonResponse({'success': 'User logged in'}, status=200);	### Update for this function
            return render(request , 'index.html')
        except:
    # Nouvel utilisateur
            # Gestion du temps
            time = datetime.now()
            tz = pytz.timezone('CET')
            tzTime = tz.localize(time)
            # Création du nouvel utilisateur
            new_user = User(
                Username=login,
                lastTimeOnline=tzTime,
                pongLvl=0,
                tetrisLvl=0
            )
            # Try excpet for uniqueness
            new_user.save()
            encoded_jwt = jwt.encode({"userName": login, "expirationDate": time.time() + 300}, os.environ['SERVER_JWT_KEY'], algorithm="HS256")    #    Export to .env file        #    Add env_example file
            response_data = JsonResponse({'success': 'User logged in'}, status=200);	### Update for this function
            return render(request , 'index.html')
    else:
        return JsonResponse({'error': 'Failed to fetch user data'}, status=user_response.status_code)

@csrf_exempt
def checkAuth42(request):
    response = HttpResponse()
    userIp = request.META.get('REMOTE_ADDR')
    print(userIp)
    if request.method == "POST":
        cachedValue = cache.get(userIp)
        if cachedValue is not None:
            response.content = cachedValue
            cache.delete(userIp)
            response.status_code = 200
            response.set_cookie(
            'auth', #vallue finale : auth
            'test', #ici token jwt
            httponly=True,   # Empêche l'accès JavaScript au cookie
            # secure=True,     # Assure que le cookie est envoyé uniquement sur HTTPS
            # samesite='Strict',
            expires=datetime.utcnow() + timedelta(hours=1)
            )
        else:
            # response.content = "Cache is empty."
            response.status_code = 204
    else:
        response.status_code = 405
    return (response)

def updateUserInfos(request):
    return

def disconnect(request):
    return

def updateOnline(request):
    # recevoir en post avoir via le coockie qui est co retourner la liste de ses amis avec l'update last co
    return

# def checkCode2faAPK(user, code):
#     return

# def checkCode2faMail(user, code):
#     return

# def generateAPKCode(masterCode):
#     return

def twoFA(request):
    #requete gen cle chaque 00.01s 30.01s
    # attend un code et dit si valide ou non 


    key = keyFromDb
    totp = pyotp.TOTP(key)
    #print(f'Code: {totp.now()}')

    #ask generated key in front!
    userInput = input("Enter generated code (6 digits): ")

    # check user input ?!

    if (totp.verify(userInput)):
        print("Code OK")
        #    send OK to front!
    else:
        print("NOT OK :(")
        #    send KO to front!

    return

def set2FA(request):
    #requete gen cle chaque 00.01s 30.01s
    #set 2fa a true en bdd code deja stocke si c'est mail si apk check le code en cache

    # if 2FA == key:
        # key = cache.get('"USERNAME" + 2FA') # Get from JWT
        # totp = pyotp.TOTP(key)
        # print(f'Code: {totp.now()}')
    # 
        # ask generated key in front!
        # userInput = input("Enter generated code (6 digits): ")    # Get from request ?
    # 
        # check user input ?!
    # 
        # if (totp.verify(userInput)):
        # if true, save key to db + remove from cache
            # keyToDb = User.objects.get(Username = 'USERNAME')
            # keyToDb.twoFA = APK
            # keyToDb.key2FA = key
            # keyToDb.save()
            # print("Code OK")
            #    send OK to front!
        # else:
            # print("NOT OK :(")
            #    start over in front!
    # 
        #    delete image !
        # if os.path.exists('PATH TO QRCODE.png'):
            # os.remove('PATH TO QRCODE.png')
        # cache.clear('"USERNAME" + 2FA')
    # else:
        # pass #for now
    return

def preSet2FA(request):
    # sert a teser la 2fa et enregistrer la cle user puis on effectue une 2fa

    key = pyotp.random_base32()
    #    save key in cache
    cache.set('"USERNAME" + 2FA', key, 30)    # Get Username or ID from JWT

    otpUri = pyotp.totp.TOTP(key).provisioning_uri(name= "GET USERNAME OR ID FROM JWT", issuer_name="Transcendance")
    qrcode.make(otpUri).save("FIND USEFULL NAME.png")
    return

def resetPasswd(request):
    return
