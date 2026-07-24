## Jeu

Points d'accès en rapport avec le jeu.

---

### **POST /user/sendInvitation**

Envoie une invitation de jeu Pong.

!!! info "Accès"
	Public

#### Requête

| Champ | Type | Description |
| :--- | :--- | :--- |
| `toChallenge` | `string` | Nom d'utilisateur de la personne à défier |

```http
POST /user/sendInvitation HTTP/1.1
Host: example.com
Content-Type: application/json
Accept: */*
Cookie: auth=encoded_jwt

{
	"toChallenge": "example"
}
```
ou
```js
fetch("/user/sendInvitation", {
	method: "POST",
	body: JSON.stringify({
		toChallenge: "example"
	}),
	credentials: "include"
});
```

#### Réponse

##### Succès

L'invitation a été envoyée.

```http
200 OK
```
```json
{
	"message": "player successfully invited"
}
```

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

- JSON ou token JWT invalide
- Utilisateur inexistant
- Nom d'utilisateur inexistant

---

### **POST /user/acceptInvitation**

Accepte une invitation de jeu Pong.

!!! info "Accès"
	Public

#### Requête

| Champ | Type | Description |
| :--- | :--- | :--- |
| `username` | `string` | Nom d'utilisateur de la personne ayant défié |

```http
POST /user/acceptInvitation HTTP/1.1
Host: example.com
Content-Type: application/json
Accept: */*
Cookie: auth=encoded_jwt

{
	"username": "example"
}
```
ou
```js
fetch("/user/acceptInvitation", {
	method: "POST",
	body: JSON.stringify({
		username: "example"
	}),
	credentials: "include"
});
```

#### Réponse

##### Succès

L'invitation a été acceptée.

```http
200 OK
```

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

- JSON ou token JWT invalide
- Utilisateur inexistant
- Nom d'utilisateur inexistant ou temporairement inaccessible
- Invitation expirée

---

### **POST /user/seeHistory**

Renvoie l'historique de partie de l'utilisateur.

!!! info "Accès"
	Public

#### Requête

| Champ | Type | Description |
| :--- | :--- | :--- |
| `seeHistory` | `string` | Nom d'utilisateur |

```http
POST /user/seeHistory HTTP/1.1
Host: example.com
Content-Type: application/json
Accept: */*
Cookie: auth=encoded_jwt

{
	"seeHistory": "example"
}
```
ou
```js
fetch("/user/seeHistory", {
	method: "POST",
	body: JSON.stringify({
		seeHistory: "example"
	}),
	credentials: "include"
});
```

#### Réponse

##### Succès

Renvoie l'historique de parties.

```http
200 OK
```
```json
{
	"matches": [
		{
			"game": "pong",
			"username1": "example",
			"username2": "example2",
			"winner": "example",
			"score1": 11,
			"score2": 4,
			"date": "2026-07-23 14:37:52.123456+00:00"
		}
	]

}
```

| Champ | Type | Description |
| :--- | :--- | :--- |
| `matches` | `array d'objet` | Liste de parties |
| `matches[i].game` | `string` | Nom du jeu (`pong`) |
| `matches[i].username1` | `string` | Nom d'utilisateur joueur 1 |
| `matches[i].username2` | `string` | Nom d'utilisateur joueur 2 |
| `matches[i].winner` | `string` | Nom d'utilisateur du gagnant |
| `matches[i].score1` | `int` | Score du joueur 1 |
| `matches[i].score2` | `int` | Score du joueur 2 |
| `matches[i].date` | `string` | Date de la fin de partie (au format ISO) |

##### Erreur

```http
401 Unauthorized
403 Forbidden
404 Not Found
```
```json
{
	"error": "<cause>"
}
```

Causes possibles:

- JSON ou token JWT invalide
- Nom d'utilisateur inexistant

---

### **WEBSOCKET ws/pong**

Connecte l'utilisateur au serveurr du service Pong.

!!! info "Accès"
	Public

#### Requête

```js
socket = new WebSocket("wss://" + window.location.hostname + "/ws/pong");
```

#### Réponse

##### Succès

Connecté au serveur. Envoie d'un JSON périodique dans l'event JS `message`.

```js
socket.addEventListener("message", function(event) {
	const data = JSON.parse(event.data);
	if (data.type === "game_update")
		socket.send(JSON.stringify({

		}));
	else if (data.type === "game_over" && socket)
		socket.close(1000);
});
```

```json
{
	"username": "example",
	"canvas_width": "100",
	"canvas_height": "100",
	"paddle_width": "2",
	"paddle_height": "20",
	"x_paddleLeft": "5",
	"y_paddleLeft": "40",
	"x_paddleRight": "93",
	"y_paddleRight": "40",
	"ball": {
		"x": "50",
		"y": "50",
		"radius": "1",
		"game_score_paddleLeft": "0",
		"game_score_paddleRight":  "0",
	},
}
```

