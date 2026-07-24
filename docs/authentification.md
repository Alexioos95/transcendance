## Authentification

Points d'accès en rapport avec l'authentification des utilisateurs.

---

### **GET /user/checkJwt**

Vérifie que le token JWT de l'utilisateur connecté est valide.

!!! info "Accès"
	Public

#### Requête

```http
GET /user/checkJwt HTTP/1.1
```
ou
```js
fetch("/user/checkJwt");
```

#### Réponse

##### Succès

Renvoie les informations de l'utilisateur connecté.

```http
200 OK
```
```json
{
	"avatar": "/images/path/to.png",
	"email": "example@gmail.com",
	"guestMode": false,
	"lang": "FR",
	"twoFA": false,
	"username": "example"
}
```

| Champ | Type | Description |
| :--- | :--- | :--- |
| `avatar` | `string` | Chemin vers l'image |
| `email` | `string` | Adresse mail |
| `guestMode` | `boolean` | Mode invité utilisé ? |
| `lang` | `string` | Langue utilisée (`FR`, `EN`, `NL`) |
| `twoFA` | `boolean` | Authentification à deux facteurs (2FA) activée ? |
| `username` | `string` | Nom d'utilisateur |

##### Erreur

```http
200 OK
```
```json
{
	"error": "<cause>"
}
```

Causes possibles:

- Token JWT non existant, invalide ou expiré

---

### **POST /user/register/**

Créer un nouvel utilisateur dans la base de donnée, et créer son token JWT.

!!! info "Accès"
	Public

#### Requête

| Champ | Type | Description |
| :--- | :--- | :--- |
| `username` | `string` | Nom d'utilisateur |
| `email` | `string` | Adresse mail |
| `password` | `string` | Mot de passe (en clair) |
| `lang` | `string` | Langue utilisée (`FR`, `EN`, `NL`) |

```http
POST /user/register HTTP/1.1
Host: example.com
Content-Type: application/json
Accept: */*
Cookie: auth=encoded_jwt

{
	"username": "example",
	"email": "example@gmail.com",
	"password": "password123",
	"lang": "FR"
}
```
ou
```js
fetch("/user/register", {
	method: "POST",
	body: JSON.stringify({
		username: form.username.value,
		email: form.email.value,
		password: form.password.value,
		lang: form.lang.value
	}),
	credentials: "include"
});
```

#### Réponse

##### Succès

L'utilisateur a été créé dans la base de données. Renvoie ses informations.

```http
201 Created
```
```json
{
	"avatar": "/images/path/to.png",
	"email": "example@gmail.com",
	"guestMode": false,
	"lang": "FR",
	"twoFA": false,
	"username": "example"
}
```

| Champ | Type | Description |
| :--- | :--- | :--- |
| `avatar` | `string` | Chemin vers l'image |
| `email` | `string` | Adresse mail |
| `guestMode` | `boolean` | Mode invité utilisé ? |
| `lang` | `string` | Langue utilisée (`FR`, `EN`, `NL`) |
| `twoFA` | `boolean` | Authentification à deux facteurs (2FA) activée ? |
| `username` | `string` | Nom d'utilisateur |

##### Erreur

```http
200 OK
401 Unauthorized
403 Forbidden
409 Conflict
500 Internal Server Error
```
```json
{
	"error": "<cause>"
}
```

Causes possibles:

- JSON invalide
- Champs vide ou trop longs
- Nom d'utilisateur ou email déjà utilisé par un autre utilisateur
- Impossibilité d'écrire dans la base de données

---

### **POST /user/login**

Connecte l'utilisateur si les informations sont authentiques, et créer son token JWT.

- Si l'authentification à deux facteurs n'est pas activée, connecte l'utilisateur, créer son token JWT, et renvoie ses données.
- Si l'authentification à deux facteurs est activé, créer le token JWT de l'utilisateur, lui envoit un mail avec un code de confirmation, et renvoie des données limités. Un appel au point d'accès `POST /user/log2fa` est nécessaire dans ce cas.

!!! info "Accès"
	Public

#### Requête

| Champ | Type | Description |
| :--- | :--- | :--- |
| `email` | `string` | Adresse mail |
| `password` | `string` | Mot de passe (en clair) |

