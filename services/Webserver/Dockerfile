FROM nginx:1.27.0-alpine3.19-slim@sha256:66943ac4a1ca7f111097d3c656939dfe8ae2bc8314bb45d6d80419c5fb25e304
RUN apk update && apk add --upgrade libcrypto3 && apk add --upgrade libssl3 && apk cache clean
RUN ["apk", "add", "--no-cache", "openssl"]
COPY default.conf /etc/nginx/conf.d/
COPY init.sh /docker-entrypoint.d/
WORKDIR /app
#run script using passed arg from env and remove file
#ARG DUMP
#RUN ./init.sh $DUMP
EXPOSE 80
EXPOSE 443
RUN ["openssl", "req", "-x509", "-newkey", "rsa:2048", "-noenc", "-subj", "/=/=/=", "-days", "3650", "-keyout", "/root/key.pem", "-out", "/root/crt.pem"]
HEALTHCHECK     --interval=10s --timeout=1s --retries=3 --start-period=30s \
        CMD wget -q --tries=1 --spider --no-check-certificate https://localhost:443/health; if [ $? -eq 0 ]; then exit 0; else exit 1; fi
