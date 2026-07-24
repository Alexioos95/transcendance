## Chat

Points d'accès en rapport avec le chat en direct.

---

### **WEBSOCKET ws/chat**

Connecte l'utilisateur au serveur du service Chat.

!!! info "Accès"
	Public

#### Requête

```js
socket = new WebSocket("wss://" + window.location.hostname + "/ws/chat");
```

#### Réponse

##### Succès

Connecté au serveur. Envoie d'un JSON périodique dans l'event JS `message`.

```js
socket.addEventListener("message", function(event) {
});
```

```json
{
	"type": "message",
	"message": "Lorem ipsum",
	"user": "example",
	"avatar": "/images/path/to.png"
}
```

| Champ | Type | Description | |
| :--- | :--- | :--- | :--- |
| `type` | `string` | Type du message (`message`, `connected`) | |
| `message` | `string` | Message | * |
| `user` | `string` | Nom d'utilisateur |
| `avatar` | `string` | Chemin de l'image | * |

`*` : Champs absents lors d'un message de type `connected`.

###### Retour

Attend un JSON en retour.

| Champ | Type | Description |
| :--- | :--- | :--- |
| `message` | `string` | Message |

```js
socket.send(JSON.stringify({
	"message": form.input.value
}));
```

##### Erreur

```js
socket.addEventListener("error", function() {
});
```

Causes possibles:

- Token JWT invalide

---

## Mail

Points d'accès en rapport avec le service mail.

---

### **POST mail:8002/sendMail**

Envoie un mail.

!!! warning "Accès"
	Privé

#### Requête

| Champ | Type | Description |
| :--- | :--- | :--- |
| `title` | `string` | Titre du mail |
| `body` | `string` | Corps du mail |

```http
POST mail:8002/sendMail HTTP/1.1
Host: mail:8002
Content-Type: application/json
Accept: */*

{
	'title': 'titre',
	'body': "message"
}
```

#### Réponse

##### Succès

Le mail a été envoyé.

```http
200 OK
```
```json
{
	"success": "Email sent successfully"
}
```

##### Erreur

```http
400 Bad Request
405 Method Not Allowed
500 Internal Server Error
```
```json
{
	"error": "<cause>"
}
```

Causes possibles:

- Autre méthode que POST utilisée
- JSON invalide
- Serveur mail indisponible