```http
POST /user/login HTTP/1.1
Host: example.com
Content-Type: application/json
Accept: */*
Cookie: auth=encoded_jwt

{
	"email": "example@gmail.com",
	"password": "password123",
}
```
```http
POST /user/log2fa HTTP/1.1
Host: example.com
Content-Type: application/json
Accept: */*
Cookie: auth=encoded_jwt

{
	"code": "123456"
}
```
ou
```js
fetch("/user/login", {
	method: "POST",
	body: JSON.stringify({
		email: form.email.value,
		password: form.password.value,
	}),
	credentials: "include"
}).then(response => response.json()).then(data => {
	if (!data.error && data.twoFA)
		fetch("/user/log2fa", {
			method: "POST",
			body: JSON.stringify({ code: input.value }),
			credentials: "include"
		})
});
```

#### Réponse

##### Succès

Les informations sont valides.

```http
200 OK
```
```json
{
	"avatar": "/images/path/to.png",
	"email": "example@gmail.com",
	"guestMode": false,
	"lang": "FR",
	"twoFA": false,
	"username": "example"
}
```

| Champ | Type | Description | |
| :--- | :--- | :--- | :--- |
| `avatar` | `string` | Chemin vers l'image | `*` |
| `email` | `string` | Adresse mail | `*` |
| `guestMode` | `boolean` | Mode invité utilisé ? | |
| `lang` | `string` | Langue utilisée (`FR`, `EN`, `NL`) | `*` |
| `twoFA` | `boolean` | Authentification à deux facteurs (2FA) activée ? |
| `username` | `string` | Nom d'utilisateur | `*` |

`*` : Les champs indiqués ne seront renvoyés que si l'authentification à deux facteurs est désactivée, ou le seront par un appel au point d'accès `POST /user/log2fa` une fois le code validé si elle l'est.

##### Erreur

```http
200 OK
401 Unauthorized
403 Forbidden
```
```json
{
	"error": "<cause>"
}
```

Causes possibles:

- JSON invalide
- Email ou mot de passe incorrect
- Utilisateur non existant dans la base de données

---

### **GET /user/checkAuth42**

Vérifie le status de l'attente de connexion à l'intranet 42.

!!! info "Accès"
	Public

#### Requête

```http
GET /user/checkAuth42 HTTP/1.1
Host: example.com
Cookie: auth=encoded_jwt
Connection: keep-alive
Accept: */*
```
ou
```js
const myInterval = setInterval(() => {
	fetch("/user/checkAuth42", { credentials: "include" });
}, 1000);
```

#### Réponse

##### Succès

L'attente est terminée. Renvoie les données de l'utilisateur.

```http
200 OK
```
```json
{
	"avatar": "/path/to.png",
	"email": "login@student.42.fr",
	"guestMode": false,
	"lang": "FR",
	"twoFA": false,
	"username": "login"
}
```

| Champ | Type | Description |
| :--- | :--- | :--- |
| `avatar` | `string` | Chemin vers l'image |
| `email` | `string` | Adresse mail |
| `guestMode` | `boolean` | Mode invité utilisé ? |
| `lang` | `string` | Langue utilisée (`FR`, `EN`, `NL`) |
| `twoFA` | `boolean` | Authentification à deux facteurs (2FA) activée ? |
| `username` | `string` | Nom d'utilisateur |

Toujours en cours d'attente.

```http
204 No Content
```
```json
{
	"error": "still waiting"
}
```
##### Erreur

```http
405 Method Not Allowed
```

Causes possibles:

- Autre méthode que GET utilisée

---

### **POST /user/resetPaswd**

Envoie un mail avec un lien de réinitialisation de mot de passe à l'adresse indiquée.

!!! info "Accès"
	Public

#### Requête

| Champ | Type | Description |
| :--- | :--- | :--- |
| `email` | `string` | Adresse mail |

```http
POST /user/resetPaswd HTTP/1.1
Host: example.com
Content-Type: application/json
Accept: */*

{
	"email": "example@gmail.com",
}
```
ou
```js
fetch("/user/resetPaswd", {
	method: "POST",
	body: JSON.stringify({
		email: form.email.value
	}),
});
```

#### Réponse

##### Succès

Le mail a été envoyé.

```http
200 OK
```
```json
{
	"message": "Password reset email sent successfully"
}
```

##### Erreur

```http
403 Forbidden
500 Internal Server Error
```
```json
{
	"error": "<cause>"
}
```

Causes possibles:

- JSON invalide
- Adresse mail invalide ou non utilisée par un utilisateur
- Service mail indisponible

---

### **POST /user/sendNewPaswd**

Vérifie la validité du code, et met à jour le mot de passe de l'utilisateur dans la base de données.

!!! info "Accès"
	Public

#### Requête

| Champ | Type | Description |
| :--- | :--- | :--- |
| `password` | `string` | Nouveau mot de passe |
| `code` | `string` | Code de confirmation dans l'URL |

