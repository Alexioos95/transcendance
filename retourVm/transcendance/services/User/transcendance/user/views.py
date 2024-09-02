from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from user import userMiddleware as middleware
import time
from datetime import date, datetime, timedelta
from user.models import User
from django.http import JsonResponse
from django.http import HttpResponse
from django.core.cache import cache
import json
import pytz
import requests
import os
import pyotp
import qrcode
import jwt
import bcrypt


def index(request):#a degager
    print('coucou')
    if request.method == 'POST':
        form_data = request.POST
        print('data =', form_data)
    return render(request , 'index.html')


def print_all_cookies(request):#a ddegsge avant la fin sertsa verifier les coockies
    cookies = request.COOKIES
    if cookies:
        print("Cookies présents dans la requête :")
        for cookie_name, cookie_value in cookies.items():
            print(f'{cookie_name}: {cookie_value}')
    else:
        print("Aucun cookie n'est présent dans la requête.")

def checkCookie(request, str):
    # print_all_cookies(request)
    if str in request.COOKIES:
        return request.COOKIES[str]
    else:
        return 'null'

@csrf_exempt
def register(request):#check si user est unique sinon refuser try except get?
    if request.method == 'POST':
        salt = bcrypt.gensalt()
        data = json.loads(request.body)
        nom = data['nom']
        password = data['password']
        email = data['email']
        password = bcrypt.hashpw(password.encode('utf-8'), salt)
        print(f'ceci est un mdp hash {password}')
        time = datetime.now()
        tz = pytz.timezone('CET')
        tzTime = tz.localize(time)
        new_user = User(
            Email=email,
            Username=nom,
            Password=password.decode('utf-8'),
            lastTimeOnline=tzTime,
            pongLvl=0,
            Language='NL',
            tetrisLvl=0,
            twoFA=True
        )
        # new_user.Language = 'FR'
        # user = User.objects.all().filter(Username__exact=decodedJwt["userName"]).value_list()
        # if not user:
        #     print(username pas trouve)
        # else:
        #     print(username trouve)
        # user = User.objects.all().filter(Username__exact=decodedJwt["Email"]).value_list()
        # if not user:
        #     print(email pas trouve)
        # else:
        #     print(email trouve)
        try:
            new_user.save()
        except Exception as error:
            print('ca  echouer a ecrie en bdd')
            response_data = JsonResponse({"error": "erreur in database"}, status=409)
            #response_data.status = 409
            print(error)
            return(response_data)
        # user = User.objects.filter(Username__exact='h').first()
        # if user:
        #     print(f'user={user}')
        #     print(f'user.password={user.Password}')
        #     if bcrypt.checkpw(prevpassword, user.Password.encode('utf-8')):
        #         print("Le mot de passe est valide.")
        #     else:
        #         print("Le mot de passe est invalide.")
        # Réponse JSON
        # mailData = {'title':'transcendance registration','body':f'welcome {nom}, successfully registered', 'destinataire':'ftTranscendanceAMFEA@gmail.com'}
        # response = requests.post('http://localhost:8001/sendMail/', json=mailData)#mettre la route dans l'env ou set la route definitive dans le build final?
        # print(response.status_code)
        response_data = JsonResponse({"message": "User successfully registered"}, status=201)
        response_data.status = 201
        # response_data.set_cookie(
        # 'auth',
        # f'test{nom}',#
        # httponly=True,   # Empêche l'accès JavaScript au cookie
        # # secure=True,     # Assure que le cookie est envoyé uniquement sur HTTPS
        # # samesite='None',
        # expires=datetime.utcnow() + timedelta(hours=1))
        expiration_time = (datetime.now() + timedelta(days=7)).timestamp()  # 300 secondes = 5 minutes
        encoded_jwt = jwt.encode({"userName": nom, "expirationDate": expiration_time}, os.environ['SERVER_JWT_KEY'], algorithm="HS256")    #    Export to .env file        #    Add env_example file
        # response_data.set_cookie(
        # 'auth',
        # encoded_jwt,
        # httponly=True,   # Empêche l'accès JavaScript au cookie
        # # secure=True,     # Assure que le cookie est envoyé uniquement sur HTTPS
        # samesite='None',
        # expires=datetime.utcnow() + timedelta(hours=1))
        response_data.set_cookie(
            'auth',
            encoded_jwt,
            httponly=True,  # Empêche l'accès JavaScript au cookie
            secure=True,   # Désactivé pour HTTP local
            samesite='Strict', # 'Lax' est souvent suffisant pour les tests locaux
            expires=datetime.utcnow() + timedelta(hours=25)  # Date d'expiration future
        )
        # response_data.set_cookie(key='auth', value=encoded_jwt, max_age=3000)
        print("erreur 1")
        return (response_data)
    else:
        print("erreur 2")
        return JsonResponse({'error': 'Méthode non autorisée'}, status=405)

