from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from user import userMiddleware
import time
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
import os
import pyotp
import qrcode
import jwt
import bcrypt
import sys
import random

# mailData = {'title':'transcendance registration','body':f'welcome {username}, successfully registered', 'destinataire':'ftTranscendanceAMFEA@gmail.com'}
# response = requests.post('http://localhost:8001/sendMail/', json=mailData)#mettre la route dans l'env ou set la route definitive dans le build final?
# print(response.status_code)

# penser a check pasword size + check ancien password pour changement

class customException(Exception):
    def __init__(self, data, code):
        self.data = data
        self.code = code

# def setCookie(user, response):
#     expirationTime = 1209600
#     encoded_jwt = jwt.encode({"userName": user.Username, "expirationDate": time.time() + expirationTime}, os.environ.get('SERVER_JWT_KEY'), algorithm="HS256")
#     response.set_cookie(
#         'auth',
#         encoded_jwt,
#         httponly=True,
#         secure=True,
#         samesite='None',
#         expires=datetime.utcnow() + timedelta(hours=25),	# Expire avant le JWT...
#         # domain="*"
# 	)

def setCookie(user, response):
    expirationTime = 1209600
    encoded_jwt = jwt.encode({
        "userName": user.Username,
        "id": user.id,
        "expirationDate": time.time() + expirationTime
    }, os.environ.get('SERVER_JWT_KEY'), algorithm="HS256")
    response.set_cookie(
        'auth',
        encoded_jwt,
        httponly=True,
        secure=True,
        samesite='None',
        expires=datetime.utcnow() + timedelta(hours=25),
    )

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

def checkCookie(request, str):#middleware
    # print_all_cookies(request)
    if str in request.COOKIES:
        return request.COOKIES[str]
    else:
        return None

def get_user_in_db(field_name: str, value: str):#middleware //a utliser pour check si un champ unique est deja utilise dans update info
    try:
        print(f'fieldname {field_name}, value {value}', file=sys.stderr)
        user = User.objects.get(**{field_name: value})
        print(user, file=sys.stderr)
        print("Informations de l'utilisateur :")
        for attr_name, attr_value in vars(user).items():
            print(f"{attr_name}: {attr_value}", end=" ")
    
        print()  # Ajout d'une ligne après la liste des attributs
        return user
    except Exception:  #Not defined
        return None

def register_user_in_database(user_info:dict):
    try:
        user_info.save()
    except Exception:
        raise customException("User already exists", 409)

def generate_bcrypt_hash(password: str) -> bytes:
    salt = bcrypt.gensalt()
    password_encoded = bcrypt.hashpw(password.encode('utf-8'), salt)
    return password_encoded

# def generate_bcrypt_hash(password: str) -> str:#middleware
#     salt = bcrypt.gensalt()
#     passwordEncoded = bcrypt.hashpw(password.encode('utf-8'), salt)
#     return passwordEncoded

def compare_bcrypt_hash(username:str, password: str) -> bool:#middleware
    dbUser = get_user_in_db(Username, username)
    if dbUser == False: #Should be None ?
        return False
    if bcrypt.checkpw(password.encode('utf-8'), dbUserList[0].Password.encode('utf-8')):
        return True
    else:
        return False


def CheckInfoRegister(data):
    userData = {}
    if 'username' in data:
        userData['username'] = data['username']
    if 'password' in data:
        userData['password'] = data['password']
    if 'email' in data:
        userData['email'] = data['email']
    if 'lang' in data:
        userData['lang'] = data['lang']
        missing_fields = []
    for field in ['username', 'password', 'email', 'lang']:
        if field not in userData or not userData[field].strip():
            missing_fields.append(field)
    if missing_fields:
        raise customException(f'missing field: {missing_fields}', 401)
    return userData

