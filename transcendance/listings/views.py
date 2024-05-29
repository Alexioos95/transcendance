
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from django.shortcuts import redirect
from django.http import HttpResponse


# Create your views here.

# def index(request):
#     return render(request, 'html/index.html')

def index(request):
    # print(request)
    # print(request.headers)
    if request.method == 'POST':
        # Récupérer les données du formulaire
        form_data = request.POST
        # Imprimer les données dans le terminal
        print('data =', form_data)
        myDict = {}
    # for key in form_data.keys():
    #     myDict[key] = form_data.getlist(key)
    # for key, value in form_data.items():
    #     print(f"Key: {key}, Value: {value}")
    return render(request , 'html/index.html')

@csrf_exempt
def get_access_token(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Invalid request method'}, status=400)
    authorization_code = request.GET.get('code')
    data = {
        'grant_type': 'authorization_code',
        'client_id': 'u-s4t2ud-f59fbc2018cb22b75560aad5357e1680cd56b1da8404e0155abc804bc0d6c4b9',
        'client_secret': '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',
        'code': authorization_code,
        'redirect_uri': 'http://bess-f1r1s10:8000/get-token'
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
        first_name = user_data.get('first_name', '')
        last_name = user_data.get('last_name', '')
        html_response = f'<html><body><h1>Bonjour {first_name} {last_name}</h1></body></html>'
        return JsonResponse(user_response.json(), status=user_response.status_code)
        #return HttpResponse(html_response)
    else:
        return JsonResponse({'error': 'Failed to fetch user data'}, status=user_response.status_code)
