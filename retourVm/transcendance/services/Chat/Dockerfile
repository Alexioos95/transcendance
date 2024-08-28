FROM python:alpine3.19@sha256:17a0bb21c0b146f0de3b9b3c1e31b0b2394b16bc7c47ebdaf34aa15466b05eec

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD cd transcendance && daphne -b 0.0.0.0 -p 8000 transcendance.asgi:application
