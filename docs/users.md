## Données d'utilisateurs

Points d'accès en rapport avec les données d'utilisateurs.

---

### **POST /user/updateUserInfos**

Vérifie l'intégrité des données, et met à jour la base de données.

!!! info "Accès"
	Public

#### Requête

| Champ | Type | Description |
| :--- | :--- | :--- |
| `lang` | `string` | Langue utilisée (`FR`, `EN`, `NL`) |
| `username` | `string` | Nom d'utilisateur |
| `email` | `string` | Adresse mail |
| `passwordCurr` | `string` | Mot de passe actuel |
| `passwordNew` | `string` | Nouveau mot de passe choisit (optionnel) |
| `twoFA` | `boolean` | Authentification à deux facteurs (2FA) activée ? |

```http
POST /user/updateUserInfos HTTP/1.1
Host: example.com
Content-Type: application/json
Accept: */*
Cookie: auth=encoded_jwt

{
	"lang": "FR",
	"username": "example",
	"email": "example@example.com",
	"passwordCurr": "password123",
	"passwordNew": "password456",
	"twoFA": "off"
}
```
ou
```js
fetch("/user/updateUserInfos", {
	method: "POST",
	body: JSON.stringify({
		lang: form.lang.value,
		username: form.username.value,
		email: form.email.value,
		passwordCurr: form.passwordCurr.value,
		passwordNew: form.passwordNew.value,
		twoFA: form.2fa.value
	}),
	credentials: "include"
});
```

#### Réponse

##### Succès

Informations mises à jour.

```http
200 OK
```
```json
{
	"message": "User information updated successfully"
}
```

##### Erreur

```http
200 OK
401 Unauthorized
403 Forbidden
500 Internal Server Error
```
```json
{
	"error": "<cause>"
}
```

Causes possibles:

- JSON ou token JWT invalide
- Utilisateur inexistant
- Nom d'utilisateur ou email déjà utilisé
- Règles de mots de passes non respectés
- Mot de passe actuel invalide
- Impossibilité d'écrire dans la base de données

---

### **POST /user/sendFile**

Sauvegarde l'image d'avatar dans le serveur web et la base de données, et supprime l'ancienne.

!!! info "Accès"
	Public

#### Requête

| Champ | Type | Description |
| :--- | :--- | :--- |
| | `Raw bytes` | Données brut de l'image |

```http
POST /user/sendFile HTTP/1.1
Host: example.com
Cookie: auth=encoded_jwt
Content-Type: multipart/form-data; boundary=----FormBoundary123
Content-Length: 100

------FormBoundary123
Content-Disposition: form-data; name="file"; filename="avatar.png"
Content-Type: image/png

123456789
------FormBoundary123--
```
ou
```js
const formData = new FormData();
formData.append("file", form.upload.files[0]);
fetch("/user/sendFile", {
	method: "POST",
	body: formData,
	credentials: "include"
});
```

#### Réponse

##### Succès

L'image a été sauvegardée dans le serveur web et la base de données. L'ancienne a été supprimée

```http
200 OK
```

##### Erreur

```http
200 OK
403 Forbidden
500 Internal Server Error
```
```json
{
	"error": "<cause>"
}
```

Causes possibles:

- Token JWT invalide
- Utilisateur inexistant
- Format d'image non pris en charge
- Impossibilité d'écrire dans la base de données

---

### **POST /user/addFriend**

Ajoute l'utilisateur à la liste d'amis.

!!! info "Accès"
	Public

#### Requête

| Champ | Type | Description |
| :--- | :--- | :--- |
| `username` | `string` | Nom d'utilisateur de la personne à ajouter |

```http
POST /user/addFriend HTTP/1.1
Host: example.com
Content-Type: application/json
Accept: */*
Cookie: auth=encoded_jwt

{
	"username": "example",
}
```
ou
```js
fetch("/user/addFriend", {
	method: "POST",
	body: JSON.stringify({
		username: "example"
	}),
	credentials: "include"
});
```

#### Réponse

##### Succès

L'utilisateur a été ajouté à la liste d'amis.

```http
200 OK
```
```json
{
	"message": "OK"
}
```

##### Erreur

```http
200 OK
401 Unauthorized
403 Forbidden
404 Not Found
500 Internal Server Error
```
```json
{
	"error": "<cause>"
}
```

Causes possibles:

- JSON ou token JWT invalide
- Utilisateur non connecté ou inexistant
- Nom d'utilisateur déjà dans la liste d'amis, inexistant, ou identique à l'utilisateur
- Impossibilité d'écrire dans la base de données

---

### **POST /user/deleteFriend**

Supprime l'utilisateur de la liste d'amis.

!!! info "Accès"
	Public

#### Requête

| Champ | Type | Description |
| :--- | :--- | :--- |
| `username` | `string` | Nom d'utilisateur de la personne à supprimer |

```http
POST /user/deleteFriend HTTP/1.1
Host: example.com
Content-Type: application/json
Accept: */*
Cookie: auth=encoded_jwt

{
	"username": "example",
}
```
ou
```js
fetch("/user/deleteFriend", {
	method: "POST",
	body: JSON.stringify({
		username: "example"
	}),
	credentials: "include"
});
```

#### Réponse

##### Succès

L'utilisateur a été supprimé de la liste d'amis.

```http
200 OK
```
```json
{
	"message": "OK"
}
```

##### Erreur

```http
200 OK
401 Unauthorized
403 Forbidden
404 Not Found
500 Internal Server Error
```
```json
{
	"error": "<cause>"
}
```

