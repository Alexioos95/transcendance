from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from user import userMiddleware as middleware
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

# mailData = {'title':'transcendance registration','body':f'welcome {username}, successfully registered', 'destinataire':'ftTranscendanceAMFEA@gmail.com'}
# response = requests.post('http://localhost:8001/sendMail/', json=mailData)#mettre la route dans l'env ou set la route definitive dans le build final?
# print(response.status_code)

class customException(Exception):
    def __init__(self, data, code):
        self.data = data
        self.code = code

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
        user = User.objects.get(**{field_name: value})
        return user
    except Exception:  #Not defined
        return None

def register_user_in_database(user_info:dict):
    try:
        user_info.save()
    except Exception:
        raise customException("User already exists", 409)

def generate_bcrypt_hash(password: str) -> str:#middleware
    salt = bcrypt.gensalt()
    passwordEncoded = bcrypt.hashpw(password.encode('utf-8'), salt)
    return password

def compare_bcrypt_hash(username:str, password: str) -> bool:#middleware
    dbUser = get_user_in_db(Username, username)
    if dbUser == False:
        return False
    if bcrypt.checkpw(password.encode('utf-8'), dbUserList[0].Password.encode('utf-8')):
        return True
    else:
        return False


@csrf_exempt
@require_http_methods(["POST"])
def register(request):#check si user est unique sinon refuser try except get?	#Set Language par default ou la récupérer du front ?
    
    # print(f"ici body == {request.body}")
    print(f"ici body == {request.body}", file=sys.stderr)
    data = json.loads(request.body)
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
        return JsonResponse({'message': 'Missing or empty fields','missing_fields': missing_fields}, status=401)
    time = datetime.now()
    tz = pytz.timezone('CET')
    tzTime = tz.localize(time)
    new_user = User(
        Email=userData['email'],
        Username=userData['username'],
        Password=generate_bcrypt_hash(userData['password']),
        lastTimeOnline=tzTime,
        pongLvl=0,
        Language=userData['lang'],	##
        tetrisLvl=0,
        twoFA=True	##	False par default ?
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
        print('ca a echouer a ecrie en bdd')
        response_data = JsonResponse({"error": "erreur in database"}, status=409)
        print(error)
        return(response_data)


    # mailData = {
    #     'title': 'Transcendance Reset Password',
    #     'body': (
    #         f'Hey,\n\n'
    #         'It looks like you requested to reset your password. No worries, we’ve got you covered!\n\n'
    #         'Click the link below to set a new password:\n\n'
    #         f'https://localhost:8000/resetmypassword/?code=validationCode\n\n'
    #         'This link will be good for 10 minutes, so make sure to use it before it expires. If you missed it, just request another one.\n\n'
    #         'If you didn’t ask for a password reset, just ignore this email – your account is safe.\n\n'
    #         'Got any questions? Feel free to reach out to us!\n\n'
    #         'Cheers,\n'
    #         'The Team'
    #         ),
    #         'destinataire': userData['email']}
    # response = requests.post('http://mail:8002/sendMail/', json=mailData)
    # print({'error': 'Failed to send email'}, file=sys.stderr)
    # user = User.objects.filter(Username__exact='h').first()
    # if user:
    #     print(f'user={user}')
    #     print(f'user.password={user.Password}')
    #     if bcrypt.checkpw(prevpassword, user.Password.encode('utf-8')):
    #         print("Le mot de passe est valide.")
    #     else:
    #         print("Le mot de passe est invalide.")
    # Réponse JSON
	#response_data.status = 201
    print(f'new user username {new_user.Username}, avatar = {new_user.Avatar}, langage = {new_user.Language}')
    response_data = JsonResponse({"2fa": 'False', "username":new_user.Username, "Avatar":new_user.Avatar, "Language": new_user.Language}, status=201)
    expiration_time = (datetime.now() + timedelta(days=7)).timestamp()  # 300 secondes = 5 minutes
    encoded_jwt = jwt.encode({"userName": userData['username'], "expirationDate": expiration_time}, os.environ['SERVER_JWT_KEY'], algorithm="HS256")    #    Export to .env file        #    Add env_example file
    response_data.set_cookie(
        'auth',
        encoded_jwt,
        httponly=True,
        secure=True,
        samesite='None',
        expires=datetime.utcnow() + timedelta(hours=25),	# Expire avant le JWT...
        # domain="*"
    )
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
    print('test')
	#if request.method != 'GET':
		#return JsonResponse({'error': 'Méthode non autorisée'}, status=405)
    auth = checkCookie(request, 'auth')
    if auth is None:
        return JsonResponse({"error": "user not log"}, status=401)
    print(f'le cookie est {auth}', file=sys.stderr)
    try:
        username = decodeJwt(auth)
        user = get_user_in_db('Username', username)
        if not user:
            return JsonResponse({"error": "user does nor exist"}, status=403)
        print(f'le cookie est {auth}', file=sys.stderr)
        print(f'username:{user.Username}, Avatar:{user.Avatar}, Language: {user.Language}', file=sys.stderr)
        return JsonResponse({"username":user.Username, "Avatar":user.Avatar, "Language": user.Language}, status=200)
    except customException as e:
        return JsonResponse({"error": e.data}, status=e.code)

@csrf_exempt
@require_http_methods(["POST"])
def login(request):
    data = json.loads(request.body)
    userData = {}
    if 'email' in data:
        userData['email'] = data['email']
    #if 'username' in data:
       # userData['username'] = data['username']
    if 'password' in data:
        userData['password'] = data['password']

#    requestUserName = data['username']
 #   password = data['password']
    # hash for comparison with db
    # Guard against injection/xss here?
    # Check if empty name or password?
    # Check for minimum lengths?
    dbUser = get_user_in_db("email", userData['email'])
    if dbUser is None:
        print('on passe par ici')
        return HttpResponse({"error":"invalid credentials"}, status=401)
    
#        for user in dbUserList:
#            print(f'dbUser == {dbUserList} Username {user.Username} password == {user.Password}')
#            print(f'Language: {user.get_Language_display()}')
#            print(f'TwoFA: {user.get_twoFA_display()}')
        # mydata = User.objects.all().values()
        # print(mydata)
        # print(list(mydata))
        # print(f'username == {requestUserName}')
        # dbUser = User.objects.filter(Username__exact=requestUserName)
        # dbUserList = list(dbUser)
        # print(f'dbUser == {dbUserList} Username {dbUserList[0].Username} password == {dbUserList[0].Password}')
        # print(f'dbUser == {dbUserList} Username {dbUserList[0].Username} password == {dbUserList[0].Password}')
    if bcrypt.checkpw(userData.password.encode('utf-8'), dbUser.Password.encode('utf-8')):
        print("Le mot de passe est valide.")
        encoded_jwt = jwt.encode({"userName": requestUserName, "expirationDate": time.time() + 300}, os.environ.get('SERVER_JWT_KEY'), algorithm="HS256")    #    Export to .env file        #    Add env_example file
        if dbUser.twoFA != 'NONE':
            return JsonResponse({"2fa": 'True'}, status=200)#code a verifier code 2fa attendu
        response_data = JsonResponse({"2fa": 'False', "username":dbUser.Username, "Avatar":dbUser.Avatar, "Language": dbUser.Language})
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
    upload_dir = '/leSuperVolumeCommunAvecNginx'
    file_name = generate_code()
    file_path = os.path.join(upload_dir, file_name)
    with open(file_path, 'wb+') as destination:
        for chunk in uploaded_file.chunks():
            destination.write(chunk)
    return file_path


def image_validation():
    if request.method == 'POST' and 'image' in request.FILES:
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
        raise customException("Invalid image format", 403)


@csrf_exempt
@require_http_methods(["POST"])
def updateUserInfos(request):
    print('cic')
    data = {}
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        print('json')
        return HttpResponseBadRequest({'error': 'Invalid JSON'}, status=403)
    auth = checkCookie(request, 'auth')
    if auth is None:
        print('coockie missing')
        return HttpResponse(status=403)
    user = ""
    try:
        userName = decodeJwt(auth)
        user = get_user_in_db(Username, userName)
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
    #         print(f'Language: {user.get_Language_display()}')
    #         print(f'TwoFA: {user.get_twoFA_display()}')
    # except Exception as e:
        # return JsonResponse({'error': 'user do not exist'}, status=403)
    if 'username' in data:
        if get_user_in_db(Username, data['username']) is not None:
            print('userneame')
            return JsonResponse({"errorUsername": "username already exists"}, status=403)
        user.Username = data['username']
    if 'email' in data:
        if get_user_in_db(Email, data['email']) is not None:
            print('enmail')
            return JsonResponse({"errorEmail": "email already exists"}, status=403)
        user.Email = data['email']
    if 'password' in data:
        user.Password = data['password']
    if 'avatar' in data:#on recoit une image je l'enregistre dans le volume et stock l'url
        user.Avatar = data['avatar']
    if 'language' in data:
        if data['language'] in dict(User.Language.choices):
            user.language = data['language']
    expiration_time = (datetime.now() + timedelta(days=7)).timestamp()  # 300 secondes = 5 minutes penser a mettre ca dans l'env ca serait smart
    user.save()
    encoded_jwt = jwt.encode({"userName": username, "expirationDate": expiration_time}, os.environ['SERVER_JWT_KEY'], algorithm="HS256")
    response_data.set_cookie(
    'auth',
    encoded_jwt,
    httponly=True,
    secure=True,
    samesite='Strict',
    expires=datetime.utcnow() + timedelta(hours=100))
    return (response_data)
    return JsonResponse({"message": "User information updated successfully"})

def disconnect(request):
    response = HttpResponse()
    response.set_cookie('auth', '', expires='Thu, 01 Jan 1970 00:00:00 GMT')
    return response

def updateInfo(request):
    auth = checkCookie(request, 'auth')
    user = ''
    if auth is None:
        return JsonResponse({'error': 'Unauthorized request'}, status=403)
    user = ""
    try:
        userName = decodeJwt(auth)
        user = get_user_in_db(Username, userName)
    except customException as e:
        return JsonResponse({"error": e.data}, status=e.code)
    if user is None:
        return JsonResponse({"error": "User does not exists"}, status=403)
    response = JsonResponse({"username":user.Username, "Avatar":user.Avatar, "Language": user.Language})#ajouter plus tard friends et bloques + get dans le cache les defis lances ou acceptes
    return response(status=200)

def checkCodeLog(request):
    #recupere le code dans le json
    #le get dans le cache la value est == a l'user
    #recuperer l'user en bdd et renvoyer les infos au front
    return JsonResponse()

def checkCodeSet(request):
    #recupere le code dans le json
    #le get dans le cache la value est == a l'user
    #recuperer l'user en bdd et changer la value 2fa par mail
    return JsonResponse({"message": "2fa activation success"},status=200)

def set2FA(request):
    #recoit un demande d'activation 2fa on recupere l'usser via le JWT et on lui envoie un mail contannt le code + le stocker en cache cle code value user 10 minutes
    return

def generate_code(size=100):#a mettre dans les middleware
    code = []
    for _ in range(size):
        value = random.randint(0, 61)
        if value < 26:
            code.append(chr(97 + value))
        elif value < 52:
            code.append(chr(65 + value - 26))
        else:
            code.append(chr(48 + value - 52))
    return ''.join(code)


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


@require_http_methods(["POST"])
def resetPasswd(request):
    validationCode = generate_code()
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return HttpResponseBadRequest({'error': 'Invalid JSON'}, status=403)
    email = ""
    if "email" not in data:
        return JsonResponse({'error': 'Invalid format'}, status=403)
    email = data['email']
    user = get_user_in_db(Email, email)
    if user is None:
        return JsonResponse({'error': 'User does not exist'}, status=403)
    cache.set(validationCode, user.Username,timeout=600)
    print('User does not exist')
    mailData = {
        'title': 'Transcendance Reset Password',
        'body': (
            f'Hey {user.username},\n\n'
            'It looks like you requested to reset your password. No worries, we’ve got you covered!\n\n'
            'Click the link below to set a new password:\n\n'
            f'https://localhost:8000/resetmypassword/?code={validationCode}\n\n'
            'This link will be good for 10 minutes, so make sure to use it before it expires. If you missed it, just request another one.\n\n'
            'If you didn’t ask for a password reset, just ignore this email – your account is safe.\n\n'
            'Got any questions? Feel free to reach out to us!\n\n'
            'Cheers,\n'
            'The Team'
            ),
            'destinataire': email}
    response = requests.post('http://mail:8002/sendMail/', json=mailData)
    if response.status_code != 200:
        print({'error': 'Failed to send email'}, file=sys.stderr)
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
    print(f'le cookie est {auth}')
    username = ""
    try:
        username = decodedJwt(auth)
    except customException as e:
        return JsonResponse({"error": e.data}, status=e.code)
    user = get_user_in_db("Username", username)
    if user is None:
        return JsonResponse({"error": "User does not exits"}, status=403)
    print(f'le username est {username}')
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
            print('ca matchamake pas la')
        print(f"Username: {userName}, Time: {data['time'].timestamp()}, difference Level: {data['difLevel']}")
    gameData = {'player1': "fguarrac", 'player2': "madaguen"}
    gameResponse = requests.post('http://localhost:8001/Tetris/initGame/', json=gameData)#inscrit la partie en bdd jeu
    print(gameResponse.status_code)
    matchmakingDict[username] = userMatchmaking
    cache.set('matchmaking', matchmakingDict, timeout=3600)#si pas trouve sinon inscrire en bdd game
    return HttpResponse(status=204)

@require_http_methods(["GET"])
def ping(request):
    return HttpResponse(status=204)
