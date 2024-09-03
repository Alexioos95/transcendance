# Documentation de l'API

- **POST `/user/register/`**
	- **Parametre(s)**:
		- JSON contenant un champ `username`, `email` et `password`
	- **Comportement**:
		- Essaye de creer un utilisateur, et set son Cookie Auth JWT.
	- **Retour(s)**:
		- Succes:
			- Code 201 (Created)
			- JSON contenant les informations de l'user (`2fa: bool`, `username: username`, `avatar: path`, `language: alpha-2-code`, `friends:[]`, `blockedUser:[]`)
		- Echec:
			- Code erreur adapte
			- JSON contenant un champ `error`

- **POST `/user/login/`**
	- **Parametre(s)**:
		- JSON contenant un champ `username` et `password`
	- **Comportement**:
		- Verifie l'authenticite des informations, et set le Cookie Auth JWT
	- **Retour(s)**:
		- Succes:
			- JSON contenant les informations de l'user (`2fa: bool`, `username: username`, `avatar: path`, `language: alpha-2-code`, `friends:[]`, `blockedUser:[]`)
			Si le bool 2FA est a true, les autres donnees ne seront obtenu qu'une fois la route `/user/2fa/` valide
			- Code 200 (OK)
		- Echec:
			- JSON contenant un champ `error`
			- Code erreur adapte

- **GET `/user/checkJwt`**
	- **Parametre(s)**:
		- Aucun
	- **Comportement**:
		- Regarde si une session active est en court
	- **Retour(s)**:
		- Succes:
			- JSON contenant les informations de l'user (`2fa: bool`, `username: username`, `avatar: path`, `language: alpha-2-code`, `friends:[]`, `blockedUser:[]`)
			- Code 200 (OK)
		- Echec:
			- JSON contenant un champ `error`
			- Code erreur adapte

- **POST `/user/2fa/`**
	- **Parametre(s)**:
		- Code de validation obtenu via son moyen de double authentification
	- **Comportement**:
		- Verifie que le code de validation est correct
	- **Retour(s)**:
		- Succes:
			- JSON contenant les informations de l'user (`username: username`, `avatar: path`, `language: alpha-2-code`)
			- Code 200 (OK)
		- Echec:
			- JSON contenant un champ `error`
			- Code erreur adapte

- **POST `/user/set2FA`**
	- **Parametre(s)**:
		- JSON contenant un champ `email`
	- **Comportement**:
		- Envoie un mail contenant un code de validation, et attend en retour le code de validation
	- **Retour(s)**:
		- Succes:
			- Code 200 (OK)
		- Echec:
			- Code 403 (Forbidden)

- **GET `/user/disconnect`**
	- **Parametre(s)**:
		- JSON contenant un champ `email`
	- **Comportement**:
		- Supprime le Cookie Auth JWT
	- **Retour(s)**:
		- Succes:
			- Code 200 (OK)
		- Echec:
			- Aucun

- **POST `/user/updateUserInfos`**
	- **Parametre(s)**:
		- JSON contenant les informations a modifier
	- **Comportement**:
		- ?
	- **Retour(s)**:
		- Succes:
			- ?
		- Echec:
			- ?

- **POST `/user/resetPaswd`**
	- **Parametre(s)**:
		- JSON contenant un champ `email`
	- **Comportement**:
		- Envoie un email de reinitialisation de mot de passe
	- **Retour(s)**:
		- Succes:
			- ?
		- Echec:
			- ?

- **GET `/user/matchMaking`**
	- **Parametre(s)**:
		- ?
	- **Comportement**:
		-
	- **Retour(s)**:
		- Succes:
			- ?
		- Echec:
			- ?

- **GET `/user/updateInfo`**
	- **Parametre(s)**:
		- ?
	- **Comportement**:
		- Renvoie differentes donnees liees au compte de l'utilisateur (Invite de defi et le status de son acceptation, liste d'amis connecte ou non, et la liste d'utilisateurs bloques)
		`defi: gameName`, `friendList:[]`, `blockedList:[]`
	- **Retour(s)**:
		- Succes:
			- Code 200 (OK)
		- Echec:
			- Code 100 (Continue)
			- Code 403 (Forbidden)

- **POST `/user/addFriend`**
	- **Parametre(s)**:
		- ?
	- **Comportement**:
		- ?
	- **Retour(s)**:
		- Succes:
			- ?
		- Echec:
			- ?

- **POST `/user/blockUser`**
	- **Parametre(s)**:
		- ?
	- **Comportement**:
		- ?
	- **Retour(s)**:
		- Succes:
			- ?
		- Echec:
			- ?
