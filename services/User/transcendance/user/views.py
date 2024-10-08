from django.shortcuts import render
from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_exempt
from user import userMiddleware as mid
from datetime import date, datetime, timedelta
from user.models import User
from django.http import JsonResponse
from django.http import HttpResponse
from django.core.cache import cache
from django.views.decorators.http import require_http_methods
from django.core.validators import validate_email
import json
import pytz
import requests
import pyotp
import qrcode
import sys
import random
import bcrypt
import jwt
import os
import time

### SetCookie
#Auth42 ?

# mailData = {'title':'transcendance registration','body':f'welcome {username}, successfully registered', 'destinataire':'ftTranscendanceAMFEA@gmail.com'}
# response = requests.post('http://localhost:8001/sendMail/', json=mailData)#mettre la route dans l'env ou set la route definitive dans le build final?
# print(response.status_code)

# penser a check pasword size + check ancien password pour changement

# def mid.generate_bcrypt_hash(password: str) -> str:#middleware
#     salt = bcrypt.gensalt()
#     passwordEncoded = bcrypt.hashpw(password.encode('utf-8'), salt)
#     return passwordEncoded

def init_new_user(data):
    time = datetime.now()
    tz = pytz.timezone('CET')
    tzTime = tz.localize(time)
    new_user = User(
        Email=data.get('email', ''),
        Username=data.get('username', ''),
        Password=data.get('password', ''),  # Décodage du hash en UTF-8
        lastTimeOnline=tzTime,
        pongLvl=0,
        language=data.get('lang', 'FR'),
        tetrisLvl=0,
        twoFA='false',
        friendsList = [],
        foeList = [],
        Avatar=data.get('avatar')
    )
    return new_user


@csrf_exempt
@require_http_methods(["POST"])
def register(request):
    data = mid.loadJson(request.body)
    if data is None:
        return JsonResponse({"error": "invalid Json"}, status=403)
    userData = {}
    try:
        userData = mid.CheckInfoRegister(data)
    except mid.customException as e:
        return JsonResponse({'error': e.data}, status=e.code)

    user = mid.get_user_in_db('Username', userData['username'])
    mail = mid.get_user_in_db('Email', userData['email'])
    if user is not None or mail is not None:
       return JsonResponse({"error": "User or email already used"}, status=409)

    time = datetime.now()
    tz = pytz.timezone('CET')
    tzTime = tz.localize(time)

    try:
        mid.checkCredentialsLen(userData)
        mid.checkEmailFormat(userData['email'])
    except mid.customException as e:
        return JsonResponse({'error': e.data}, status=e.code)

    hashed_password = mid.generate_bcrypt_hash(userData['password'])

    new_user = User(
        Email=userData['email'],
        Username=userData['username'],
        Password=hashed_password.decode('utf-8'),  # Décodage du hash en UTF-8
        lastTimeOnline=tzTime,
        pongLvl=0,
        language=userData['lang'],
        tetrisLvl=0,
        twoFABool='false',
        friendsList = [],
        foeList = [],
    )
    try:
        new_user.save()
    except Exception:
        response_data = JsonResponse({"error": "Unable to write in database"}, status=500)
        return(response_data)
    response_data = JsonResponse({"twoFA": 'false',  "email": userData['email'], "guestMode":"false", "username":new_user.Username, "avatar": '/images/default_avatar.png' , "lang": new_user.language}, status=201)
    mid.setCookie(new_user, response_data)
    return (response_data)

@csrf_exempt
@require_http_methods(["GET"])
def checkJwt(request):
    auth = mid.checkCookie(request, 'auth')
    if auth is None:
        response = JsonResponse({"error": "user not log"}, status=200)
        response.set_cookie('auth', '', expires='Thu, 01 Jan 1970 00:00:00 GMT')
        return response
    try:
        username = mid.decodeJwt(auth)
        user = mid.get_user_in_db('Username', username)
        if not user:
            response = JsonResponse({"error": "user does not exist"}, status=200)
            response.set_cookie('auth', '', expires='Thu, 01 Jan 1970 00:00:00 GMT')
            return response
        avatar = ''
        if not user.Avatar:
            avatar = '/images/default_avatar.png'
        else:
            avatar = user.Avatar
        return JsonResponse({"twoFA": user.twoFABool,  "email": user.Email, "guestMode":"false", "username":user.Username, "avatar": avatar , "lang": user.language}, status=200)
    except mid.customException as e:
        response = JsonResponse({"error": e.data}, status=200)
        response.set_cookie('auth', '', expires='Thu, 01 Jan 1970 00:00:00 GMT')
        return response

