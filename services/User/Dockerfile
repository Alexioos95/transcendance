FROM python:alpine3.19@sha256:17a0bb21c0b146f0de3b9b3c1e31b0b2394b16bc7c47ebdaf34aa15466b05eec

WORKDIR /app

COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY transcendance/ transcendance/

HEALTHCHECK     --interval=10s --timeout=1s --retries=3 --start-period=30s \
        CMD wget -q --tries=1 --spider --no-check-certificate http://localhost:8001/user/ping; if [ $? -eq 0 ]; then exit 0; else exit 1; fi

CMD cd transcendance && python manage.py flush --noinput && python manage.py makemigrations user && python manage.py migrate && daphne -b 0.0.0.0 -p 8001 transcendance.asgi:application