def decodeJwt(auth_coockie):
    decodedJwt = ""
    try:
        decoded_token = jwt.decode(auth, os.environ['SERVER_JWT_KEY'], algorithms=["HS256"])
        username = decoded_token.get('userName')  # Extract the username from the token
        decodedJwt = json.loads(decoded_token)
    # except jwt.ExpiredSignatureError:
    #     response_data = JsonResponse("error":"Connection expired")
    #     response_data.status_code = 401
    #     raise response_data
    except jwt.InvalidTokenError:
        response_data = JsonResponse({'error': 'Forbidden'})
        response_data.status_code = 403
        raise response_data
    if decodedJwt["expirationDate"] < time.time():
        raise JsonResponse({'error': 'Token expired'}, status=401)
    # check si user existe toujours en db
    user = User.objects.all().filter(Username__exact=decodedJwt["userName"]).value_list()
    if not user:
        raise JsonResponse({'error': 'User does not exist'}, status=403)
    # return JsonResponse({'success': 'User connected'}, status=200)
    return user

def checkJwt(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Méthode non autorisée'}, status=405)
    auth = checkCookie(request, 'auth')
    if auth == 'null':
        response = HttpResponse()
        response.status_code = 403
        return response
    print(f'le cookie est {auth}')
    user = decodeJwt(auth)
    response_data = JsonResponse({"username":user.Username, "Avatar":user.Avatar, "Language": user.Language})
    response_data.status_code = 200
    return(response)

@csrf_exempt
def login(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Méthode non autorisée'}, status=405)
    data = json.loads(request.body)
    requestUserName = data['nom']
    password = data['password']
    # hash for comparison with db
    # Guard against injection/xss here?
    # Check if empty name or password?
    # Check for minimum lengths?
    dbUser = ''
    try:
        mydata = User.objects.all().values()
        print(mydata)
        print(list(mydata))

        dbUser = User.objects.filter(Username__exact=requestUserName)
        dbUserList = list(dbUser)

        for user in dbUserList:
            print(f'dbUser == {dbUserList} Username {user.Username} password == {user.Password}')
            print(f'Language: {user.get_Language_display()}')
            print(f'TwoFA: {user.get_twoFA_display()}')
        # mydata = User.objects.all().values()
        # print(mydata)
        # print(list(mydata))
        # print(f'username == {requestUserName}')
        # dbUser = User.objects.filter(Username__exact=requestUserName)
        # dbUserList = list(dbUser)
        # print(f'dbUser == {dbUserList} Username {dbUserList[0].Username} password == {dbUserList[0].Password}')
        # print(f'dbUser == {dbUserList} Username {dbUserList[0].Username} password == {dbUserList[0].Password}')
    except Exception as e:
        print(f'database esceptiom == {e}')
        return JsonResponse({'error': 'invalid credentials'}, status=401)
    encoded_jwt = jwt.encode({"userName": requestUserName, "expirationDate": time.time() + 300}, os.environ.get('SERVER_JWT_KEY'), algorithm="HS256")    #    Export to .env file        #    Add env_example file
    if bcrypt.checkpw(password.encode('utf-8'), dbUserList[0].Password.encode('utf-8')):
        print("Le mot de passe est valide.")
        if dbUserList[0].twoFA != 'NONE':
            return JsonResponse({"2fa": 'True'}, status=200)#code a verifier code 2fa attendu
        response_data = JsonResponse({"2fa": 'False', "username":dbUserList[0].Username, "Avatar":dbUserList[0].Avatar, "Language": dbUserList[0].Language})
        response_data.status = 200
        response_data.set_cookie(
        'auth',
        encoded_jwt,
        httponly=True,   # Empêche l'accès JavaScript au cookie
        secure=True,     # Assure que le cookie est envoyé uniquement sur HTTPS
        samesite='Strict',
        expires=datetime.utcnow() + timedelta(hours=100))
        return (response_data)
    else:
        print("Le mot de passe est invalide.")
        return JsonResponse({'error': 'invalid credentials'}, status=401)
    # userIp = request.META.get('REMOTE_ADDR')
    # print(f"voici l'ip user{userIp}")

@csrf_exempt
def auth42(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    authorization_code = request.GET.get('code')
    data = {
        'grant_type': 'authorization_code',
        'client_id': os.environ.get('CLIENT_ID'),
        'client_secret': os.environ.get('CLIENT_SECRET'),
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

def updateInfo(request):
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

@csrf_exempt
def matchMaking(request):
    # decode jwt
    # recperer la ligne user en bdd
    # check si le joueur est dans le cache , l'enlever et set la marge lvladveraire
    # check dans le cache si on lui trouve un avdversaire
    # sinon ajouter le joueur dans le cache
    response = HttpResponse()
    auth = checkCookie(request, 'auth')
    
    
    if auth == 'null':
        response.status_code = 403
        return response
    
    print(f'le cookie est {auth}')
    username = ""
    decodedJwt(auth)
    user = User.objects.filter(Username__exact=username).first()
    
    if not user:
        response.status_code = 403
        return response
    print(f'le username est {username}')
    matchmakingDict = cache.get('matchmaking', {})
    print(f"cache == {matchmakingDict}")
    userMatchmaking = {'time': datetime.now(), 'difLevel': 5, 'game': "pong" ,'levelPong': user.pongLvl, 'levelTetris':user.tetrisLvl, 'matched':False}#si marchd a true return 200
    # if username == 'fguarrac':
    #     userMatchmaking = {'time': datetime.now(), 'difLevel': 5, 'game': "pong" ,'levelPong': 20, 'levelTetris':user.tetrisLvl}
    if username in matchmakingDict.keys():
        userMatchmaking = matchmakingDict.pop(username)
        current_time = datetime.now()
        time_difference = current_time - userMatchmaking['time']
        if time_difference > timedelta(seconds=30):
            userMatchmaking['difLevel'] *= 2
            userMatchmaking['time'] = current_time
    print(username)
    print(userMatchmaking)
    # maxLevel = userMatchmaking['game'] == "pong"?userMatchmaking['levelPong']:userMatchmaking['levelTetris']

    maxLevel = userMatchmaking['levelPong'] if userMatchmaking['game'] == "pong" else userMatchmaking['levelTetris']
    maxLevel+=userMatchmaking['difLevel']
    
    minLevel = userMatchmaking['levelPong'] if userMatchmaking['game'] == "pong" else userMatchmaking['levelTetris']
    minLevel-=userMatchmaking['difLevel']
    for userName, data in matchmakingDict.items():
        if data['levelPong'] <= maxLevel and data['levelPong'] >= minLevel:
            print('ca matchmake la')
        else:
            print('ca matchamake pas la')
        print(f"Username: {userName}, Time: {data['time'].timestamp()}, difference Level: {data['difLevel']}")
    gameData = {'player1': "fguarrac", 'player2': "madaguen"}
    gameResponse = requests.post('http://localhost:8001/initGame/', json=gameData)
    print(gameResponse.status_code)
    matchmakingDict[username] = userMatchmaking
    cache.set('matchmaking', matchmakingDict, timeout=3600)#si pas trouve sinon inscrire en bdd game
    response.status_code = 200 #100 si pas trouve
    return response

def ping(request):
    return HttpResponse(status=204)