```http
POST /user/resetPaswd HTTP/1.1
Host: example.com
Content-Type: application/json
Accept: */*
Cookie: auth=encoded_jwt

{
	"password": "password123",
	"code": "123456",
}
```
ou
```js
fetch("/user/resetPaswd", {
	method: "POST",
	body: JSON.stringify({
		password: form.password.value,
		code: urlParams.get("code")
	}),
});
```

#### Réponse

##### Succès

Le mot de passe de l'utilisateur a été changé dans la base de données.

```http
200 OK
```
```json
{
	"message": "new password set successfuly"
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

- JSON invalide
- Champs vides ou invalides
- Impossibilité d'écrire dans la base de données

---

### **GET /user/disconnect**

Supprime le token JWT de l'utilisateur.

!!! info "Accès"
	Public

#### Requête

```http
GET /user/disconnect HTTP/1.1
Host: example.com
Cookie: auth=encoded_jwt
Accept: */*
```
ou
```js
fetch("/user/disconnect", { credentials: "include" });
```

#### Réponse

##### Succès

Le token a été supprimé.

```http
200 OK
```

---

## Deux facteurs (2FA)

Points d'accès en rapport avec l'authentification à deux facteurs (2FA).

---

### **POST /user/init2fa**

Active l'authentification à deux facteurs pour l'utilisateur connecté dans la base de données, et lui envoie un mail avec un code de validation.

!!! info "Accès"
	Public

#### Requête

| Champ | Type | Description |
| :--- | :--- | :--- |
| `type` | `string` | Type de 2FA (`email`, `off`) |

```http
POST /user/set2fa HTTP/1.1
Host: example.com
Content-Type: application/json
Accept: */*
Cookie: auth=encoded_jwt

{
	"type": "email"
}
```
ou
```js
fetch("/user/set2fa", {
	method: "POST",
	body: JSON.stringify({
		type: form.type.value
	}),
	credentials: "include"
});
```

#### Réponse

##### Succès

Un mail est envoyé à l'utilisateur et son profil est mis à jour dans la base de données.

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
500 Internal Server Error
```
```json
{
	"error": "<cause>"
}
```

Causes possibles:

- Utilisateur non connecté ou non existant
- JSON ou Token JWT invalide
- 2FA déjà activée
- Impossibilité d'écrire dans la base de données

---

### **POST /user/set2fa**

Confirme l'activation de la 2FA.

!!! info "Accès"
	Public

#### Requête

| Champ | Type | Description |
| :--- | :--- | :--- |
| `type` | `string` | Code de vérification |

```http
POST /user/set2fa HTTP/1.1
Host: example.com
Content-Type: application/json
Accept: */*
Cookie: auth=encoded_jwt

{
	"type": "123456"
}
```
ou
```js
fetch("/user/set2fa", {
	method: "POST",
	body: JSON.stringify({
		type: form.code.value
	}),
	credentials: "include"
});
```

#### Réponse

##### Succès

L'activation de la 2FA a été confirmée.

```http
200 OK
```
```json
{
	"message": "2fa activation success"
}
```

##### Erreur

```http
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

- JSON ou Token JWT invalide
- Utilisateur non connecté ou non existant
- Impossibilité d'écrire dans la base de données

---

### **POST /user/log2fa**

Vérifie le code de 2FA reçu, et créer son token JWT.

!!! info "Accès"
	Public

#### Requête

| Champ | Type | Description |
| :--- | :--- | :--- |
| `code` | `string` | Code de connexion |

```http
POST /user/log2fa HTTP/1.1
Host: example.com
Content-Type: application/json
Accept: */*
Cookie: auth=encoded_jwt

{
	"code": "123456"
}
```
ou
```js
fetch("/user/log2fa", {
	method: "POST",
	body: JSON.stringify({ code: input.value }),
	credentials: "include"
});
```

#### Réponse

##### Succès

Le code est valide. Renvoie les données de l'utilisateur.

```http
200 OK
```
```json
{
	"avatar": "/images/path/to.png",
	"email": "example@gmail.com",
	"guestMode": false,
	"lang": "FR",
	"username": "example"
}
```

| Champ | Type | Description |
| :--- | :--- | :--- |
| `avatar` | `string` | Chemin vers l'image |
| `email` | `string` | Adresse mail |
| `guestMode` | `boolean` | Mode invité utilisé ? |
| `lang` | `string` | Langue utilisée (`FR`, `EN`, `NL`) |
| `username` | `string` | Nom d'utilisateur |

##### Erreur

```http
401 Unauthorized
403 Forbidden
```
```json
{
	"error": "<cause>"
}
```

Causes possibles:

- JSON ou code invalide
