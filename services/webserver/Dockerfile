FROM nginx:1.27.0-alpine3.19-slim@sha256:66943ac4a1ca7f111097d3c656939dfe8ae2bc8314bb45d6d80419c5fb25e304
RUN apk update && apk add --upgrade libcrypto3 && apk add --upgrade libssl3 && apk cache clean
COPY default.conf /etc/nginx/conf.d/
