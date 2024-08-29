# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: fguarrac <fguarrac@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/08/29 19:19:01 by fguarrac          #+#    #+#              #
#    Updated: 2024/08/29 19:23:48 by fguarrac         ###   ########.fr        #
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
	docker compose services/compose.yml build

.PHONY: up
up: build
	docker compose services/compose.yml up -d

.PHONY: down
down:
	docker compose services/compose.yml down

.PHONY: mrproper
mrproper: down
#	docker image rm -f inception-database
#	docker image rm -f inception-wordpress-fastcgi
#	docker image rm -f inception-webserver
#	docker volume rm -f inception_wordpress-data
#	docker volume rm -f inception_mariadb-data
	docker builder prune -af
#	rm -rf /home/fguarrac/data/wordpress
#	rm -rf /home/fguarrac/data/mariadb