@csrf_exempt
@require_http_methods(["POST"])
def register(request):#check si user est unique sinon refuser try except get?	#Set language par default ou la récupérer du front ?
  
    print(f"ici body == {request.body}", file=sys.stderr)
    data = {}
    try:
        data = json.loads(request.body)
    except Exception as e:
        return JsonResponse({"error": "invalid Json"}, status=403)
    userData = {}
    try:
        userData = CheckInfoRegister(data)
    except customException as e:
        return JsonResponse({'error': e.data}, status=e.code)
    time = datetime.now()
    tz = pytz.timezone('CET')
    tzTime = tz.localize(time)
    hashed_password = bcrypt.hashpw(userData['password'].encode('utf-8'), bcrypt.gensalt())
    new_user = User(
        Email=userData['email'],
        Username=userData['username'],
        Password=hashed_password.decode('utf-8'),  # Décodage du hash en UTF-8
        lastTimeOnline=tzTime,
        pongLvl=0,
        language=userData['lang'],
        tetrisLvl=0,
        twoFA=True,
        friendsList = [],
        foeList = [],
    )
    try:
        new_user.save()
    except Exception as error:
        print('ca a echouer a ecrie en bdd')
        response_data = JsonResponse({"error": "erreur in database"}, status=409)
        print(error)
        return(response_data)
    print(f'new user username {new_user.Username}, avatar = {new_user.Avatar}, langage = {new_user.language}')
    response_data = JsonResponse({"2fa": 'False',  "email": userData['email'], "guestMode":"false", "username":new_user.Username, "avatar": '/images/default_avatar.png' , "lang": new_user.language}, status=201)
    expiration_time = (datetime.now() + timedelta(days=7)).timestamp()  # 300 secondes = 5 minutes
    encoded_jwt = jwt.encode({"userName": userData['username'], "expirationDate": expiration_time}, os.environ['SERVER_JWT_KEY'], algorithm="HS256")    #    Export to .env file        #    Add env_example file
    setCookie(new_user, response_data) ### TEST THIS OUT ###
#    response_data.set_cookie(
#        'auth',
#        encoded_jwt,
#        httponly=True,
#        secure=True,
#        samesite='None',
#        expires=datetime.utcnow() + timedelta(hours=25),	# Expire avant le JWT...
#        # domain="*"
#    )
    print("tout est ok")
    return (response_data)

def decodeJwt(auth_coockie):
    decodedJwt = ""
    try:
        decoded_token = jwt.decode(auth_coockie, os.environ['SERVER_JWT_KEY'], algorithms=["HS256"])
        username = decoded_token.get('userName')  # Extract the username from the token	#	Quelle utilité ?
    except jwt.InvalidTokenError:
        raise customException("Forbidden", 403)
    print(username)
    print(decoded_token)
    print(decoded_token.get("expirationDate"))
    print(time.time())
    if decoded_token.get("expirationDate") < time.time():
        raise customException("Token expired", 401)
    # check si user existe toujours en db
    user = get_user_in_db("Username", username)
    if not user:
        raise customException("User does not exists", 403)
    # return JsonResponse({'success': 'User connected'}, status=200)
    return user

@require_http_methods(["GET"])
def checkJwt(request):
    #if request.method != 'GET':
        #return JsonResponse({'error': 'Méthode non autorisée'}, status=405)
    auth = checkCookie(request, 'auth')
    if auth is None:
        return JsonResponse({"error": "user not log"}, status=200)
    print(f'le cookie est {auth}', file=sys.stderr)
    try:
        username = decodeJwt(auth)
        user = get_user_in_db('Username', username)
        if not user:
            return JsonResponse({"error": "user does nor exist"}, status=403)
        print(f'le cookie est {auth}', file=sys.stderr)
        print(f'username:{user.Username}, Avatar:{user.Avatar}, lang: {user.language}', file=sys.stderr)
        avatar = ''
        if not user.Avatar:
            avatar = '/images/default_avatar.png'
        else:
            avatar = user.Avatar
        return JsonResponse({"username":user.Username, "Avatar":avatar, "lang": user.language}, status=200)
    except customException as e:
        return JsonResponse({"error": e.data}, status=e.code)

@csrf_exempt
@require_http_methods(["POST"])
def login(request):
    data = json.loads(request.body)
    userData = {}
    if 'email' in data:
        userData['email'] = data['email']
    if 'password' in data:
        userData['password'] = data['password']

#    requestUserName = data['username']
 #   password = data['password']
    # hash for comparison with db
    # Guard against injection/xss here?
    # Check if empty name or password?
    # Check for minimum lengths?
    dbUser = get_user_in_db("Email", userData['email'])
    print(f"le user{dbUser}", file=sys.stderr)
    if dbUser is None:
        print('on passe par ici', file=sys.stderr)
        return JsonResponse({"error":"invalid credentials"}, status=401)
    
