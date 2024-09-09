from django.shortcuts import render
from django.core.mail import send_mail
from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import os
import sys

@csrf_exempt
def sendMail(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method Not Allowed'}, status=405)

    try:
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
            fail_silently=False,#True?
        )

        return JsonResponse({'success': 'Email sent successfully'}, status=200)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format'}, status=400)
    except Exception as e:
        print(f'mail send coucou error: {e}', file=sys.stderr)
        return JsonResponse({'error': 'An unexpected error occurred'}, status=500)

def ping(request):
    return HttpResponse(status=204)