@csrf_exempt
@require_http_methods(["POST"])
def login(request):
    data = mid.loadJson(request.body)
    if data is None:
        return JsonResponse({"error": "invalid Json"}, status=403)
    userData = {}
    if 'email' not in data or 'password' not in data or not data['password']:
        return JsonResponse({"error": "invalide credentials"}, status=200)
    try:
        mid.checkEmailFormat(data['email'])
    except mid.customException as e:
        return JsonResponse({'error': e.data}, status=e.code)
    dbUser = mid.get_user_in_db("Email", data['email'])
    if dbUser is None:
        return JsonResponse({"error":"invalid credentials"}, status=401)
    if bcrypt.checkpw(data['password'].encode('utf-8'), dbUser.Password.encode('utf-8')):
        print("Le mot de passe est valide.", file=sys.stderr)
    else:
        print("Le mot de passe est invalide.", file=sys.stderr)
        return JsonResponse({'error': 'invalid credentials'}, status=401)
    encoded_jwt = jwt.encode({"userName": dbUser.Username, "expirationDate": time.time() + 300}, os.environ.get('SERVER_JWT_KEY'), algorithm="HS256")
    print(f'twoFA == {dbUser.twoFABool}, bool {dbUser.twoFABool == 'false'}', file=sys.stderr)
    if (dbUser.twoFABool != 'false'):
        print('jesuis la dans le 2 fa de login', file=sys.stderr)
        code = mid.generate_code(8)
        cache.set(code, dbUser.Username, 600)
        mailData = {
        'title': 'Your 2FA code for Transcendance',
        'body': (
            f'Hey {dbUser.Username},\n\n'
            f'Looks like you\'re trying to log in. No worries, mate! We\'ve got you covered.\n\n'
            f'Here\'s your 2FA code:\n\n{code}\n\n'
            f'This code is good for 10 minutes, so make sure you use it pronto. If you miss it, just try again.'
            f'If someone else asked for this, don\'t sweat it - your account\'s still safe.\n\n'
            f'Cheers,\n\nThe Team\n'
            ),
            'destinataire': dbUser.Email}
        response = requests.post('http://mail:8002/sendMail/', json=mailData)
        if response.status_code != 200:
            return JsonResponse({'error': 'Failed to send email'}, status=200)
        print('jesuis la dans le 2 fa de login avant la reposne', file=sys.stderr)
        return JsonResponse({"twoFA": 'true', 'guestMode': 'false'}, status=200)
    print('jesuis login avant la reposne', file=sys.stderr)
    response_data = JsonResponse({"twoFA": 'false',  "email": dbUser.Email, "guestMode":"false", "username":dbUser.Username, "avatar": dbUser.Avatar , "lang": dbUser.language}, status=200)
    mid.setCookie(dbUser, response_data)
    return (response_data)

