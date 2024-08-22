from django.shortcuts import render
from django.core.mail import send_mail
from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import os

@csrf_exempt
def sendMail(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method Not Allowed'}, status=405)

    try:
        print(os.environ.get('EMAIL_HOST'))
        print(os.environ.get('EMAIL_PORT'))
        print(os.environ.get('EMAIL_HOST_USER'))
        print(os.environ.get('EMAIL_HOST_PASSWORD'))

        data = json.loads(request.body)
        destinataire = data.get('destinataire')
        title = data.get('title')
        body = data.get('body')

        if not all([destinataire, title, body]):
            return JsonResponse({'error': 'Missing required fields'}, status=400)

        send_mail(
            title,
            body,
            'ftTranscendanceAMFEA@gmail.com',  # Replace with your sender email address
            [destinataire],
            fail_silently=False,
        )

        return JsonResponse({'success': 'Email sent successfully'}, status=200)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format'}, status=400)
    except KeyError as e:
        return JsonResponse({'error': f'Missing key: {str(e)}'}, status=400)
    except Exception as e:
        print(f'Error: {e}')
        return JsonResponse({'error': 'An unexpected error occurred'}, status=500)
