# Documentation de l'API

## Connection

- **GET `/user/checkJwt/`**
	- **Parametre(s)**:
		- Aucun.
	- **Comportement**:
		- Regarde si une session active est en court.
	- **Retour(s)**:
		- Succes:
			- JSON contenant les informations de l'user.
			- Code 200 (OK).
		- Echec:
			- JSON contenant un champ `error`.
			- Code erreur adapte.

- **POST `/user/register/`**
  	- **Status**
  	  	- Publique.
	- **Parametre(s)**:
		- JSON contenant un champ `username`, `email` et `password`.
	- **Comportement**:
		- Creer un utilisateur, et set son Cookie Auth JWT.
	- **Retour(s)**:
		- Succes:
			- JSON contenant les informations de l'user.
			- Code 201 (Created).
		- Echec:
			- JSON contenant un champ `error`.
			- Code erreur adapte.

- **POST `/user/login/`**
  	- **Status**
  	  	- Publique.
	- **Parametre(s)**:
		- JSON contenant un champ `username` et `password`.
	- **Comportement**:
		- Verifie l'authenticite des informations, et set le Cookie Auth JWT.
	- **Retour(s)**:
		- Succes:
			- JSON contenant les informations de l'user. Si la 2FA est active, les autres donnees ne seront obtenu qu'une fois la route `/user/2fa/` valide.
			- Code 200 (OK).
		- Echec:
			- JSON contenant un champ `error`.
			- Code erreur adapte.

- **POST `/user/resetPaswd/`**
  	- **Status**
  	  	- Publique.
	- **Parametre(s)**:
		- JSON contenant un champ `email` et `password`.
	- **Comportement**:
		- Envoie un email de recuperation.
	- **Retour(s)**:
		- Succes:
			- Code 200 (OK).
		- Echec:
			- JSON contenant un champ `error`.
			- Code erreur adapte.

- **POST `/user/sendNewPaswd/`**
  	- **Status**
  	  	- Publique.
	- **Parametre(s)**:
		- JSON contenant les champs `password` et `code`.
	- **Comportement**:
		- Verifie le code, et met a jour le mot de passe dns la base de donnee.
	- **Retour(s)**:
		- Succes:
			- Code 200 (OK).
		- Echec:
			- JSON contenant un champ `error`.
			- Code erreur adapte.

- **POST `/user/checkAuth42/`**
  	- **Status**
  	  	- Publique.
	- **Parametre(s)**:
		- Aucun.
	- **Comportement**:
		- Verifie l'etat de la connection avec 42Intra.
	- **Retour(s)**:
		- Succes:
			- JSON contenant les informations de l'user.
			- Code 200 (OK).
		- Echec:
			- Code 204 (No Content).

- **GET `/user/disconnect/`**
  	- **Status**
  	  	- Publique.
	- **Parametre(s)**:
		- Aucun.
	- **Comportement**:
		- Supprime le Cookie Auth JWT.
	- **Retour(s)**:
		- Succes:
			- Code 200 (OK).
		- Echec:
			- Aucun.

## Connection - 2FA

- **POST `/user/set2fa/`**
  	- **Status**
  	  	- Publique.
	- **Parametre(s)**:
		- JSON contenant un champ `type`, qui contient le code de validation obtenu via le moyen de double authentification, et le mets en base de donnee.
	- **Comportement**:
		- Verifie que le code de validation est correct.
	- **Retour(s)**:
		- Succes:
			- Code 200 (OK).
		- Echec:
			- JSON contenant un champ `error`.
			- Code erreur adapte.

- **POST `/user/log2fa/`**
  	- **Status**
  	  	- Publique.
	- **Parametre(s)**:
		- JSON contenant un champ `type`, qui contient le code de validation obtenu via le moyen de double authentification.
	- **Comportement**:
		- Verifie que le code de validation est correct.
	- **Retour(s)**:
		- Succes:
			- JSON contenant les informations de l'user.
			- Code 200 (OK).
		- Echec:
			- JSON contenant un champ `error`.
			- Code erreur adapte.

- **POST `/user/init2fa/`**
  	- **Status**
  	  	- Publique.
	- **Parametre(s)**:
		- JSON contenant un champ `email`.
	- **Comportement**:
		- Envoie un mail contenant un code de validation, et attend en retour le code de validation.
	- **Retour(s)**:
		- Succes:
			- JSON contenant les informations de l'user.
			- Code 200 (OK).
		- Echec:
			- JSON contenant un champ `error`.
			- Code 200 (OK).

## Donnees utilisateurs

- **POST `/user/updateUserInfos/`**
  	- **Status**
  	  	- Publique.
	- **Parametre(s)**:
		- JSON contenant les champs `lang`, `username`, `email`, `passwordCurr`, `passwordNew`, `twoFA`.
	- **Comportement**:
		- Verifie l'integralite, et met a jour les informations en base de donnees.
	- **Retour(s)**:
		- Succes:
			- Code 200 (OK).
		- Echec:
			- JSON contenant un champ `error`.
			- Code erreur adapte.

- **GET `/user/sendFile/`**
  	- **Status**
  	  	- Publique.
	- **Parametre(s)**:
 		- Donnee brute d'une image `.jpg` ou `.png`.
	- **Comportement**:
 		- Met l'image en base de donnee.
	- **Retour(s)**:
		- Succes:
			- Code 200 (OK).
		- Echec:
			- JSON contenant un champ `error`.
			- Code erreur adapte.

- **POST `/user/addFriend/`**
  	- **Status**
  	  	- Publique.
	- **Parametre(s)**:
		- JSON contenant un champ `username`.
	- **Comportement**:
		- Ajoute l'utilisateur a la liste d'amis de la personne connecte.
	- **Retour(s)**:
		- Succes:
			- Code 200 (OK).
		- Echec:
			- JSON contenant un champ `error`.
			- Code erreur adapte.