#        for user in dbUserList:
#            print(f'dbUser == {dbUserList} Username {user.Username} password == {user.Password}')
#            print(f'language: {user.get_language_display()}')
#            print(f'TwoFA: {user.get_twoFA_display()}')
        # mydata = User.objects.all().values()
        # print(mydata)
        # print(list(mydata))
        # print(f'username == {requestUserName}')
        # dbUser = User.objects.filter(Username__exact=requestUserName)
        # dbUserList = list(dbUser)
        # print(f'dbUser == {dbUserList} Username {dbUserList[0].Username} password == {dbUserList[0].Password}')
        # print(f'dbUser == {dbUserList} Username {dbUserList[0].Username} password == {dbUserList[0].Password}')
    print(f"pwd == {dbUser.Password}", file=sys.stderr)
    if bcrypt.checkpw(userData['password'].encode('utf-8'), dbUser.Password.encode('utf-8')):
        print("Le mot de passe est valide.", file=sys.stderr)
    else:
        print("Le mot de passe est invalide.", file=sys.stderr)
        return JsonResponse({'error': 'invalid credentials'}, status=401)
    encoded_jwt = jwt.encode({"userName": dbUser.Username, "expirationDate": time.time() + 300}, os.environ.get('SERVER_JWT_KEY'), algorithm="HS256")#    Export to .env file        #    Add env_example file
    if dbUser.twoFA != 'None':
        print("coucou 2fa", file=sys.stderr)
        code = generate_code(8)
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
        print({'error': 'Failed to send email {}'}, file=sys.stderr)
        if response.status_code != 200:
            return JsonResponse({'error': 'Failed to send email'}, status=500)

        return JsonResponse({"twoFA": 'true', 'guestMode': 'false'}, status=200)#code a verifier code 2fa attendu
    response_data = JsonResponse({"twoFA": 'false', "guestMode": "false", "username":dbUser.Username, "Avatar":dbUser.Avatar, "lang": dbUser.language, "email": dbUser.Email})
    response_data.status = 200
    response_data.set_cookie(
    'auth',
    encoded_jwt,
    httponly=True,   # Empêche l'accès JavaScript au cookie
    secure=True,     # Assure que le cookie est envoyé uniquement sur HTTPS
    samesite='None',
    expires=datetime.utcnow() + timedelta(hours=100))
    print("tout va bien", file=sys.stderr)
    return (response_data)
    # userIp = request.META.get('REMOTE_ADDR')
    # print(f"voici l'ip user{userIp}")

@csrf_exempt
def auth42(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    authorization_code = request.GET.get('code')
    data = {
        'grant_type': 'authorization_code',
        'client_id': os.environ.get('FTAUTHUID'),
        'client_secret': os.environ.get('FTAUTHSECRET'),
        'code': authorization_code,
        'redirect_uri': 'http://localhost:8000/auth42'
    }
    response = requests.post('https://api.intra.42.fr/oauth/token', json=data)
    if response.status_code != 200:
        return JsonResponse({'error': 'Failed to obtain access token'}, status=response.status_code)
    access_token = response.json().get('access_token')
    if not access_token:
        return JsonResponse({'error': 'Access token not found in response'}, status=403)
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
            'auth',
            'test', #ici token jwt
            httponly=True,   # Empêche l'accès JavaScript au cookie
            secure=True,     # Assure que le cookie est envoyé uniquement sur HTTPS
            samesite='Strict',
            expires=datetime.utcnow() + timedelta(hours=1)
            )
        else:
            return HttpResponse(status=204)
    else:
        return HttpResponse(status=405)
    return response

def save_file(uploaded_file):
    upload_dir = '/images'
    file_name = generate_code()
    file_path = os.path.join(upload_dir, file_name)
    print(f"path image == {file_path}", file=sys.stderr)
    with open(file_path, 'wb+') as destination:
        for chunk in uploaded_file.chunks():
            destination.write(chunk)
    return file_path


def image_validation(request):
    if 'image' in request.FILES:
        uploaded_file = request.FILES['image']
        mime_type = uploaded_file.content_type
        accepted_mime_types = [
            'image/jpeg',   # JPEG
            'image/png',    # PNG
            'image/svg+xml', # SVG
            'image/webp'    # WebP
        ]
    if mime_type in accepted_mime_types:
        return save_file(uploaded_file)
    else:
        raise customException("Invalid image format", 200)

# def is_valid_choice(value, model_class):
#     try:
#         print(f'value == {value}', file=sys.stderr)
#         choices = getattr(model_class, 'language', None)
#         if choices is None:
#             print(f'choices == {choices}', file=sys.stderr)
#             return False 
#         print(f'return value == {value in [choice[0] for choice in choices]}', file=sys.stderr)
#         return value in [choice[0] for choice in choices]
#     except Exception as e:
#         print(f'exception == {e}', file=sys.stderr)

def is_valid_choice(value, model_class):
    valid_choices = ["FR", "EN", "NL"]
    return value in valid_choices

