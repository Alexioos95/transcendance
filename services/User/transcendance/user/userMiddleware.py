import jwt
import time
from datetime import datetime, timedelta
import os
import bcrypt
from user.models import User
import json
import random
import re
import requests

class customException(Exception):
    def __init__(self, data, code):
        self.data = data
        self.code = code

def setCookie(user, response):
    expirationTime = 1209600
    encoded_jwt = jwt.encode({
        "userName": user.Username,
        "id": user.id,
        "avatar": user.Avatar
        "expirationDate": time.time() + expirationTime
    }, os.environ.get('SERVER_JWT_KEY'), algorithm="HS256")
    response.set_cookie(
        'auth',
        encoded_jwt,
        httponly=True,
        secure=True,
        samesite='None',
        expires=datetime.utcnow() + timedelta(hours=25),    # Set same time as jwt
    )

def checkCookie(request, str):
    if str in request.COOKIES:
        return request.COOKIES[str]
    else:
        return None

def get_user_in_db(field_name: str, value: str):#a utliser pour check si un champ unique est deja utilise dans update info
    try:
        user = User.objects.get(**{field_name: value})
        #for attr_name, attr_value in vars(user).items():
        #    print(f"{attr_name}: {attr_value}", end=" ")
        return user
    except Exception:
        return None

def register_user_in_database(user_info:dict):
    try:
        user_info.save()
    except Exception:
        raise customException("User already exists", 409)

def generate_bcrypt_hash(password: str) -> bytes:
    # verif taille password
    # return none an cas d'erreur
    salt = bcrypt.gensalt()
    password_encoded = bcrypt.hashpw(password.encode('utf-8'), salt)
    return password_encoded

def compare_bcrypt_hash(username:str, password: str) -> bool:
    dbUser = get_user_in_db(Username, username)
    if dbUser == False: #Should be None ?
        return False
    if bcrypt.checkpw(password.encode('utf-8'), dbUserList[0].Password.encode('utf-8')):
        return True
    else:
        return False

def save_file(uploaded_file, mime_type):
    upload_dir = '/images'
    file_name = generate_code()
    file_path = os.path.join(upload_dir, file_name)
    extensionDict = {
            'image/jpeg': 'jpeg',
            'image/png': 'png',
            'image/svg+xml': 'svg',
            'image/webp': 'webp'
    }
    extension = extensionDict[mime_type]
    file_path = '.'.join((file_path, extension))
    with open(file_path, 'wb+') as destination:
        for chunk in uploaded_file.chunks():
            destination.write(chunk)
    return file_path

def image_validation(request):
    if 'file' in request.FILES:
        uploaded_file = request.FILES['file']
        mime_type = uploaded_file.content_type
        accepted_mime_types = [
            'image/jpeg',
            'image/png',
            'image/svg+xml',
            'image/webp'
        ]
        if mime_type in accepted_mime_types:
            return save_file(uploaded_file, mime_type)
        else:
            raise customException("Invalid image format", 200)

def decodeJwt(auth_coockie):
    decodedJwt = ""
    try:
        decoded_token = jwt.decode(auth_coockie, os.environ['SERVER_JWT_KEY'], algorithms=["HS256"])
        username = decoded_token.get('userName')
    except jwt.InvalidTokenError:
        raise customException("Forbidden", 403)
    if decoded_token.get("expirationDate") < time.time():
        raise customException("Token expired", 401)
    user = get_user_in_db("Username", username)
    if not user:
        raise customException("User does not exist", 403)
    return user

def is_valid_lang(value):
    valid_choices = ["FR", "EN", "NL"]
    return value in valid_choices

def get_alpha_maj(value:int)->str:
    if chr(value) in "IJLO":
        value += 5
    return chr(value)

def get_alpha_min(value:int)->str:
    if chr(value) in "ijlo":
        value += 5
    return chr(value)

def get_digit(value:int)->str:
    if value == chr(0):
        value += 1
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

def loadJson(reqBody):
    try:
        data = json.loads(reqBody)
    except Exception:
        return None
    return data

def checkCredentialsLen(userData):
    if len(userData['username']) > 30:
        raise customException('username too long', 200)
    if len(userData['email']) > 1000:
        raise customException('email too long', 200)
    if len(userData['password']) > 70:
        raise customException('password too long', 200)
    if len(userData['password']) < 8:
        raise customException('password too short', 200)

def checkEmailFormat(email):
    emailRegex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'
    if not re.fullmatch(emailRegex, email):
        raise customException('wrong email format', 200)

def send2FaMail(user, destEmail, code):
    mailData = {
    'title': 'Your 2FA code for Transcendance',
    'body': (
        f'Hey {user},\n\n'
        f'Looks like you\'re trying to log in. No worries, mate! We\'ve got you covered.\n\n'
        f'Here\'s your 2FA code:\n\n{code}\n\n'
        f'This code is good for 10 minutes, so make sure you use it pronto. If you miss it, just try again.'
        f'If someone else asked for this, don\'t sweat it - your account\'s still safe.\n\n'
        f'Cheers,\n\nThe Team\n'
        ),
    'destinataire': destEmail}
    response = requests.post('http://mail:8002/sendMail/', json=mailData)
    if response.status_code != 200:
        raise customException('Failed to send email', 200)