@csrf_exempt
def auth42(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    authorization_code = request.GET.get('code')
    print(f'https://{os.environ['DUMP']}:4433/user/auth42/', file=sys.stderr)
    data = {
    'grant_type': 'authorization_code',
    'client_id': f'{os.environ["FTAUTHUID"]}',#os.environ['FTAUTHUID'],
    'client_secret': f'{os.environ["FTAUTHSECRET"]}',#os.environ['FTAUTHSECRET'],
    'code': authorization_code,
    'redirect_uri': f'https://{os.environ["DUMP"]}:4433/user/auth42/'
    }
    response = requests.post('https://api.intra.42.fr/oauth/token', json=data)
    print(f'auth42 : code == {response.status_code}', file=sys.stderr)
    if response.status_code != 200:
        return JsonResponse({'error': 'Failed to obtain access token'}, status=response.status_code)
    access_token = response.json().get('access_token')
    if not access_token:
        return JsonResponse({'error': 'Access token not found in response'}, status=403)
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    user_response = requests.get(f'https://api.intra.42.fr/v2/me', headers=headers)
    print(f'auth42 : code == {response.status_code}', file=sys.stderr)
    if user_response.status_code == 200:
        user_data = user_response.json()
        login = user_data.get('login', '')
        email = user_data.get('email', '')
        avatar = user_data.get('image', '')
        avatar = avatar.get('versions', '')
        avatar = avatar.get('small', '')
        # lang = user_data.get('language', '')
        # print('lang == {lang}', file=sys.stderr)
        
        # lang = lang.get('identifier', '')
        # lang = lang.upper()
        user42 = mid.get_user_in_db('Email', email)
        print('lang == {lang}', file=sys.stderr)
        if user42 is None:
            user42 = mid.get_user_in_db("Username", login)
            if user42 is not None:
                login = f'{login}{mid.generate_code(15)}'
            user42 = init_new_user({"username": login, "email": email, "avatar": avatar, 'lang': 'FR'})
            user42.save()#try cath avant de push stp
        id = user42.id
        print(f'uder42 id == {id}')
        auth_data = {
            'id': id,
        }
        authDataJson = json=(auth_data)
        userIp = request.META.get('REMOTE_ADDR')
        cache.set(userIp, authDataJson, 300)
        print(f'auth42 : authJson {authDataJson}', file=sys.stderr)
        data = JsonResponse({'success': 'User logged in'}, status=200);	### Update for this function
        return redirect(f'https://{os.environ["DUMP"]}:4433/?code=code')
        # return JsonResponse(response_data)
    else:
        return JsonResponse({'error': 'Failed to fetch user data'}, status=user_response.status_code)

@csrf_exempt
def checkAuth42(request):
    userIp = request.META.get('REMOTE_ADDR')
    if request.method == "GET":
        cachedValue = cache.get(userIp)
        print(f'checkAuth42 : {cachedValue}', file=sys.stderr)
        
        if cachedValue is not None:
            user = mid.get_user_in_db('id', cachedValue.get('id'))
            response = JsonResponse({
                "avatar": user.Avatar,
                "guestMode": "false",
                "username": user.Username,
                'lang': user.language,
                'twoFA': 'false',
                'email': user.Email
            }, status=200)
            
            cache.delete(userIp)
            mid.setCookie(user, response)
            return response
        else:
            return JsonResponse({"error": "still waiting"}, status=204) #penser a mettre 204
    else:
        return HttpResponse(status=405)



# @csrf_exempt
# def checkAuth42(request):
#     response = JsonResponse()
#     userIp = request.META.get('REMOTE_ADDR')
#     print(userIp)
#     if request.method == "GET":
#         cachedValue = cache.get(userIp)
#         print(f'checkAuth42 : {cachedValue}', file=sys.stderr)
#         if cachedValue is not None:
#             user = mid.get_user_in_db('id', cachedValue.get('id'))
#             response.content = cachedValue
#             cache.delete(userIp)
#             response.status_code = 200
#             coockie = mid.setCookie(user, response)
#             response.set_cookie(coockie)
#             return response(data={"avatar": user.Avatar, "guestMode": "False", "username": user.Username, 'lang': language}, status=200)
#         else:
#             return JsonResponse({"error": "still waiting"}, status=204)#a changer pour 200
#     else:
#         return HttpResponse(status=405)

@csrf_exempt
@require_http_methods(["POST"])
def updateUserInfos(request):
    decoded_body = request.body.decode('utf-8')
    print(f'body dans updta user info: {request.body}', file=sys.stderr)
    body = mid.loadJson(request.body.decode('utf-8'))
    if body is None:
        return JsonResponse({"error": "invalid Json"}, status=403)

    # Vérifiez s'il y a un fichier et si son contenu est non vide
    if 'file' in body:
        # Imprimez le contenu du fichier
        print("Contenu du fichier:", body['file'], file=sys.stderr)
    else:
        print("Aucun fichier trouvé ou vide", file=sys.stderr)
    # print(f'file dans updta user info: {decoded_body['file']}', file=sys.stderr)
    data = mid.loadJson(decoded_body)
    if data is None:
        return JsonResponse({"error": "invalid Json"}, status=403)
    data = mid.loadJson(request.body)
    if data is None:
        return JsonResponse({"error": "invalid Json"}, status=403)
    auth = mid.checkCookie(request, 'auth')
    if auth is None:
        print('coockie missing')
        return HttpResponse(status=403)
    user = ""
    try:
        user = mid.decodeJwt(auth)
        # user = mid.get_user_in_db('Username', userName)
    except mid.customException as e:
        print('e.data')
        return JsonResponse({"error": e.data}, status=e.code)
    if user is None:
        print(e.data)
        return JsonResponse({"error": "User does not exists"}, status=403)
    if 'username' in data and data['username'] and user.Username != data['username']:
        print("verification user already existing", file=sys.stderr)
        if mid.get_user_in_db('Username', data['username']) is not None:
            print('userneame', file=sys.stderr)
            return JsonResponse({"errorUsername": "username already exists"}, status=403)
        user.Username = data['username']
    if 'email' in data and data['email'] and user.Email != data['email']:
        try:
            mid.checkEmailFormat(data['email'])
        except mid.customException as e:
            return JsonResponse({"error": e.data}, status=200)
        print("verification email already existing", file=sys.stderr)
        if mid.get_user_in_db('Email', data['email']) is not None:
            print('enmail', file=sys.stderr)
            return JsonResponse({"errorEmail": "email already exists"}, status=403)
        user.Email = data['email']
    if 'passwordNew' in data and data['passwordNew']:
        print(f'passwordd: |{data["passwordNew"]}|', file=sys.stderr)
        if (len(data['passwordNew'])) < 8 or len(data['passwordNew']) > 70:
            return JsonResponse({'error': 'password length should be between 8 and 70 characters'}, status=200)
        try:
            if 'passwordCurr' in data and data['passwordCurr']:
                if bcrypt.checkpw(data['passwordCurr'].encode('utf-8'), user.Password.encode('utf-8')):
                    encoded_password = mid.generate_bcrypt_hash(data['passwordNew'])
                    user.Password = encoded_password.decode('utf-8')
                else:
                    return JsonResponse({"error": "old password does not match"}, status=401)
        except Exception as e:
            return JsonResponse({"error":e}, status=200)
#    if 'avatar' in data and data['avatar']:#on recoit une image je l'enregistre dans le volume et stock l'url
#        # image_validation()
#        print(f'ceci est un fichier ! {request.FILES}',file=sys.stderr)
#        print(f'avant la boucle',file=sys.stderr)
#        for key, value in request.FILES.items():
#            print(f"cle: {key}, Valoeur {value}")
#        print(f'apres la boucle',file=sys.stderr)
#        user.Avatar = data['avatar']
    if 'lang' in data and data['lang']:
        print("je passe par les langues 1", file=sys.stderr)
        if mid.is_valid_lang(data['lang']):
            user.language = data['lang']
    expiration_time = (datetime.now() + timedelta(days=7)).timestamp()  # 300 secondes = 5 minutes penser a mettre ca dans l'env ca serait smart
    try:
        user.save()
    except Exception:
        return JsonResponse({"error": "unable to save in database"}, status=500)
    response_data = JsonResponse({"message": "User information updated successfully"}, status=200)
    mid.setCookie(user, response_data)
    return response_data

@csrf_exempt
def sendNewPaswd(request):
    decoded_body = request.body.decode('utf-8')
    print(f'body dans get new psswd: {request.body}', file=sys.stderr)
    data = mid.loadJson(request.body.decode('utf-8'))
    if data is None:
        return JsonResponse({"error": "invalid Json"}, status=403)
    url = request.build_absolute_uri()
    print(url, file=sys.stderr)
    if 'code' not in data or not data['code']:
        return JsonResponse({"error": "code is missing"}, status=403)
    if 'password' not in data or not data['password']:
        return JsonResponse({"error": "password is missing"}, status=403)
    username = cache.get(data['code'], None)
    if username is None:
        return JsonResponse({"error": "invalid code"}, status=401)
    dbUser = mid.get_user_in_db('Username', username)
    if dbUser is None:
        return JsonResponse({"error": "user does not exist"}, status=403)
    try:
        #verif taille password
        if len(data['password']) < 8 or len(data['password']) > 70:
            return JsonResponse({'error': 'password length should be between 8 and 70 characters'}, status=200)
        encoded_password = mid.generate_bcrypt_hash(data['password'])
        dbUser.Password = encoded_password.decode('utf-8')
    except Exception as e:
        print(f"error == {e}", file=sys.stderr)
        return JsonResponse({"error": "There's something wrong, please try again."}, status=200)
## DONT FORGET TO CHECK EVERYTHING BEFORE TRYINNG TO SAVE IN DB
#
    try:
        dbUser.save()
    except Exception:
        return JsonResponse({'error': 'Unable to save in database'}, status=200)
    # if 'username' in data and data['username'] and user.Username != data['username']:
    cache.delete(data['code'])
    return JsonResponse({'message': "new password set successfuly"})
#
##

@csrf_exempt
def disconnect(request):
    response = HttpResponse()
    response.set_cookie('auth', '', expires='Thu, 01 Jan 1970 00:00:00 GMT')
    return response

@csrf_exempt
def updateInfo(request):
    auth = mid.checkCookie(request, 'auth')
    user = ''
    if auth is None:
        return JsonResponse({'error': 'Unauthorized request'}, status=403)
    user = ""
    try:
        user = mid.decodeJwt(auth)
    except mid.customException as e:
        return JsonResponse({"error": e.data}, status=e.code)
    if user is None:
        return JsonResponse({"error": "User does not exists"}, status=403)
    # print(f'le lat time online de {user.Username} est: {user.lastTimeOnline}', file=sys.stderr)
    time = datetime.now()
    tz = pytz.timezone('CET')
    tzTime = tz.localize(time)
    # print(f'tztime {tzTime}', file=sys.stderr)
    friendObject = []
    foeObject = []
# creer l'obj ami a renvoyer
    for friend in user.friendsList:
        DBFriend = mid.get_user_in_db("Username", friend)
        # print(f'player time == {user.lastTimeOnline}, frinend time == {DBFriend.lastTimeOnline} tetng time == {user.lastTimeOnline - DBFriend.lastTimeOnline  < timedelta(seconds=10)}', file=sys.stderr)
        online = 'true' if user.lastTimeOnline - DBFriend.lastTimeOnline  < timedelta(seconds=10) else 'false'
        # print(f'online ???? {online}', file=sys.stderr)
        friendObject.append({
            "username": DBFriend.Username,
            "lastTimeOnline": DBFriend.lastTimeOnline.isoformat(),
            # "id": DBFriend.id,
            "avatar":DBFriend.Avatar,
            "online": online
        })
    user.lastTimeOnline = tzTime
    user.save()
#lster les bloques a renvoyer
    for block in user.foeList:
        DBFoe = mid.get_user_in_db("Username", block)
        avatarPath = ""
        if not DBFoe.Avatar:
            avatarPath = "/images/default_avatar.png"
        else:
            avatarPath = DBFoe.Avatar
        foeObject.append({
            "username": DBFoe.Username,
            # "lastTimeOnline": DBFoe.lastTimeOnline.isoformat(),
            # "id": DBFriend.id,
            "avatar":avatarPath
        })
#recuperer les defis qui nous ont etes lances
    challenge = cache.get('pendingChallenge', {})
    receivedChallenge = []
    if user.id in challenge:
        receivedChallenge = challenge[user.id]
    # print(f'update info : liste des challenge en attente: {challenge}', file=sys.stderr)
    # print(f'update info : challenge en attente de l user: {user.Username} son id: {user.id} et ses challenges en attentes sont: {receivedChallenge}', file=sys.stderr)
    challengerArray = []
    for i, challanger in enumerate(receivedChallenge):
        loopUser = mid.get_user_in_db('id', challanger[0])
        if loopUser is None:
            pass# print('update info :  no user found', file=sys.stderr)
        else:
            if challanger[2] == False:
                print(f'update info :  challenger en attente de l user: {loopUser} ', file=sys.stderr)
                receivedChallenge[i] = (challanger[0], challanger[1], True)
                challengerArray.append(challanger[1])
    cache.delete('pendingChallenge')
    cache.set('pendingChallenge', challenge, 7200)
#recuperer le defi qui a ete lance et accepte s'il y en a un
    acceptedChallenge = cache.get('accecptedChallenge', {})
    if user.id in acceptedChallenge:
        accepted = acceptedChallenge[user.id]
        cache.delete('accecptedChallenge')
        del acceptedChallenge[user.id]
        cache.set('accecptedChallenge', challenge, 7200)
    accepted = cache.get(f'accecptedChallenge{user.id}', "")
    cache.delete(f'accecptedChallenge{user.id}')
    if accepted:
        accepted = mid.get_user_in_db('id', accepted)
        if accepted is None:
            return JsonResponse({"error": "user does not exist"}, status=200)
        else:
            accepted = accepted.Username
#objet a renvoyer
    objectPing = {
        "username": user.Username,
        "avatar": user.Avatar,
        "language": user.language,
        'friendList': friendObject,
        'blockList': foeObject,
        'challengeReceived': {'game': 'pong', 'username': challengerArray},#empecher de se defier soi meme ca serait une bonne idee
        'challengeAccepted': {'game': 'pong', 'username': accepted}
    }

    # print(f'update info : object: {json.dumps(objectPing)}', file=sys.stderr)
    return JsonResponse(objectPing, status=200)

@csrf_exempt
def sendInvitation(request):
    # tjs valide sauf bidouille verifier l'user
    #ajouter dans le cache {pendingChallenge:{challanged: challenger}}
    auth = mid.checkCookie(request, 'auth')
    if auth is None:
        print('coockie missing')
        return HttpResponse(status=403)
    dbUser = {}
    try:
        dbUser = mid.decodeJwt(auth)#bdd
    except mid.customException as e:
        return JsonResponse({"error": e.data}, status=e.code)
    if dbUser is None:
        return JsonResponse({"error": "User does not exist"}, status=401)
    usernameId = dbUser.id
    data = mid.loadJson(request.body)
    if data is None:
        return JsonResponse({"error": "invalid Json"}, status=403)
    if 'toChallenge' not in data:
        return JsonResponse({"error": "invalid Json"}, status=403)
    challengedUser = mid.get_user_in_db('Username', data['toChallenge'])
    if challengedUser is None:
        return JsonResponse({"error": "user does not exist"}, status=200)
    challenge = cache.get('pendingChallenge', {})
    if challengedUser.id not in challenge:
        challenge[challengedUser.id] = []
    challenge[challengedUser.id].append((usernameId, dbUser.Username, False))
    cache.set('pendingChallenge', challenge, 7200)
    # print(f'ceci est la liste des challenges en cours!: {challenge}', file=sys.stderr)
    challenge = cache.get('pendingChallenge', {})
    print(f'ceci est la liste des challenges en cours!: {challenge}', file=sys.stderr)
    return JsonResponse({"message": "player successfully invited"}, status=200)

@csrf_exempt
def acceptInvitation(request):
#recuperer et verifier le coockie auth
    auth = mid.checkCookie(request, 'auth')
    if auth is None:
        print('coockie missing')
        return HttpResponse(status=403)
    user = {}
#decoder le jwt et recuperer une instance de l'user via la DB
    try:
        user = mid.decodeJwt(auth)
    except mid.customException as e:
        return JsonResponse({"error": e.data}, status=e.code)
    if user is None:
        return JsonResponse({"error": "user does not exist"}, status=403)
# recuperer dans le cache la liste des defis en attente
    pendingChallenge = cache.get('pendingChallenge', None)
    if pendingChallenge is None:
        return JsonResponse({"error": "challenge is not acceptable anymore."}, status=200)
#recuperer les defis lances a notre user dans les defis en attente
    if user.id not in pendingChallenge:
        return JsonResponse({"error": "challenge is not acceptable anymore."}, status=200)
    arrayChallenger = pendingChallenge[user.id]

#decompresser le json d body puis verifier la presence du champ 'username'
    data = mid.loadJson(request.body)
    if data is None or 'username' not in data:
        return JsonResponse({"error": "invalid Json"}, status=403)

#recuperer l'adversaire en bdd
    ligne_correspondance = ''
    opponent = mid.get_user_in_db('Username', data['username'])
    if opponent is None:
#si on ne trouve pas l'username en db on cherche une reference de cet username dans les defis en atente
        ligne_correspondance = next((ligne for ligne in arrayChallenger if ligne[0] == opponent.id), None)
        if ligne_correspondance is None:
            return JsonResponse({"error": "cannot found opponent."}, status=200)
#sinon on le cherche avec le id car l'username a ete identifie l'user a pu changer son userame, echec si l'user a ete delete?      
        opponent = mid.get_user_in_db('id', ligne_correspondance[0])
        if opponent is None:
            return JsonResponse({"error": "cannot found opponent."}, status=403)
#cas ou l'adversaire a ete trouve mais que l'username ne correspond pas
    else:
        ligne_correspondance = next((ligne for ligne in arrayChallenger if ligne[1] == opponent.Username), None)
        if ligne_correspondance is None:
            ligne_correspondance = next((ligne for ligne in arrayChallenger if ligne[0] == opponent.Username), None)
            if ligne_correspondance is None:
                return JsonResponse({"error": "cannot found opponent."}, status=403)
#l'adversaire a maintenant ete identifie
    userIsPlaying = False
    challengerIsPlaying = False
# verifier si deja une partie existe pour notre user
    response = requests.post('http://pong:8004/PlayerPlaying/', json={"username":user.id})
    if response.status_code == 200:
        print('je passe par la', file=sys.stderr)
        userIsPlaying = True
# verifier si deja une partie existe pour l adversaire 
    response = requests.post('http://pong:8004/PlayerPlaying/', json={"username":opponent.id})
    if response.status_code == 200:
        print('je passe par la', file=sys.stderr)
        challengerIsPlaying = True
    print(f'userIsPlaying: {userIsPlaying}, challengerIsPlaying: {challengerIsPlaying}', file=sys.stderr)
    if userIsPlaying is True or challengerIsPlaying is True:
        return JsonResponse({"error": "You or the challenger player is currently playing. Try again later."}, status=200)
    gameData = {'player1': user.id, 'player2': opponent.id}
# creer la partie en bdd
    gameResponse = requests.post('http://pong:8004/initGame/', json=gameData)#inscrit la partie en bdd jeu
    print(f'acceptInvitation: response for PlayerPlaying == {gameResponse.status_code}', file=sys.stderr)
    print(f'acceptInvitation: body for PlayerPlaying == {gameResponse.text}', file=sys.stderr)
    if (gameResponse.status_code != 201):
        return JsonResponse({"error": "failed to initate game"}, status=gameResponse.status_code)
# challenge[challengedUser.id] = usernameId
    cache.set(f'accecptedChallenge{opponent.id}', user.id, 60)
    cache.delete('pendingChallenge')
#recuperer l'index de la ligne pour effacer ce defi
    line_index = next((i for i, ligne in enumerate(arrayChallenger) if ligne[0] == opponent.Username), None)
    if line_index:
        arrayChallenger.pop(line_index)
    if not line_index or not arrayChallenger:
        del pendingChallenge[user.id]
    else:
        pendingChallenge[user.id] = arrayChallenger
#remettre les autres dans dans le cache
    cache.set('pendingChallenge', pendingChallenge, 7200)
    # remove des partiePending + ajouter dans les parties acceptee cle challenger value chlange player user de cette requete
    return JsonResponse({}, status=200)

@csrf_exempt
def checkCodeLog(request):
    data = mid.loadJson(request.body)
    if data is None:
        return JsonResponse({"error": "invalid Json"}, status=403)
    #recoit un demande d'activation 2fa on recupere l'usser via le JWT et on lui envoie un mail contannt le code + le stocker en cache cle code value user 10 minutes
    if 'code' in data:
        print(f"code == {data['code']}", file=sys.stderr)
        code = data['code']
        username = cache.get(code)
        cache.delete(code)
        user = mid.get_user_in_db("Username", username)
        if user is None:
            return JsonResponse({"error":"Invalid code"}, status=401)
        expiration_time = (datetime.now() + timedelta(days=7)).timestamp()  # 300 secondes = 5 minutes penser a mettre ca dans l'env ca serait smart
        encoded_jwt = jwt.encode({"userName": user.Username, "expirationDate": expiration_time}, os.environ['SERVER_JWT_KEY'], algorithm="HS256")
        response = HttpResponse(json.dumps({"guestMode": "false", 'username': user.Username, 'avatar':user.Avatar, 'lang':user.language, 'email': user.Email}), content_type="application/json")
        #setCookie ici
        response.set_cookie(
        'auth',
        encoded_jwt,
        httponly=True,
        secure=True,
        samesite='Strict',
        expires=datetime.utcnow() + timedelta(hours=100))
        return response
    else:
        return HttpResponse(status=401)    #recupere le code dans le json

@csrf_exempt
@require_http_methods(["POST"])
def checkCodeSet(request):
    #recupere le code dans le json
    #le get dans le cache la value est == a l'user
    #recuperer l'user en bdd et changer la value 2fa par mail

    # get cookie
    cookie = mid.checkCookie(request, 'auth')
    if cookie is None:
        return JsonResponse({'error': 'User not logged'}, status=401)

    #1 decodeJwt pour identifier user et s'assurer que le JWT est toujours valide.
    user = {}
    try:
        user = mid.decodeJwt(cookie)
    except mid.customException as e:
        return JsonResponse({'error': e.data}, status=e.code)

    # get code from body
    data = mid.loadJson(request.body)
    if data is None or 'type' not in data:
        return JsonResponse({"error": "invalid Json"}, status=403)
    code = data.get('type', None)
#    if code is None:
#        return JsonResponse({'error': 'Invalid Json'}, status=403)
    cacheUser = cache.get(code)
    print(f'caheUser: {repr(cacheUser)}, user.Username: {repr(user.Username)}', file=sys.stderr)
    if cacheUser != user.Username:
        return JsonResponse({'error': 'Wrong user'}, status=403)
#   Clear cache
    cache.delete(code)

#    user = mid.get_user_in_db('Username', user.Username)
#    if user is None:
#        return JsonResponse({'error': 'User not in db'}, status=403)
    user.twoFABool = 'true'
    try:
        user.save()
    except Exception:
        return JsonResponse({'error': 'Failed to write to database'}, status=500)
    return JsonResponse({"message": "2fa activation success"},status=200)

@csrf_exempt
@require_http_methods(["POST"])
def set2FA(request):
    #type:email
    #retourn 200 si mail echec + champ error set
    #recoit un demande d'activation ou de desactivation 2fa on recupere l'user via le JWT et on lui envoie un mail contenant le code + le stocker en cache cle code value user 10 minutes pour l'activation.
    #passer 2fa a false en cas de desactivation
    # recoit 'type' : 'email' ou 'off' du front

    # get cookie
    cookie = mid.checkCookie(request, 'auth')
    if cookie is None:
        return JsonResponse({'error': 'User not logged'}, status=401)

    #1 decodeJwt pour identifier user et s'assurer que le JWT est toujours valide.
    try:
        user = mid.decodeJwt(cookie)
    except mid.customException as e:
        return JsonResponse({'error': e.data}, status=e.code)

    #2 si type == email, set 2fa a True.
    #  else, set 2fa a False.
    data = mid.loadJson(request.body)
    if data is None:
        return JsonResponse({"error": "invalid Json"}, status=403)
    twoFaState = True if data['type'] == 'email' else False


    user = mid.get_user_in_db('Username', user)
    if user is None:
        return JsonResponse({'error': 'User not in db'}, status=403)
#    user.twoFA = twoFaState
#    try:
#        user.save()
#    except Exception:
#        return JsonResponse({'error': 'Failed to write to database'}, status=500)
    if user.twoFABool == 'true' and twoFaState == 'true':
        return JsonResponse({'error': '2FA already active'}, status=200)
    
    if twoFaState == False:
        user.twoFABool = 'false'
        try:
            user.save()
        except Exception:
            return JsonResponse({'error': 'Failed to write to database'}, status=500)
        return JsonResponse({'message': 'ok'}, status=200)
    
    #2.5 save code in cache

    code = mid.generate_code(8)
    cache.set(code, user.Username, timeout=600)

    #3 Envoyer un mail avec code de confirmation
    try:
        mid.send2FaMail(user.Username, user.Email, code)
    except mid.customException as e:
        return JsonResponse({'error': e.data}, status=e.code)
    return JsonResponse({'message': 'OK'}, status=200)

@csrf_exempt
@require_http_methods(["POST"])
def resetPasswd(request):
    validationCode = mid.generate_code()
    data = mid.loadJson(request.body)
    if data is None:
        return JsonResponse({"error": "invalid Json"}, status=403)
    email = ""
    if "email" not in data:
        print("je passe par erreur email", file=sys.stderr)
        return JsonResponse({'error': 'Invalid format'}, status=403)
    email = data['email']
    user = mid.get_user_in_db('Email', email)
    if user is None:
        print("je passe par erreur no user", file=sys.stderr)
        return JsonResponse({'error': 'User does not exist'}, status=403)
    cache.set(validationCode, user.Username,timeout=600)
    print(f'reset code == {validationCode}', file=sys.stderr)
    mailData = {
        'title': 'Transcendance Reset Password',
        'body': (
            f'Hey {user.Username},\n\n'
            'It looks like you requested to reset your password. No worries, we’ve got you covered!\n\n'
            'Click the link below to set a new password:\n\n'
            f'https://{os.environ["DUMP"]}:4433/index.html?reset=resetmypassword&code={validationCode}\n\n'
            'This link will be good for 10 minutes, so make sure to use it before it expires. If you missed it, just request another one.\n\n'
            'If you didn’t ask for a password reset, just ignore this email – your account is safe.\n\n'
            'Got any questions? Feel free to reach out to us!\n\n'
            'Cheers,\n'
            'The Team'
            ),
            'destinataire': email}
    response = requests.post('http://mail:8002/sendMail/', json=mailData)
    print({'error': 'Failed to send email {}'}, file=sys.stderr)
    if response.status_code != 200:
        return JsonResponse({'error': 'Failed to send email'}, status=500)
    return JsonResponse({'message': 'Password reset email sent successfully'}, status=200)

@csrf_exempt
@require_http_methods(["GET"])
def matchMaking(request):
    # decode jwt
    # recperer la ligne user en bdd
    # check si le joueur est dans le cache , l'enlever et set la marge lvladveraire
    # check dans le cache si on lui trouve un avdversaire
    # sinon ajouter le joueur dans le cache
    auth = mid.checkCookie(request, 'auth')
    if auth is None:
        return JsonResponse({'error': 'User not connected'}, status=403)
    print(f'le cookie est {auth}', file=sys.stderr)
    username = ""
    try:
        username = mid.decodeJwt(auth)
    except mid.customException as e:
        return JsonResponse({"error": e.data}, status=e.code)
    user = mid.get_user_in_db("Username", username)
    if user is None:
        return JsonResponse({"error": "User does not exits"}, status=403)
    print(f'le username est {username}', file=sys.stderr)
    matchmakingDict = cache.get('matchmaking', {})
    print(f"cache == {matchmakingDict}")
    userMatchmaking = {'time': datetime.now(), 'difLevel': 5, 'game': "pong" ,'levelPong': user.pongLvl, 'levelTetris':user.tetrisLvl, 'matched':False}#si marchd a true return 200
    if username in matchmakingDict.keys():
        userMatchmaking = matchmakingDict.pop(username)
        current_time = datetime.now()
        time_difference = current_time - userMatchmaking['time']
        if time_difference > timedelta(seconds=30):
            userMatchmaking['difLevel'] *= 2
            userMatchmaking['time'] = current_time
    if userMatchmaking['matched'] == True:
        cache.set('matchmaking', matchmakingDict, timeout=3600)
        return HttpResponse(status=200)
    maxLevel = userMatchmaking['levelPong'] if userMatchmaking['game'] == "pong" else userMatchmaking['levelTetris']
    maxLevel+=userMatchmaking['difLevel']
    minLevel = userMatchmaking['levelPong'] if userMatchmaking['game'] == "pong" else userMatchmaking['levelTetris']
    minLevel-=userMatchmaking['difLevel']
    for userName, data in matchmakingDict.items():
        if data['levelPong'] <= maxLevel and data['levelPong'] >= minLevel:
            print('ca matchmake la')
            data['matched'] = True
            cache.set('matchmaking', matchmakingDict, timeout=3600)
            return HttpResponse(status=200)
        else:
            print('ca matchamake pas la', file=sys.stderr)
        print(f"Username: {userName}, Time: {data['time'].timestamp()}, difference Level: {data['difLevel']}", file=sys.stderr)
    gameData = {'player1': "fguarrac", 'player2': "madaguen"}
    gameResponse = requests.post('http://localhost:8001/Pong/initGame/', json=gameData)#inscrit la partie en bdd jeu
    print(gameResponse.status_code, file=sys.stderr)
    matchmakingDict[username] = userMatchmaking
    cache.set('matchmaking', matchmakingDict, timeout=3600)#si pas trouve sinon inscrire en bdd game
    return HttpResponse(status=204)

@csrf_exempt
@require_http_methods(["GET"])
def ping(request):
    return HttpResponse(status=204)

@csrf_exempt
@require_http_methods(["POST"])
def sendFile(request):
    auth = mid.checkCookie(request, 'auth')
    if auth is None:
        return JsonResponse({'error': 'User not connected'}, status=403)
    print(f'le cookie est {auth}', file=sys.stderr)
    user = ""
    try:
        user = mid.decodeJwt(auth)
        if user is None:
            return JsonResponse({'error': 'User does not exist'}, status=403)
    except mid.customException as e:
        return JsonResponse({"error": e.data}, status=e.code)
    oldAvatar = user.Avatar
    try:
        imagePath = mid.image_validation(request)
        try:
            user.Avatar = imagePath
            user.save()
        except Exception:
            return JsonResponse({'error': "Can't save in database"}, status=500)
    except Exception:
        return JsonResponse({'error': "Invalid image format"}, status=200)
    if oldAvatar:
        os.remove(oldAvatar)
    return HttpResponse(status=200)

@csrf_exempt
@require_http_methods(["POST"])
def addFriend(request):
    #1 decodeJwt pour identifier la personne qui veut ajouter un ami et s'assurer que le JWT est toujours valide.
    #2 verifier qu'on ne s'ajoute pas soi meme
    #3 check si ami en db
    #4 check si ami a ajouter est dans la liste d'ennemis et l'en supprimer s'il y est.
    #4.5 check si ami pas deja dans liste d'amis.
    #5 Ajouter ami dans la liste d'amis.
    #6 renvoyer status == 200

    #1
    cookie = mid.checkCookie(request, 'auth')
    if cookie is None:
        return JsonResponse({'error': 'User not logged'}, status=401)
    try:
      user = mid.decodeJwt(cookie)
    except mid.customException as e:
      return JsonResponse({'error': e.data}, status=e.code)

    #2
    data = mid.loadJson(request.body)
    if data is None:
        return JsonResponse({"error": "invalid Json"}, status=403)
    if not 'newFriend' in data:
        return JsonResponse({'error': 'No newFriend in request body'}, status=403)
    newFriend = data['newFriend']
    if newFriend == user.Username:
        return JsonResponse({'error': 'NewFriend is user itself'}, status=403)

    #3
    newFriend = mid.get_user_in_db('Username', data['newFriend'])
    if newFriend is None:
        return JsonResponse({'error': 'newFriend not found'}, status=404)
     
    #4
    user = mid.get_user_in_db('Username', user)
    if user is None:
        return JsonResponse({'error': 'User does not exist'}, status=401)
    for x in user.foeList:
      if x == newFriend.Username:
          user.foeList.remove(newFriend.Username)

    #4.5
    for x in user.friendsList:
        if x == newFriend.Username:
            return JsonResponse({'error': 'Friend already in friends list'}, status=200)

    #5
    user.friendsList.append(newFriend)
    try:
      user.save()
    except Exception as e:
      print(f'Erreur addFriend : {e}', file=sys.stderr)
      return JsonResponse({'error': 'Failed to write to database'}, status=500)
    return JsonResponse({'message': 'OK'}, status=200)

@csrf_exempt
@require_http_methods(["POST"])
def blockUser(request):
    #1 decodeJwt pour identifier la personne qui veut bloquer une persone et s'assurer que le JWT est toujours valide.
    #2 verifier qu'on ne s'ajoute pas soi meme
    #3 check si personne en db
    #4 check si personne a bloquer est dans la liste d'amis et l'en supprimer s'il y est.
    #4.5 check si personne pas deja bloqué.
    #5 Ajouter personne dans la liste d'ennemis.
    #6 renvoyer status == 200

    #1
    cookie = mid.checkCookie(request, 'auth')
    if cookie is None:
        return JsonResponse({'error': 'User not logged'}, status=401)
    try:
      user = mid.decodeJwt(cookie)
    except mid.customException as e:
      return JsonResponse({'error': e.data}, status=e.code)

    #2
    data = mid.loadJson(request.body)
    if data is None:
        return JsonResponse({"error": "invalid Json"}, status=403)
    if not 'toBlock' in data:
        return JsonResponse({'error': 'No toBlock in request body'}, status=403)
    toBlock = data['toBlock']
    if toBlock == user.Username:
        return JsonResponse({'error': 'Person to block is user itself'}, status=403)

    #3
    toBlock = mid.get_user_in_db('Username', data['toBlock'])
    if toBlock is None:
        return JsonResponse({'error': 'Person to block not found'}, status=404)
     
    #4
    user = mid.get_user_in_db('Username', user)
    if user is None:
        return JsonResponse({'error': 'User does not exist'}, status=401)
    for x in user.friendsList:
        if x == toBlock.Username:
            user.friendsList.remove(toBlock.Username)

    #4.5
    for x in user.foeList:
        if x == toBlock.Username:
            return JsonResponse({'message': 'Person already blocked'}, status=200)

    #5
    user.foeList.append(toBlock)
    try:
      user.save()
    except Exception:
      return JsonResponse({'error': 'Failed to write to database'}, status=500)
    return JsonResponse({'message': 'OK'}, status=200)

@csrf_exempt
@require_http_methods(["POST"])
def deleteFriend(request):
    #1 decodeJwt pour identifier la personne qui veut supprimer un ami et s'assurer que le JWT est toujours valide.
    #2 check si ami a supprimer est dans la liste d'amis et l'en supprimer s'il y est.
    # renvoyer status == 200

    #1
    cookie = mid.checkCookie(request, 'auth')
    if cookie is None:
        return JsonResponse({'error': 'User not logged'}, status=401)
    try:
      user = mid.decodeJwt(cookie)
    except mid.customException as e:
      return JsonResponse({'error': e.data}, status=e.code)

    #2
    data = mid.loadJson(request.body)
    if data is None:
        return JsonResponse({"error": "invalid Json"}, status=403)
    if not 'unfriend' in data:
        return JsonResponse({'error': 'No unfriend in request body'}, status=403)
    unfriend = data['unfriend']
    user = mid.get_user_in_db('Username', user)
    if user is None:
        return JsonResponse({'error': 'User not in db'}, status=403)
    try:
        print(f'==== user: {user.Username}, friendsList: {repr(user.friendsList)}, unfriend: {repr(unfriend)} ====', file=sys.stderr)
        user.friendsList.remove(unfriend)
    except ValueError:
        return JsonResponse({'No friend to remove'}, status=404)
    try:
        user.save()
    except Exception:
        return JsonResponse({'error': 'Failed to write to database'}, status=500)
    return JsonResponse({'message': 'ok'}, status=200)

@csrf_exempt
@require_http_methods(["POST"])
def deleteBlockedUser(request):
    #1 decodeJwt pour identifier la personne qui veut supprimer une personne bloquee et s'assurer que le JWT est toujours valide.
    #2 check si personne a supprimer est dans la liste de bloques et l'en supprimer s'il y est.
    # renvoyer status == 200

    #1
    cookie = mid.checkCookie(request, 'auth')
    if cookie is None:
        return JsonResponse({'error': 'User not logged'}, status=401)
    try:
      user = mid.decodeJwt(cookie)
    except mid.customException as e:
      return JsonResponse({'error': e.data}, status=e.code)

    #2
    data = mid.loadJson(request.body)
    if data is None:
        return JsonResponse({"error": "invalid Json"}, status=403)
    if not 'unblock' in data:
        return JsonResponse({'error': 'No unblock in request body'}, status=403)
    unblock = data['unblock']
    user = mid.get_user_in_db('Username', user)
    if user is None:
        return JsonResponse({'error': 'User not in db'}, status=403)
    try:
        user.foeList.remove(unblock)
    except ValueError:
        return JsonResponse({'No blocked person to unblock'}, status=404)
    try:
        user.save()
    except Exception:
        return JsonResponse({'error': 'Failed to write to database'}, status=500)
    return JsonResponse({'message': 'ok'}, status=200)

@csrf_exempt
@require_http_methods(["POST"])
def seeHistory(request):

    cookie = mid.checkCookie(request, 'auth')
    if cookie is None:
        return JsonResponse({'error': 'User not logged'}, status=401)
    try:
      user = mid.decodeJwt(cookie)
    except mid.customException as e:
      return JsonResponse({'error': e.data}, status=e.code)

    data = mid.loadJson(request.body)
    if data is None:
        return JsonResponse({"error": "invalid Json"}, status=403)
    if not 'seeHistory' in data:
        return JsonResponse({'error': 'No username in request'}, status=403)
    historyUser = mid.get_user_in_db('Username', data['seeHistory'])
    if historyUser is None:
        return JsonResponse({'error': 'User not found in db'}, status=404)
    response = requests.post('http://pong:8004/getPlayerGames/', json={"username": historyUser.id})
    if response.status_code != 200:
        return JsonResponse({'error': 'Failed to retrieve history'}, status=200)
    matches = mid.loadJson(response.content)
    matches = matches['matches']
    for x in matches:
        print(f"x={x}", file=sys.stderr)
        x['username1'] = mid.get_user_in_db('id', x['username1']).Username
        x['username2'] = mid.get_user_in_db('id', x['username2']).Username
        x['winner'] = mid.get_user_in_db('id', x['winner']).Username
    return JsonResponse({'matches': matches}, status=200)