@csrf_exempt
@require_http_methods(["POST"])
def updateUserInfos(request):
    data = {}

    # Parsez le JSON
    # parsed_json = {}

    # print(f'body: {request.body}')
    decoded_body = request.body.decode('utf-8')
    print(f'body dans updta user info: {request.body}', file=sys.stderr)
    body = json.loads(request.body.decode('utf-8'))

    # Vérifiez s'il y a un fichier et si son contenu est non vide
    if 'file' in body:
        # Imprimez le contenu du fichier
        print("Contenu du fichier:", body['file'], file=sys.stderr)
    else:
        print("Aucun fichier trouvé ou vide", file=sys.stderr)
    # print(f'file dans updta user info: {decoded_body['file']}', file=sys.stderr)
    try:
        data = json.loads(decoded_body)
    except Exception as e:
        print("Erreur lors du parsing JSON", file=sys.stderr)
        return JsonResponse({'error': "invalid Json"}, status=403)

    # # Accédez au champ "avatar"
    # if 'avatar' in parsed_json:
    #     avatar_info = parsed_json['avatar']
    # print("Body:", avatar_info.get('body'), file=sys.stderr)
    # print(f'avatar update user info: {request.body['avatar']}', file=sys.stderr)
    # data = json.loads(request.body.decode('utf-8'))#try catch

    # avatar = data['avatar']
    print(f'Avatar update user info: {avatar}', file=sys.stderr)
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        print('json')
        return JsonResponse({'error': 'Invalid JSON'}, status=403)
    auth = checkCookie(request, 'auth')
    if auth is None:
        print('coockie missing')
        return HttpResponse(status=403)
    user = ""
    try:
        user = decodeJwt(auth)
        # user = get_user_in_db('Username', userName)
    except customException as e:
        print('e.data')
        return JsonResponse({"error": e.data}, status=e.code)
    if user is None:
        print(e.data)
        return JsonResponse({"error": "User does not exists"}, status=403)
    # try:
    #     user = User.objects.filter(Username__exact=userName)
    #     dbUserList = list(dbUser)
    #     for user in dbUserList:
    #         print(f'dbUser == {dbUserList} Username {user.Username} password == {user.Password}')
    #         print(f'language: {user.get_language_display()}')
    #         print(f'TwoFA: {user.get_twoFA_display()}')
    # except Exception as e:
        # return JsonResponse({'error': 'user do not exist'}, status=403)
    if 'username' in data and data['username'] and user.Username != data['username']:
        print("verification user already existing", file=sys.stderr)
        if get_user_in_db('Username', data['username']) is not None:
            print('userneame', file=sys.stderr)
            return JsonResponse({"errorUsername": "username already exists"}, status=403)
        user.Username = data['username']
    if 'email' in data and data['email'] and user.Email != data['email']:
        print("verification email already existing", file=sys.stderr)
        if get_user_in_db('Email', data['email']) is not None:
            print('enmail', file=sys.stderr)
            return JsonResponse({"errorEmail": "email already exists"}, status=403)
        user.Email = data['email']
    if 'passwordNew' in data and data['passwordNew']:
        print(f'passwordd: |{data["passwordNew"]}|', file=sys.stderr)
        if (len(data['passwordNew'])) < 8 or len(data['passwordNew']) > 70:
            return JsonResponse({'error': 'password length should be between 8 and 70 characters'}, status=200)
        try:#penser a comparer le currpasswd avec celui en bdd
            encoded_password = generate_bcrypt_hash(data['passwordNew'])
            user.Password = encoded_password.decode('utf-8')
        except Exception as e:
            print(f"error == {e}", file=sys.stderr)
            return JsonResponse({"error":e}, status=200)
    if 'avatar' in data and data['avatar']:#on recoit une image je l'enregistre dans le volume et stock l'url
        # image_validation()
        print(f'ceci est un fichier ! {request.FILES}',file=sys.stderr)
        print(f'avant la boucle',file=sys.stderr)
        for key, value in request.FILES.items():
            print(f"cle: {key}, Valoeur {value}")
        print(f'apres la boucle',file=sys.stderr)
        user.Avatar = data['avatar']
    if 'lang' in data and data['lang']:
        print("je passe par les langues 1", file=sys.stderr)
        if is_valid_choice(data['lang'], User.language):
            print("La langue est valide", file=sys.stderr)
            print("jep asse par les langues 2", file=sys.stderr)
            user.language = data['lang']
    expiration_time = (datetime.now() + timedelta(days=7)).timestamp()  # 300 secondes = 5 minutes penser a mettre ca dans l'env ca serait smart
    print("uptade de new user", file=sys.stderr)
    print(f"username == {user.Username}, email == {user.Email}, Avatar == {user.Avatar}, langue == {user.language}", file=sys.stderr)
    user.save()
    response_data = JsonResponse({"message": "User information updated successfully"})
    encoded_jwt = jwt.encode({"userName": user.Username, "expirationDate": expiration_time}, os.environ['SERVER_JWT_KEY'], algorithm="HS256")
    response_data.set_cookie(
    'auth',
    encoded_jwt,
    httponly=True,
    secure=True,
    samesite='Strict',
    expires=datetime.utcnow() + timedelta(hours=100))
    return response_data

