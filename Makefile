# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: fguarrac <fguarrac@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/08/29 19:19:01 by fguarrac          #+#    #+#              #
#    Updated: 2024/09/06 20:43:05 by fguarrac         ###   ########.fr        #
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
#	mkdir -p /home/fguarrac/data/mariadb
#	mkdir -p /home/fguarrac/data/wordpress
	docker compose -f services/compose.yml build

.PHONY: up
up: build
	docker compose -f services/compose.yml up -d

.PHONY: down
down:
	docker compose -f services/compose.yml down

.PHONY: mrproper
mrproper: down
	docker image rm -f $(NAME)-user
	docker image rm -f $(NAME)-chat
	docker image rm -f $(NAME)-mail
#	docker image rm -f $(NAME)-ping
	docker image rm -f $(NAME)-webserver
	docker volume rm -f $(NAME)_static-data
	docker builder prune -af
#	rm -rf /home/fguarrac/data/wordpress
#	rm -rf /home/fguarrac/data/mariadb
