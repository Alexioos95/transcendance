# Documentation de l'API

## Gestion de compte

- **POST `/user/register/`**
	- **Parametre(s)**:
		- JSON contenant un champ `username`, `email` et `password`.
	- **Comportement**:
		- Creer un utilisateur, et set son Cookie Auth JWT.
	- **Retour(s)**:
		- Succes:
			- JSON contenant les informations de l'user (`2fa: bool`, `username: username`, `avatar: path`, `language: alpha-2-code`, `friends:[]`, `blockedUser:[]`).
			- Code 201 (Created).
		- Echec:
			- JSON contenant un champ `error`.
			- Code erreur adapte.


- **GET `/user/checkJwt/`**
	- **Parametre(s)**:
		- Aucun.
	- **Comportement**:
		- Regarde si une session active est en court.
	- **Retour(s)**:
		- Succes:
			- JSON contenant les informations de l'user (`2fa: bool`, `username: username`, `avatar: path`, `language: alpha-2-code`, `friends:[]`, `blockedUser:[]`).
			- Code 200 (OK).
		- Echec:
			- JSON contenant un champ `error`.
			- Code erreur adapte.


- **POST `/user/login/`**
	- **Parametre(s)**:
		- JSON contenant un champ `username` et `password`.
	- **Comportement**:
		- Verifie l'authenticite des informations, et set le Cookie Auth JWT.
	- **Retour(s)**:
		- Succes:
			- JSON contenant les informations de l'user (`2fa: bool`, `username: username`, `avatar: path`, `language: alpha-2-code`, `friends:[]`, `blockedUser:[]`).
			Si le bool 2FA est a true, les autres donnees ne seront obtenu qu'une fois la route `/user/2fa/` valide.
			- Code 200 (OK).
		- Echec:
			- JSON contenant un champ `error`.
			- Code erreur adapte.


- **POST `/user/set2FA/`**
	- **Parametre(s)**:
		- JSON contenant un champ `email`.
	- **Comportement**:
		- Envoie un mail contenant un code de validation, et attend en retour le code de validation.
	- **Retour(s)**:
		- Succes:
			- Code 200 (OK).
		- Echec:
			- Code 403 (Forbidden).


- **POST `/user/2fa/`**
	- **Parametre(s)**:
		- Code de validation obtenu via le moyen de double authentification.
	- **Comportement**:
		- Verifie que le code de validation est correct.
	- **Retour(s)**:
		- Succes:
			- JSON contenant les informations de l'user (`username: username`, `avatar: path`, `language: alpha-2-code`).
			- Code 200 (OK).
		- Echec:
			- JSON contenant un champ `error`.
			- Code erreur adapte.


- **POST `/user/resetPaswd/`**
	- **Parametre(s)**:
		- JSON contenant un champ `email`.
	- **Comportement**:
		- Envoie un email de reinitialisation de mot de passe.
	- **Retour(s)**:
		- Succes:
			- ?
		- Echec:
			- ?


- **GET `/user/disconnect/`**
	- **Parametre(s)**:
		- JSON contenant un champ `email`.
	- **Comportement**:
		- Supprime le Cookie Auth JWT.
	- **Retour(s)**:
		- Succes:
			- Code 200 (OK).
		- Echec:
			- Aucun.

## Ping regulierement

- **GET `/user/updateInfo/`**
	- **Parametre(s)**:
		- ?
	- **Comportement**:
		- Renvoie differentes donnees liees au compte de l'utilisateur.
	- **Retour(s)**:
		- Succes:
			- JSON contenant les champs `defi`, `friendList` et `blockedList`.
			- Code 200 (OK).
		- Echec:
			- Code 100 (Continue).
			- OU
			- Code 403 (Forbidden).


- **GET `/user/matchMaking/`**
	- **Parametre(s)**:
		- ?
	- **Comportement**:
		- ?
	- **Retour(s)**:
		- Succes:
			- ?
		- Echec:
			- ?

## TBD

- **POST `/user/addFriend/`**
	- **Parametre(s)**:
		- ?
	- **Comportement**:
		- ?
	- **Retour(s)**:
		- Succes:
			- ?
		- Echec:
			- ?


- **POST `/user/blockUser/`**
	- **Parametre(s)**:
		- ?
	- **Comportement**:
		- ?
	- **Retour(s)**:
		- Succes:
			- ?
		- Echec:
			- ?