@csrf_exempt
def sendNewPaswd(request):
    decoded_body = request.body.decode('utf-8')
    print(f'body dans get new psswd: {request.body}', file=sys.stderr)
    data= {}
    try:
        data = json.loads(request.body.decode('utf-8'))#try catch
    except Exception as e:
        return JsonResponse({"error": "wrong Json format"}, status=403)
    url = request.build_absolute_uri()
    print(url, file=sys.stderr)
    if 'code' not in data or not data['code']:
        return JsonResponse({"error": "code is missing"}, status=403)
    if 'password' not in data or not data['password']:
        return JsonResponse({"error": "password is missing"}, status=403)
    username = cache.get(data['code'], None)
    if username is None:
        return JsonResponse({"error": "invalid code"}, status=401)
    dbUser = get_user_in_db('Username', username)
    if dbUser is None:
        return JsonResponse({"error": "user does not exist"}, status=403)
    try:
        encoded_password = generate_bcrypt_hash(data['password'])
        dbUser.Password = encoded_password.decode('utf-8')
    except Exception as e:
        print(f"error == {e}", file=sys.stderr)
        return JsonResponse({"error": "There's something wrong, please try again."}, status=200)
    dbUser.save()
    # if 'username' in data and data['username'] and user.Username != data['username']:
    return JsonResponse({'message': "new password set successfuly"})

@csrf_exempt
def disconnect(request):
    response = HttpResponse()
    response.set_cookie('auth', '', expires='Thu, 01 Jan 1970 00:00:00 GMT')
    return response

#ajouter les ids dans le jwt!!!!!!
@csrf_exempt
def updateInfo(request):
    auth = checkCookie(request, 'auth')
    user = ''
    if auth is None:
        return JsonResponse({'error': 'Unauthorized request'}, status=403)
    user = ""
    try:
        user = decodeJwt(auth)
        # user = get_user_in_db('Username', userName)
    except customException as e:
        return JsonResponse({"error": e.data}, status=e.code)
    if user is None:
        return JsonResponse({"error": "User does not exists"}, status=403)
    friendObject = []
    foeObject = []
    # Modification principale : utiliser append() au lieu de +=
    for friend in user.friendsList:
        DBFriend = get_user_in_db("Username", friend)
        friendObject.append({
            "username": DBFriend.Username,
            "lastTimeOnline": DBFriend.lastTimeOnline.isoformat(),
            # "id": DBFriend.id,
            "avatar":DBFriend.Avatar
        })

    for block in user.foeList:
        DBFoe = get_user_in_db("Username", block)
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
    challenge = cache.get('pendingChallenge', {})
    receivedChallenge = []
    if user.id in challenge:
        receivedChallenge = challenge[user.id]
    # print(f'liste des challenge en attente: {challenge}', file=sys.stderr)
    # print(f'challenge en attente de l user: {user.Username} son id: {user.id} et ses challenges en attentes sont: {receivedChallenge}', file=sys.stderr)
    challengerArray = []
    for i, challanger in enumerate(receivedChallenge):
        print(f'challenger: {challanger}', file=sys.stderr)
        loopUser = get_user_in_db('id', challanger[0])
        if loopUser is None:
            print('no user found', file=sys.stderr)
        else:
            if challanger[2] == False:
                print(f'challenger en attente de l user: {loopUser} ', file=sys.stderr)
                receivedChallenge[i] = (challanger[0], challanger[1], True)
                challengerArray.append(challanger[1])

    # print(f'reveived challange apres la boucle : {receivedChallenge}', file=sys.stderr)
    # print(f'challange apres la boucle : {challenge}', file=sys.stderr)
    cache.delete('pendingChallenge')
    cache.set('pendingChallenge', challenge, 7200)
    acceptedChallenge = cache.get('accecptedChallenge', {})
    if user.id in acceptedChallenge:
        accepted = acceptedChallenge[user.id]
        cache.delete('accecptedChallenge')
        del acceptedChallenge[user.id]
        cache.set('accecptedChallenge', challenge, 7200)

    accepted = cache.get(f'accecptedChallenge{user.Username}', "")#id plus tard
    # adv = get_user_in_db('id', accepted)
    print(f'accepted = {accepted}',file=sys.stderr)
    cache.delete(f'accecptedChallenge{user.Username}')#id plus tard
    # accepted = adv.Username