Causes possibles:

- JSON ou token JWT invalide
- Utilisateur non connecté ou inexistant
- Nom d'utilisateur absent de la liste d'amis, inexistant, ou identique à l'utilisateur
- Impossibilité d'écrire dans la base de données

---

### **POST /user/blockUser**

Ajoute l'utilisateur à la liste des bloqués.

!!! info "Accès"
	Public

#### Requête

| Champ | Type | Description |
| :--- | :--- | :--- |
| `username` | `string` | Nom d'utilisateur de la personne à ajouter |

```http
POST /user/blockUser HTTP/1.1
Host: example.com
Content-Type: application/json
Accept: */*
Cookie: auth=encoded_jwt

{
	"username": "example",
}
```
ou
```js
fetch("/user/blockUser", {
	method: "POST",
	body: JSON.stringify({
		username: "example"
	}),
	credentials: "include"
});
```

#### Réponse

##### Succès

L'utilisateur a été ajouté à la liste des bloqués.

```http
200 OK
```
```json
{
	"message": "OK"
}
```

##### Erreur

```http
200 OK
401 Unauthorized
403 Forbidden
404 Not Found
500 Internal Server Error
```
```json
{
	"error": "<cause>"
}
```

Causes possibles:

- JSON ou token JWT invalide
- Utilisateur non connecté ou inexistant
- Nom d'utilisateur déjà dans la liste des bloqués, inexistant, ou identique à l'utilisateur
- Impossibilité d'écrire dans la base de données

---

### **POST /user/deleteBlockedUser**

Supprime l'utilisateur de la liste d'amis.

!!! info "Accès"
	Public

#### Requête

| Champ | Type | Description |
| :--- | :--- | :--- |
| `username` | `string` | Nom d'utilisateur de la personne à supprimer |

```http
POST /user/deleteBlockedUser HTTP/1.1
Host: example.com
Content-Type: application/json
Accept: */*
Cookie: auth=encoded_jwt

{
	"username": "example",
}
```
ou
```js
fetch("/user/deleteBlockedUser", {
	method: "POST",
	body: JSON.stringify({
		username: "example"
	}),
	credentials: "include"
});
```

#### Réponse

##### Succès

L'utilisateur a été supprimé de la liste des bloqués.

```http
200 OK
```
```json
{
	"message": "OK"
}
```

##### Erreur

```http
200 OK
401 Unauthorized
403 Forbidden
404 Not Found
500 Internal Server Error
```
```json
{
	"error": "<cause>"
}
```

Causes possibles:

- JSON ou token JWT invalide
- Utilisateur non connecté ou inexistant
- Nom d'utilisateur absent de la liste des bloqués, inexistant, ou identique à l'utilisateur
- Impossibilité d'écrire dans la base de données

---

### **GET /user/updateInfo**

Récupère les données de l'utilisateur.

!!! info "Accès"
	Public

#### Requête

```http
GET /user/updateInfo HTTP/1.1
```
ou
```js
const myInterval = setInterval(() => {
	fetch("/user/updateInfo/", {credentials: "include"});
}, 1000);
```

#### Réponse

##### Succès

Renvoie les données de l'utilisateur connecté.

```http
200 OK
```
```json
{
	"username": "example",
	"avatar": "/images/path/to.png",
	"language": "FR",
	"friendList": [
		{
			"username": "example1",
			"lastTimeOnline": "2026-07-23T14:35:42",
			"avatar": "/images/path/to.png",
			"online": "online"
		}
	],
	"blockList": [
		{
			"username": "example2",
			"avatar": "/images/path/to.png"
		}
	],
	"challengeReceived": {
		"game": "pong",
		"username": [
			"example3",
			"example4"
		]
	},
	"challengeAccepted": {
		"game": "pong",
		"username": [
			"example5",
			"example6"
		]
	}
}
```

| Champ | Type | Description |
| :--- | :--- | :--- |
| `username` | `string` | Nom d'utilisateur |
| `avatar` | `string` | Chemin vers l'image |
| `language` | `string` | Langue utilisée (`FR`, `EN`, `NL`) |
| `friendList` | `array d'objet` | Données des amis |
| `friendList[i].username` | `string` | Nom d'utilisateur de l'ami |
| `friendList[i].lastTimeOnline` | `string` | Date de dernière connection de l'ami (au format ISO) |
| `friendList[i].avatar` | `string` | Chemin vers l'image de l'ami |
| `friendList[i].online` | `string` | Status de l'ami |
| `blockList` | `array d'objet` | Données des bloqués |
| `blockList[i].username` | `string` | Nom d'utilisateur du bloqué |
| `blockList[i].avatar` | `string` | Chemin vers l'image du bloqué |
| `challengeReceived` | `Objet JSON` | Données des défis reçus |
| `challengeReceived[i].game` | `string` | Nom du jeu (`Pong`) |
| `challengeReceived[i].username` | `array de string` | Nom d'utilisateurs des challengers |
| `challengeAccepted` | `Objet JSON` | Données des défis acceptés |
| `challengeAccepted[i].game` | `string` | Nom du jeu (`Pong`) |
| `challengeAccepted[i].username` | `array de string` | Nom d'utilisateurs des challengers acceptés |

##### Erreur

```http
200 OK
403 Forbidden
```
```json
{
	"error": "<cause>"
}
```

Causes possibles:

- JSON ou token JWT invalide
- Utilisateur non connecté ou inexistant

---