| Champ | Type | Description |
| :--- | :--- | :--- |
| `type` | `string` | Type du message (`game_update`, `game_over`) |
| `game_state` | `Objet JSON` | Données de jeu |
| `game_state.username` | `string` | Nom d'utilisateur |
| `game_state.canvas_width` | `int` | Largeur du canvas (en %) |
| `game_state.canvas_height` | `int` | Hauteur du canvas (en %) |
| `game_state.paddle_width` | `int` | Largeur de la raquette (en %) |
| `game_state.paddle_height` | `int` | Hauteur de la raquette (en %) |
| `game_state.x_paddleLeft` | `float` | Position x de la raquette gauche (en %) |
| `game_state.y_paddleLeft` | `float` | Position y de la raquette gauche (en %) |
| `game_state.x_paddleRight` | `float` | Position x de la raquette droite (en %) |
| `game_state.y_paddleRight` | `float` | Position y de la raquette droite (en %) |
| `game_state.ball` | `Objet JSON` | Données de la balle |
| `game_state.ball.x` | `float` | Position x de la balle |
| `game_state.ball.y` | `float` | Position y de la balle |
| `game_state.ball.radius` | `int` | Radius de la balle |
| `game_state.ball.game_score_paddleLeft` | `int` | Score du joueur de la raquette de gauche |
| `game_state.ball.game_score_paddleRight` | `int` | Score du joueur de la raquette de droite |

###### Retour

Attend un JSON en retour.

| Champ | Type | Description |
| :--- | :--- | :--- |
| `key` | `string` | Direction de la raquette du joueur (`top`, `bot`) |

```js
socket.send(JSON.stringify({
	key: "top"
}));
```

##### Erreur

```js
socket.addEventListener("error", function() {
});
```

Causes possibles:

- Token JWT invalide
- Joueur ou adversaire déjà dans une partie
- Timeout
- Impossibilité d'écrire dans la base de données

---

### **POST pong:8004/initGame**

Initialise une partie Pong côté serveur.

!!! warning "Accès"
	Privé

#### Requête

| Champ | Type | Description |
| :--- | :--- | :--- |
| `player1` | `int` | id de l'utilisateur dans la base de données |
| `player2` | `int` | id de l'utilisateur dans la base de données |

```http
POST pong:8004/initGame HTTP/1.1
Host: pong:8004
Content-Type: application/json
Accept: */*

{
	"player1": 1,
	"player2": 2
}
```

#### Réponse

##### Succès

La partie a été créée et ajoutée à la base de données.

```http
201 Created
```
```json
{
	"status": "Game created successfully"
}
```

##### Erreur

```http
403 Forbidden
```
```json
{
	"error": "<cause>"
}
```

Causes possibles:

- JSON invalide

---

### **POST pong:8004/getPlayerGames**

Renvoie l'historique de parties de l'utilisateur.

!!! warning "Accès"
	Privé

#### Requête

| Champ | Type | Description |
| :--- | :--- | :--- |
| `username` | `int` | id de l'utilisateur dans la base de données |

```http
POST pong:8004/getPlayerGames HTTP/1.1
Host: pong:8004
Content-Type: application/json
Accept: */*

{
	"username": 1,
}
```

#### Réponse

##### Succès

Renvoie l'historique de parties de l'utilisateur.

```http
200 OK
```
```json
{
	"matches" : [
		{
			"game": "pong",
			"username1": "example",
			"username2": "example2",
			"winner": "example",
			"score1": 11,
			"score2": 4,
			"date": "2026-07-23 14:37:52.123456+00:00"
		}
	]
}
```

| Champ | Type | Description |
| :--- | :--- | :--- |
| `matches` | `array d'objet` | Liste de parties |
| `matches[i].game` | `string` | Nom du jeu (`pong`) |
| `matches[i].username1` | `string` | Nom d'utilisateur joueur 1 |
| `matches[i].username2` | `string` | Nom d'utilisateur joueur 2 |
| `matches[i].winner` | `string` | Nom d'utilisateur du gagnant |
| `matches[i].score1` | `int` | Score du joueur 1 |
| `matches[i].score2` | `int` | Score du joueur 2 |
| `matches[i].date` | `string` | Date de la fin de partie (au format ISO) |

##### Erreur

```http
403 Forbidden
```
```json
{
	"error": "<cause>"
}
```

Causes possibles:

- JSON invalide

---

### **POST pong:8004/PlayerPlaying**

Vérifie si l'utilisateur est déjà dans une partie.

!!! warning "Accès"
	Privé

#### Requête

| Champ | Type | Description |
| :--- | :--- | :--- |
| `username` | `int` | id de l'utilisateur dans la base de données |

```http
POST pong:8004/PlayerPlaying HTTP/1.1
Host: pong:8004
Content-Type: application/json
Accept: */*

{
	"username": 1,
}
```

#### Réponse

##### Succès

Renvoie l'historique de parties de l'utilisateur.

```http
200 OK
```

##### Erreur

```http
403 Forbidden
418 I'm a teapot
```
```json
{
	"error": "<cause>"
}
```

Causes possibles:

- JSON invalide
- Utilisateur inexistant