#  cache.set(f'accecptedChallenge{data['username'].id}', user.id, 60)
    # challenge = cache.get('pendingChallenge', {})
    # received_challenge = []

    # if user.id in challenge:
    #     print('coucou', file=sys.stderr)
    #     received_challenge = challenge[user.id]

    # print(f'Liste des challenges en attente: {challenge}', file=sys.stderr)
    # print(f'Challenges en attente de l\'utilisateur {user.Username} (ID: {user.id}) et ses challenges en attentes sont: {received_challenge}', file=sys.stderr)
    # challenger_array = []

    # for challenger_id in received_challenge:
    #     user = get_user_in_db(challenger_id)
    #     if user is None:
    #         print(f'Aucun utilisateur trouvé pour l\'ID {challenger_id}', file=sys.stderr)
    #     else:
    #         print(f'Utilisateur en attente de {user.Username} (ID: {user.id})', file=sys.stderr)
    #     challenger_array.append(user.Username)
    # print(f'challenger array == {challengerArray}', file=sys.stderr)
    objectPing = {
        "username": user.Username,
        "avatar": user.Avatar,
        "language": user.language,
        'friendList': friendObject,
        'blockList': foeObject,
        'challengeReceived': {'game': 'pong', 'username': challengerArray},#empecher de se defier soi meme ca serait une bonne idee
        'challengeAccepted': {'game': 'pong', 'username': accepted}
    }

    print(f'object: {json.dumps(objectPing)}', file=sys.stderr)
    return JsonResponse(objectPing, status=200)

@csrf_exempt
def sendInvitation(request):
    # tjs valide sauf bidouille verifier l'user
    #ajouter dans le cache {pendingChallenge:{challanged: challenger}}
    auth = checkCookie(request, 'auth')
    if auth is None:
        print('coockie missing')
        return HttpResponse(status=403)
    dbUser = {}
    try:
        dbUser = decodeJwt(auth)#bdd
    except customException as e:
        return JsonResponse({"error": e.data}, status=e.code)
    if dbUser is None:
        return JsonResponse({"error": "User does not exist"}, status=401)
    usernameId = dbUser.id
    data = {}
    try:
        data = json.loads(request.body)
    except Exception as e:
        return JsonResponse({"error": "invalid Json"}, status=403)
    if 'toChallenge' not in data:
        return JsonResponse({"error": "invalid Json"}, status=403)
    challengedUser = get_user_in_db('Username', data['toChallenge'])
    if challengedUser is None:
        return JsonResponse({"error": "user does not exist"}, status=200)
    challenge = cache.get('pendingChallenge', {})
    if challengedUser.id not in challenge:
        challenge[challengedUser.id] = []
    challenge[challengedUser.id].append((usernameId, dbUser.Username, False))
    cache.set('pendingChallenge', challenge, 7200)
    print(f'ceci est la liste des challenges en cours!: {challenge}', file=sys.stderr)
    return JsonResponse({}, status=200)

    # if challenge and :
    #     challenge['username']
    # cache.set()

@csrf_exempt
def acceptInvitation(request):
    #fail si une partie est adctuellement en cours pour le joueur defie ou pour l'user qui accepte
    # get le joueur en bdd
    # je le cherche dans le cache a la ligne de l'user de cette requete si je trouve je compare les id si id pas correspondant ou que le joueur n'a pas ete initiallement identifie
    # refaire une requete bdd sur l'id pour avoir le joueur rellement a l'origine de la requete si joueur non identifiable retourner 403 une fois joueur identifie continuer
    #ajouter dans le cache {accecptedChallenge:{challanger: challenged}}
    
    # verifier si l'user est en train de jouer en appelant la route http://os.environ['DUMP']/pong/playerPLaying, POST? utiliser 2 code de retour pour true false 200/418
    auth = checkCookie(request, 'auth')
    if auth is None:
        print('coockie missing')
        return HttpResponse(status=403)
    user = {}
    try:
        user = decodeJwt(auth)
    except customException as e:
        return JsonResponse({"error": e.data}, status=e.code)
    if user is None:
        return JsonResponse({"error": "user does not exist"}, status=403)
    data = {}
    print(f'acceptInvitation: {request.body}', file=sys.stderr)
    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({"error": "invalid Json"}, status=403)
    # print(f'acceptInvitation: data == {data}', file=sys.stderr)
    # challanger = get_user_in_db(data['username'])
    # cache.get('pendingChallenge', {}) verifier info pas erronee et trouerl e bon joueur
    userIsPlaying = False
    challengerIsPlaying = False
    # print(f'envoi requete for PlayerPlaying ', file=sys.stderr)
    response = requests.post('http://pong:8004/PlayerPlaying/', {"username":user.Username})
    if response.status_code == 200:
        userIsPlaying = True
    response = requests.post('http://pong:8004/PlayerPlaying/', {"username":data['username']})
    if response.status_code == 200:
        challengerIsPlaying = True
    # print(f'acceptInvitation: response for PlayerPlaying == {response.status_code}', file=sys.stderr)
    # print(f'acceptInvitation: body for PlayerPlaying == {response.text}', file=sys.stderr)

    # verifier si deja une partie existe pour le challenger 
    
    if userIsPlaying is True or challengerIsPlaying is True:
        return JsonResponse({"error": "You or the challenger player is currently playing. Try again later."}, status=200)
    gameData = {'player1': user.Username, 'player2': data['username']}
    gameResponse = requests.post('http://pong:8004/initGame/', json=gameData)#inscrit la partie en bdd jeu
    print(f'acceptInvitation: response for PlayerPlaying == {gameResponse.status_code}', file=sys.stderr)
    print(f'acceptInvitation: body for PlayerPlaying == {gameResponse.text}', file=sys.stderr)
    

    # challenge[challengedUser.id] = usernameId
    cache.set(f'accecptedChallenge{data['username']}', user.Username, 60)#remplace par la data de bdd et mettre l'id du joueur


    # creer la partie en bdd
    # remove des partiePending + ajouter dans les parties acceptee cle challenger value chlange player user de cette requete
    return JsonResponse({}, status=200)

