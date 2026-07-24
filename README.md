# transcendance

Transcendance est une Single-Page Web Application responsive, qui permet aux utilisateurs de jouer au jeu-vidéo Pong directement sur internet, que ce soit en réseau local (à deux sur un clavier) ou en ligne (contre un autre joueur connecté). Un chat (textuel) en direct est également disponible.

Réalisé en JavaScript et Django.

## Usage

Créer un fichier ```.env``` avec les variables nécessaires dans le dossier ```services``` (un exemple est fourni), et executer la commande ```make``` afin de lancer les différent containers Dockers. Le serveur web tournera alors sur l'adresse ```https://<DUMP>```.

> [!NOTE]  
> Le fonctionnement de la connexion via l'intranet de 42 nécessite un compte sur ce dernier.

## Documentation API

[Documentation](https://alexioos95.github.io/transcendance/)

## Fonctionnalités
- Dockerisation en micro-service
- Gestion de sessions utilisateurs (inscription, connexion, authentification à deux facteurs, mot de passe oublié, modification d'informations, et cookies)
- Envoie de mails d'authentification à deux facteurs et de réinitialisation de mot de passe
- Jeu Pong en réseau local en 1 vs 1 ou tournoi à 4. Gestion des déplacement aux touches clavier, souris et écran tactile
- Chat textuel en direct, avec listes d'amis, bloqués, historiques de parties, et possibilité de défier un autre utilisateur en ligne
- Affichage entièrement responsive, et respectant les règles d'accessibilité
- Traduction de contenu en 3 langues : Français, Anglais et Néerlandais
- API publique, permettant la création d'add-ons et front-end alternatifs

## Demo
<img src="https://i.imgur.com/1TCkP0W.gif" alt="Login">  
<img src="https://i.imgur.com/7fuXrUV.gif" alt="Pong local">  
<img src="https://i.imgur.com/aPHQw4C.gif" alt="Defi et Pong en ligne">  
<img src="https://i.imgur.com/q1R2MLG.gif" alt="Historique">