- **POST `/user/deleteFriend/`**
  	- **Status**
  	  	- Publique.
	- **Parametre(s)**:
		- JSON contenant un champ `username`.
	- **Comportement**:
		- Retire l'utilisateur de la liste des amis de la personne connecte.
	- **Retour(s)**:
		- Succes:
			- Code 200 (OK).
		- Echec:
			- JSON contenant un champ `error`.
			- Code erreur adapte.

- **POST `/user/blockUser/`**
  	- **Status**
  	  	- Publique.
	- **Parametre(s)**:
		- JSON contenant un champ `username`.
	- **Comportement**:
		- Ajoute l'utilisateur a la liste des bloques de la personne connecte.
	- **Retour(s)**:
		- Succes:
			- Code 200 (OK).
		- Echec:
			- JSON contenant un champ `error`.
			- Code erreur adapte.

- **POST `/user/deleteBlockedUser/`**
  	- **Status**
  	  	- Publique.
	- **Parametre(s)**:
		- JSON contenant un champ `username`.
	- **Comportement**:
		- Retire l'utilisateur de la liste des bloques de la personne connecte.
	- **Retour(s)**:
		- Succes:
			- Code 200 (OK).
		- Echec:
			- JSON contenant un champ `error`.
			- Code erreur adapte.

- **GET `/user/updateInfo/`**
  	- **Status**
  	  	- Publique.
	- **Parametre(s)**:
		- Aucun.
	- **Comportement**:
 		- Renvoie des donnees sur l'utilisateur connecte.
	- **Retour(s)**:
		- Succes:
			- Code 200 (OK).
		- Echec:
			- JSON contenant un champ `error`.
			- Code erreur adapte.

## Jeux

- **GET `/user/matchMaking/`**
  	- **Status**
  	  	- Publique.
	- **Parametre(s)**:
		- Aucun.
	- **Comportement**:
		- Cherche un adversaire pour l'utilisateur connecte.
	- **Retour(s)**:
		- Succes:
			- Code 200 (OK).
		- Echec:
			- Code 100 (Continue).
			OU
			- Code erreur adapte.

- **GET `/user/sendInvitation/`**
  	- **Status**
  	  	- Publique.
	- **Parametre(s)**:
		- JSON contenant un champ `toChallenge`.
	- **Comportement**:
 		- Envoie une invitation de jeu Pong.
	- **Retour(s)**:
		- Succes:
			- Code 200 (OK).
		- Echec:
			- JSON contenant un champ `error`.
			- Code erreur adapte.

- **POST `/user/acceptInvitation/`**
  	- **Status**
  	  	- Publique.
	- **Parametre(s)**:
		- JSON contenant un champ `username`, ayant l'username de l'utilisateur qui a envoye l'invitation.
	- **Comportement**:
 		- Creer un salon dans le serveur pour une partie de Pong.
	- **Retour(s)**:
		- Succes:
			- Code 200 (OK).
		- Echec:
			- JSON contenant un champ `error`.
			- Code erreur adapte.

- **WEBSOCKET `ws/pong/`**
  	- **Status**
  	  	- Publique.
	- **Parametre(s)**:
		- Aucun.
	- **Comportement**:
 		- Connecte au serveur.
	- **Retour(s)**:
		- Succes:
			- Aucun.
		- Echec:
			- Aucun.

- **POST `initGame/`**
  	- **Status**
  	  	- Privee.
	- **Parametre(s)**:
		- Aucun.
	- **Comportement**:
 		- Creer une partie de Pong cote server.
	- **Retour(s)**:
		- Succes:
			- Aucun.
		- Echec:
			- Aucun.

- **POST `getPlayerGames/`**
  	- **Status**
  	  	- Privee.
	- **Parametre(s)**:
		- Aucun.
	- **Comportement**:
 		- Recupere l'historique de partie de l'utilisateur.
	- **Retour(s)**:
		- Succes:
			- Aucun.
		- Echec:
			- Aucun.

- **POST `PlayerPlaying/`**
  	- **Status**
  	  	- Privee.
	- **Parametre(s)**:
		- Aucun.
	- **Comportement**:
 		- Verifie si l'utilisateur est deja dans une partie.
	- **Retour(s)**:
		- Succes:
			- Aucun.
		- Echec:
			- Aucun.

## Chat

- **WEBSOCKET `ws/chat/`**
  	- **Status**
  	  	- Publique.
	- **Parametre(s)**:
		- Aucun.
	- **Comportement**:
 		- Connecte au chat.
	- **Retour(s)**:
		- Succes:
			- Aucun.
		- Echec:
			- Aucun.

## Mail

- **POST `sendMail/`**
  	- **Status**
  	  	- Privee.
	- **Parametre(s)**:
		- Aucun.
	- **Comportement**:
 		- Envoie un email.
	- **Retour(s)**:
		- Succes:
			- Aucun.
		- Echec:
			- Aucun.

## Ping

- **GET `ping/testRoutes/`**
  	- **Status**
  	  	- Publique.
	- **Parametre(s)**:
		- Aucun.
	- **Comportement**:
 		- Retourne un JSON contenant le status de chaque service.
	- **Retour(s)**:
		- Succes:
			- Aucun.
		- Echec:
			- Aucun.

- **GET `ping/`**
  	- **Status**
  	  	- Prive.
	- **Parametre(s)**:
		- Aucun.
	- **Comportement**:
 		- Verifie l'etat du service ayant appelee la route.
	- **Retour(s)**:
		- Succes:
			- Aucun.
		- Echec:
			- Aucun.