@csrf_exempt
def checkCodeLog(request):
    try:
        data = json.loads(request.body)
    except Exception:
        return HttpResponse(status=403)
    #recoit un demande d'activation 2fa on recupere l'usser via le JWT et on lui envoie un mail contannt le code + le stocker en cache cle code value user 10 minutes
    if 'code' in data:
        print(f"code == {data['code']}", file=sys.stderr)
        code = data['code']
        username = cache.get(code)
        cache.delete(code)
        user = get_user_in_db("Username", username)
        if user is None:
            return JsonResponse({"error":"user does not exist"}, status=401)
        expiration_time = (datetime.now() + timedelta(days=7)).timestamp()  # 300 secondes = 5 minutes penser a mettre ca dans l'env ca serait smart
        encoded_jwt = jwt.encode({"userName": user.Username, "expirationDate": expiration_time}, os.environ['SERVER_JWT_KEY'], algorithm="HS256")
        response = HttpResponse(json.dumps({"guestMode": "false", 'username': user.Username, 'avatar':user.Avatar, 'language':user.language}), content_type="application/json")
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

def checkCodeSet(request):
    #recupere le code dans le json
    #le get dans le cache la value est == a l'user
    #recuperer l'user en bdd et changer la value 2fa par mail
    return JsonResponse({"message": "2fa activation success"},status=200)

def set2FA(request):
    #type:email
    #retourn 200 si mail echec + champ error set
    #recoit un demande d'activation 2fa on recupere l'usser via le JWT et on lui envoie un mail contannt le code + le stocker en cache cle code value user 10 minutes
    return

# def generate_code(size=100):#a mettre dans les middleware
#     code = []
#     #banir i l 1 0 o maj+min
#     for _ in range(size):
#         value = random.randint(0, 61)
#         if value < 26:
#             code.append(chr(97 + value))
#         elif value < 52:
#             code.append(chr(65 + value - 26))
#         else:
#             code.append(chr(48 + value - 52))
#     return ''.join(code)


def get_alpha_maj(value:int)->str:
    print(f'originale value == {value}', file=sys.stderr)
    if chr(value) in "IJLO":
        value += 5
    print(f'generated letter == {chr(value)}', file=sys.stderr)
    return chr(value)

def get_alpha_min(value:int)->str:
    print(f'originale value == {value}', file=sys.stderr)
    if chr(value) in "ijlo":
        value += 5
    print(f'generated letter == {chr(value)}', file=sys.stderr)
    return chr(value)

def get_digit(value:int)->str:
    print(f'originale value == {value}', file=sys.stderr)
    if value == chr(0):
        value += 1
    print(f'generated letter == {chr(value)}', file=sys.stderr)
    return chr(value)

def generate_code(size:int=100)->str:
    code = []
    if size <= 0:
        size = 100
    for _ in range(size):
        value = random.randint(0, 61)
        if value < 10:
            code += get_digit(value + ord('0'))
        elif value < 35:
            code += get_alpha_min(value - 9 + ord('a'))
        else:
            code += get_alpha_maj(value - 35 + ord('A'))
    return ''.join(code)

@csrf_exempt
def checkCodeModifyPassword(request):
    code = request.GET.get('code')
    if code:
        print({"message": f"Code received: {code}"})
    if not code:
        return JsonResponse({"error": "No code provided"}, status=400)
    userName = cache.get(code)
    if userName is None:
        return JsonResponse({"error": "Invalid or expired code"}, status=400)
    cache.delete(code)
    try:
        user = User.objects.get(username=userName)
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return HttpResponseBadRequest({'error': 'Invalid JSON'}, status=403)
        if 'password' in data:
            user.Password = data['password']
            user.save()
            return JsonResponse({"message":"password successfully updated"}, status=200)
    except User.DoesNotExist:
        print('User does not exist')
        return JsonResponse({'error': 'User does not exist'}, status=404)

