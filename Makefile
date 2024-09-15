# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: fguarrac <fguarrac@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/08/29 19:19:01 by fguarrac          #+#    #+#              #
#    Updated: 2024/09/06 23:04:13 by fguarrac         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

NAME = transcendance

MAKE = make

$(NAME) : all

.PHONY: all
all : build
	$(MAKE) --no-print-directory up

.PHONY: build
build:
	docker compose -f services/compose.yml build

.PHONY: up
up: build
	docker compose -f services/compose.yml up -d

.PHONY: down
down:
	docker compose -f services/compose.yml down

.PHONY: log
log: build
	docker compose -f services/compose.yml up

.PHONY: re
re: mrproper
	$(MAKE) --no-print-directory up

.PHONY: re_log
re_log: mrproper
	$(MAKE) --no-print-directory log

.PHONY: mrproper
mrproper: down
	docker image rm -f $(NAME)-user
	docker image rm -f $(NAME)-chat
	docker image rm -f $(NAME)-mail
	docker image rm -f $(NAME)-ping
	docker image rm -f $(NAME)-pong
	docker image rm -f $(NAME)-webserver
	docker image rm -f redis@sha256:eaea8264f74a95ea9a0767c794da50788cbd9cf5223951674d491fa1b3f4f2d2
	docker image rm -f postgres@sha256:d898b0b78a2627cb4ee63464a14efc9d296884f1b28c841b0ab7d7c42f1fffdf
	docker image rm `docker images -f "dangling=true" -q` 2>/dev/null || true
	docker volume rm -f $(NAME)_static-data
	docker volume rm -f $(NAME)_image-data
	docker volume rm `docker volume ls -f "dangling=true" -q` 2>/dev/null || true
	docker builder prune -af
