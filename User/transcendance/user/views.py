from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from user import userMiddleware as middleware
from datetime import date
from user.models import User
from django.http import JsonResponse
from django.core.cache import cache
import json
import datetime
import pytz
import os
import pyotp
import qrcode
import pyjwt

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

@csrf_exempt
def register(request):
    print('register')
    if request.method == 'POST':
        data = json.loads(request.body)
        nom = data['nom']
        password = data['password'] #hash moi ca avant de push
        response_data = {}
        # print(datetime.datetime())
        time = datetime.datetime.now()
        timebdd = datetime.datetime(time.year,time.month, time.day, time.hour, time.minute, time.second)
        tz = pytz.timezone('EST')
        tzTime = tz.localize(time)
        timebdd2 = tzTime.replace()
        print(timebdd)
        print(timebdd2)
        # print(datetime.datetime.now())
        # print(datetime.datetime.now().timestamp())
        # print(datetime.datetime.total_seconds())
        # print(datetime.datetime.strftime)
        new_user = User(Username = nom, Password = password, lastTimeOnline = timebdd2, pongLvl = 0, tetrisLvl = 0)
        new_user.save()
        all_entries = User.objects.all()
        print(all_entries.values_list())
        user = User.objects.all().filter(Username='madaguen')
        print(user.values_list())
        #check si dans bdd si oui return erreur sinon creer et return 201 et data user connecte set le coockie
        return JsonResponse(response_data, status=201)
    else:
        return JsonResponse({'error': 'Méthode non autorisée'}, status=405)
    return 

@csrf_exempt
def login(request):
    if request.method == 'POST':
        auth = checkCookie(request, 'auth')	#jwt?
        if auth == null:
            return JsonResponse({'error': 'not connected'}, status=204)

		# Check if JWT present
		#  Check JWT validity
		#  Check JWT expiracy date

		decodedJwt = ""

		try:
			decodedJwt = jwt.decode(auth, os.environ['SERVER_JWT_KEY'], algorithm="HS256")

		except Exception as error
			print(error)
			return JsonResponse({'error': 'Forbidden'}, status=403)

		decodedJwt = json.loads(decodedJwt)
		if decodedJwt["expirationDate"] < time.time():
			return JsonResponse({'error': 'Token expired'}, status=401)

		# check si user existe toujours en db
        user = User.objects.all().filter(Username=decodedJwt["userName"]).value_list()


        #si 2fa si mail genere code stoker en cache et envoyer le mail via route mail
        #recuperer info user en bdd et construirel la response et set le cookie
        # data = json.loads(request.body)
        # nom = data['nom']
        # password = data['password']

		#generate user jwt encode/decode secret and save it in db
		encoded_jwt = jwt.encode({"userName": "", "expirationDate": time.time() + 300}, os.environ['SERVER_JWT_KEY'], algorithm="HS256")	#	Export to .env file		#	Add env_example file
        response_data #= {nom: password}
        # userIp = request.META.get('REMOTE_ADDR')
        # print(f"voici l'ip user{userIp}")
        return JsonResponse(response_data, status=200)
    else:
        return JsonResponse({'error': 'Méthode non autorisée'}, status=405)

def auth42(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    authorization_code = request.GET.get('code')
    data = {
        'grant_type': 'authorization_code',
        'client_id': 'u-s4t2ud-f59fbc2018cb22b75560aad5357e1680cd56b1da8404e0155abc804bc0d6c4b9',
        'client_secret': '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',
        'code': authorization_code,
        'redirect_uri': 'http://paul-f4Ar5s3:8000/auth42'
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
        return JsonResponse(user_response.json(), status=user_response.status_code)
        # //response = HttpResponse("Cookie Set")
        # //response.set_cookie('java-tutorial', 'javatpoint.com')
        # response.set_cookie('coucou', 'coucou')
        # return render(request , 'html/index.html')
    else:
        return JsonResponse({'error': 'Failed to fetch user data'}, status=user_response.status_code)

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
            response.set_cookie(#ajouter le token
            'oauth42',
            'test',
            httponly=True,   # Empêche l'accès JavaScript au cookie
            # secure=True,     # Assure que le cookie est envoyé uniquement sur HTTPS
            samesite='Strict',
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
		#	send OK to front!
    else:
        print("NOT OK :(")
		#	send KO to front!

    return

def set2FA(request):
    #requete gen cle chaque 00.01s 30.01s
    #set 2fa a true en bdd code deja stocke si c'est mail si apk check le code en cache

	if 2FA == key:
		key = cache.get('"USERNAME" + 2FA') # Get from JWT
	    totp = pyotp.TOTP(key)
		#print(f'Code: {totp.now()}')
	
	    #ask generated key in front!
		userInput = input("Enter generated code (6 digits): ")	# Get from request ?
	
	    # check user input ?!
	
	    if (totp.verify(userInput)):
	    #if true, save key to db + remove from cache
			keyToDb = User.objects.get(Username = 'USERNAME')
			keyToDb.twoFA = APK
			keyToDb.key2FA = key
			keyToDb.save()
	        print("Code OK")
			#	send OK to front!
	    else:
	        print("NOT OK :(")
			#	start over in front!
	
		#	delete image !
		if os.path.exists('PATH TO QRCODE.png'):
			os.remove('PATH TO QRCODE.png')
		cache.clear('"USERNAME" + 2FA')
	else:
		pass #for now
    return

def preSet2FA(request):
    # sert a teser la 2fa et enregistrer la cle user puis on effectue une 2fa

	key = pyotp.random_base32()
	#	save key in cache
	cache.set('"USERNAME" + 2FA', key, 30)	# Get Username or ID from JWT

    otpUri = pyotp.totp.TOTP(key).provisioning_uri(name= "GET USERNAME OR ID FROM JWT", issuer_name="Transcendance")
    qrcode.make(otpUri).save("FIND USEFULL NAME.png")
    return

def resetPasswd(request):
    return