@csrf_exempt
@require_http_methods(["POST"])
def resetPasswd(request):
    print("jep asse par ici", file=sys.stderr)
    validationCode = generate_code()
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        print("je passe par erreur json", file=sys.stderr)
        return HttpResponseBadRequest({'error': 'Invalid JSON'}, status=403)
    email = ""
    if "email" not in data:
        print("je passe par erreur email", file=sys.stderr)
        return JsonResponse({'error': 'Invalid format'}, status=403)
    email = data['email']
    user = get_user_in_db('Email', email)
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
    auth = checkCookie(request, 'auth')
    if auth is None:
        return JsonResponse({'error': 'User not connected'}, status=403)
    print(f'le cookie est {auth}', file=sys.stderr)
    username = ""
    try:
        username = decodeJwt(auth)
    except customException as e:
        return JsonResponse({"error": e.data}, status=e.code)
    user = get_user_in_db("Username", username)
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
    gameResponse = requests.post('http://localhost:8001/Tetris/initGame/', json=gameData)#inscrit la partie en bdd jeu
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
def addFriend(request):
    #1 decodeJwt pour identifier la personne qui veut ajouter un ami et s'assurer que le JWT est toujours valide.
    #2 verifier qu'on ne s'ajoute pas soi meme
    #3 check si ami en db
    #4 check si ami a ajouter est dans la liste d'ennemis et l'en supprimer s'il y est.
    #4.5 check si ami pas deja dans liste d'amis.
    #5 Ajouter ami dans la liste d'amis.
    #6 renvoyer status == 200

    #1
    cookie = checkCookie(request, 'auth')
    if cookie is None:
        return JsonResponse({'error': 'User not logged'}, status=401)
    try:
      user = decodeJwt(cookie)
    except customException as e:
      return JsonResponse({'error': e.data}, status=e.status)

    #2
    try:
        data = json.loads(request.body)
    except Exception as e:
        return JsonResponse({'error': 'Invalid Json'}, status=403)
    if not 'newFriend' in data:
        return JsonResponse({'error': 'No newFriend in request body'}, status=403)
    newFriend = data['newFriend']
    if newFriend == user.Username:
        return JsonResponse({'error': 'NewFriend is user itself'}, status=403)

    #3
    newFriend = get_user_in_db('Username', data['newFriend'])
    if newFriend is None:
        return JsonResponse({'error': 'newFriend not found'}, status=404)
     
    #4
    user = get_user_in_db('Username', user)
    if user is None:
        return JsonResponse({'error': 'User does not exist'}, status=401)
    for x in user.foeList:
      if x == newFriend.Username:
          user.foeList.remove(newFriend.Username)

    #4.5
    for x in user.friendsList:
        if x == newFriend.Username:
            return JsonResponse({'message': 'Friend already in friends list'}, status=200)

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
    cookie = checkCookie(request, 'auth')
    if cookie is None:
        return JsonResponse({'error': 'User not logged'}, status=401)
    try:
      user = decodeJwt(cookie)
    except customException as e:
      return JsonResponse({'error': e.data}, status=e.status)

    #2
    try:
        data = json.loads(request.body)
    except Exception as e:
        return JsonResponse({'error': 'Invalid Json'}, status=403)
    if not 'toBlock' in data:
        return JsonResponse({'error': 'No toBlock in request body'}, status=403)
    toBlock = data['toBlock']
    if toBlock == user.Username:
        return JsonResponse({'error': 'Person to block is user itself'}, status=403)

    #3
    toBlock = get_user_in_db('Username', data['toBlock'])
    if toBlock is None:
        return JsonResponse({'error': 'Person to block not found'}, status=404)
     
    #4
    user = get_user_in_db('Username', user)
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
    cookie = checkCookie(request, 'auth')
    if cookie is None:
        return JsonResponse({'error': 'User not logged'}, status=401)
    try:
      user = decodeJwt(cookie)
    except customException as e:
      return JsonResponse({'error': e.data}, status=e.status)

    #2
    try:
        data = json.loads(request.body)
    except Exception as e:
        return JsonResponse({'error': 'Invalid Json'}, status=403)
    if not 'unfriend' in data:
        return JsonResponse({'error': 'No unfriend in request body'}, status=403)
    unfriend = data['unfriend']
    user = get_user_in_db('Username', user)
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
    cookie = checkCookie(request, 'auth')
    if cookie is None:
        return JsonResponse({'error': 'User not logged'}, status=401)
    try:
      user = decodeJwt(cookie)
    except customException as e:
      return JsonResponse({'error': e.data}, status=e.status)

    #2
    try:
        data = json.loads(request.body)
    except Exception as e:
        return JsonResponse({'error': 'Invalid Json'}, status=403)
    if not 'unblock' in data:
        return JsonResponse({'error': 'No unblock in request body'}, status=403)
    unblock = data['unblock']
    user = get_user_in_db('Username', user)
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
