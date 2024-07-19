"use strict";
/////////////////////////
// Script
/////////////////////////
async function	run()
{
	const struct = {
		loginButton: document.getElementsByClassName("login-button")[0],
		menu: getMenuStruct(),
		screen: getScreenStruct(),
		tournament: getTournamentStruct(),
		chat: getChatStruct(),
		run: 1
	};
	setupEventListeners(struct);
	while (struct.run == 1)
	{
		await waitCoin(struct.menu)
			.then(() => coinAnimation(struct))
			.then(() => checkGameSelectorValidation(struct))
			.then(() => setupTournament(struct))
			.then(() => launchGame(struct))
			.catch((e) => {
				if (e === 0)
					rejectCoin(struct.menu);
			});
		// Faire un await pour le chat (?);
	}
}

function	setupEventListeners(struct)
{	
	struct.loginButton.addEventListener("click", function() {
		struct.run = 0;
		navigate("login");
	});
	// addEventListener abandonButton => stopper le jeu;
	struct.chat.tabs[0].addEventListener("click", function() {
		struct.chat.tabs[0].classList.add("active");
		struct.chat.tabs[1].classList.remove("active");
		struct.chat.tables[0].classList.add("active");
		struct.chat.tables[1].classList.remove("active");
	});
	struct.chat.tabs[1].addEventListener("click", function() {
		struct.chat.tabs[0].classList.remove("active");
		struct.chat.tabs[1].classList.add("active");
		struct.chat.tables[0].classList.remove("active");
		struct.chat.tables[1].classList.add("active");
	});
	struct.screen.wrapperCanvas.addEventListener("keydown", function(event) { enableStickMove(event, struct); });
	struct.screen.wrapperCanvas.addEventListener("keyup", function(event) { disableStickMove(event, struct); });
}

async function	launchGame(struct)
{
	if (struct.tournament.on == false)
	{
		await waitGoButton(struct)
			.then(() => activateStick(struct));
		struct.screen.game.run(struct)
	}
	else
	{
		await waitGoButton(struct)
			.then(() => clearScreen(struct.screen.wrapperCanvas))
			.then(() => activateStick(struct))
			.then(() => updateTournamentMarkers(struct))
			.then(() => struct.screen.game.run(struct));
	}
}

async function	endGame(struct)
{
	if (struct.tournament.on == false)
		resetInsertCoinButton(struct.menu.insertCoinButton);
	await deactivateStick(struct.screen.sticks);
	if (struct.tournament.on == true)
	{
		struct.tournament.matches--;
		updateTournamentWinners(struct);
		updateTournamentMarkers(struct);
		updateTournamentControlNames(struct);
		if (struct.tournament.matches != 0)
			launchGame(struct);
		else
			endOfTournament(struct);
	}
}

async function	sleep(ms)
{ return new Promise(resolve => setTimeout(resolve, ms)); }

//////////////////////////////////////////////////////
// Get(?)Struct
//////////////////////////////////////////////////////
function	getMenuStruct()
{
	const struct = {
		form: document.querySelector(".wrapper-left-section form"),
		inputs: document.querySelectorAll(".mode-selector input"),
		insertCoinButton: document.getElementById("selector"),
	};
	return (struct);
}

function	getScreenStruct()
{
	const struct = {
		wrapperCanvas: document.getElementsByClassName("wrapper-canvas")[0],
		sticks: getSticksStruct(),
		playerOnControls: document.getElementsByClassName("playername"),
		game: undefined
	};
	return (struct);
}

function	getSticksStruct()
{
	const elements = document.getElementsByClassName("stick");
	const struct = {
		keys: { w: 0, s: 0, up: 0, down: 0 },
		left: elements[0],
		right: elements[1],
	};
	return (struct);
}

function	getTournamentStruct()
{
	const struct = {
		on: false,
		cancel: document.querySelector(".tournament-form .fa-circle-arrow-left"),
		validate: document.querySelector(".tournament-form button"),
		overview: document.getElementsByClassName("tournament-overview")[0],
		players: document.getElementsByClassName("tournament-player"),
		winners: document.getElementsByClassName("tournament-winner"),
		markers: document.getElementsByClassName("tournament-marker"),
		markerArray: [["EN COURS", "SUIVANT", "PROCHAINEMENT"], ["", "EN ATTENTE", "PROCHAINEMENT"], ["", "EN COURS", "PROCHAINEMENT"], ["", "", "EN ATTENTE"], ["", "", "EN COURS"], ["", "", ""]],
		names: [],
		matches: 3
	};
	return (struct);
}

function	getChatStruct()
{
	const struct = {
		tabs: document.querySelectorAll(".wrapper-tabs-button button"),
		tables: document.querySelectorAll(".wrapper-tabs-tables table"),
		input: document.querySelector(".chat-input input")
	};
	return (struct);
}

//////////////////////////////////////////////////////
// Menu (Game selector's form; Tournament Overview)
//////////////////////////////////////////////////////
async function waitCoin(struct) {
	return new Promise((resolve, reject) => {
		function handleClick() { resolve(); }
		struct.insertCoinButton.addEventListener("click", handleClick, { once: true });
	});
}

function	getCoin(button)
{
	const coin = document.createElement("div");
	coin.classList.add("coin");
	button.appendChild(coin);
	return (coin);
}

async function	coinAnimation(struct)
{
	if (struct.run == 0)
		return new Promise ((resolve, reject) => { reject(); });
	if (document.getElementsByClassName("coin")[0] !== undefined)
		return new Promise ((resolve, reject) => { reject(); });
	const coin = getCoin(struct.menu.insertCoinButton);
	const text = document.querySelector("#selector span");
	return new Promise ((resolve, reject) => {
		sleep(50)
			.then(() => addInsertCoinAnimations(coin, text))
			.then(() => resolve())
	});
}

async function	addInsertCoinAnimations(coin, text)
{
	text.classList.add("active");
	coin.classList.add("active");
	await sleep(3100);
}

async function	checkGameSelectorValidation(struct)
{
	return new Promise((resolve, reject) => {
		const form = document.querySelector(".wrapper-left-section form");
		const data = new FormData(form);
		const game = data.get("game");
		const mode = data.get("mode");
		const title = document.getElementsByTagName("h2")[0];

		if (game === null || mode === null)
			return (reject(0));
		if (game == "pong")
			struct.screen.game = getPongStruct();
		// else if (game == "tetris")
			// struct.screen.game = getTetrisStruct();
		if (mode == "tournament")
			struct.tournament.on = true;
		title.style.opacity = 0;
		sleep(450)
			.then(() => title.style.opacity = 1)
			.then(() => title.innerHTML = struct.screen.game.name)
		clearScreen(struct.screen.wrapperCanvas);
		resolve();
	});
}

async function	waitGoButton(struct)
{
	return new Promise((resolve, reject) => {
		const button = document.createElement("button");
		const controls = document.getElementsByClassName("wrapper-bottom-section")[0];

		button.classList.add("go-button");
		button.type = "button";
		button.innerHTML = "GO!";
		struct.screen.wrapperCanvas.appendChild(button);
		controls.classList.add("wrapper-bottom-section-hover");
		button.addEventListener("click", function() {
			controls.classList.remove("wrapper-bottom-section-hover");
			button.remove();
			resolve();
		}, { once: true });
	});
}

function	clearScreen(wrapper)
{
	while (wrapper.lastChild.nodeName != "FORM")
		wrapper.removeChild(wrapper.lastChild);
}

async function	rejectCoin(struct)
{
	const title = document.getElementsByTagName("h2")[0];
	const coin = document.getElementsByClassName("coin")[0];

	if (title.innerHTML !== "LOADING")
	{
		title.style.opacity = 0;
		await sleep(450)
			.then(() => title.style.opacity = 1)
			.then(() => title.innerHTML = "LOADING")
	}
	coin.classList.add("fall");
	coin.classList.remove("active");
	await sleep(1000);
	resetInsertCoinButton(struct.insertCoinButton);
}

function	resetInsertCoinButton(button)
{
	const text = document.querySelector("#selector span");
	const coin = document.getElementsByClassName("coin")[0];

	text.classList.remove("active")
	button.removeChild(coin);
}

/////////////////////////
// Sticks
/////////////////////////
async function	activateStick(struct)
{
	const path = "/svg/stick/state";
	const extension = ".svg";

	await sleep(450);
	for (let i = 0; i < 5; i++)
	{
		struct.screen.sticks.left.src = path + i + extension;
		struct.screen.sticks.right.src = path + i + extension;
		await sleep(60);
	}
}

function	enableStickMove(event, struct)
{
	if (struct.screen.game.running == 0)
		return ;
	if (event.key == "w" || event.key == "W")
	{
		struct.screen.sticks.keys.w = 1;
		if (struct.screen.sticks.keys.s == 0)
			struct.screen.sticks.left.src = "/svg/stick/up.svg";
		else
			struct.screen.sticks.left.src = "/svg/stick/state4.svg";
	}
	else if (event.key == "s" || event.key == "S")
	{
		struct.screen.sticks.keys.s = 1;
		if (struct.screen.sticks.keys.w == 0)
			struct.screen.sticks.left.src = "/svg/stick/down.svg";
		else
			struct.screen.sticks.left.src = "/svg/stick/state4.svg";
	}
	else if (event.key == "ArrowUp")
	{
		struct.screen.sticks.keys.up = 1;
		if (struct.screen.sticks.keys.down == 0)
			struct.screen.sticks.right.src = "/svg/stick/up.svg";
		else
			struct.screen.sticks.right.src = "/svg/stick/state4.svg";
	}
	else if (event.key == "ArrowDown")
	{
		struct.screen.sticks.keys.down = 1;
		if (struct.screen.sticks.keys.up == 0)
			struct.screen.sticks.right.src = "/svg/stick/down.svg";
		else
			struct.screen.sticks.right.src = "/svg/stick/state4.svg";
	}
}

function	disableStickMove(event, struct)
{
	if (struct.screen.game.running == 0)
		return ;
	if (event.key == "w" || event.key == "W")
	{
		struct.screen.sticks.keys.w = 0;
		struct.screen.sticks.left.src = "/svg/stick/state4.svg";
	}
	else if (event.key == "s" || event.key == "S")
	{
		struct.screen.sticks.keys.s = 0;
		struct.screen.sticks.left.src = "/svg/stick/state4.svg";
	}
	else if (event.key == "ArrowUp")
	{
		struct.screen.sticks.keys.up = 0;
		struct.screen.sticks.right.src = "/svg/stick/state4.svg";
	}
	else if (event.key == "ArrowDown")
	{
		struct.screen.sticks.keys.down = 0;
		struct.screen.sticks.right.src = "/svg/stick/state4.svg";
	}
}

async function	deactivateStick(sticks)
{
	const path = "/svg/stick/state";
	const extension = ".svg";

	for (let i = 4; i > -1; i--)
	{
		sticks.left.src = path + i + extension;
		sticks.right.src = path + i + extension;
		await sleep(60);
	}
}

/////////////////////////
// Tournament
/////////////////////////
async function	setupTournament(struct)
{
	if (struct.tournament.on == false)
		return ;
	await waitTournamentForm(struct.tournament)
		.then(() => getTournamentNames(struct.tournament))
		.then(() => shuffle(struct.tournament.names))
		.then(() => showTournamentOverview(struct))
		.then(() => updateTournamentControlNames(struct))
		.then(() => Promise.resolve())
		.catch((e) => Promise.reject(0))
}

async function	waitTournamentForm(struct)
{
	const form = document.getElementsByClassName("tournament-form")[0];
	form.classList.remove("hidden");
	return new Promise((resolve, reject) => {
		function validate() {
			form.classList.add("hidden");
			resolve();
		};
		function resetTournamentForm() {
			form.classList.add("hidden");
			form.reset();
			reject();
		};
		struct.validate.addEventListener("click", validate, { once: true });
		struct.cancel.addEventListener("click", resetTournamentForm, { once: true });
	});
}

function	getTournamentNames(struct)
{
	const form = document.getElementsByClassName("tournament-form")[0];
	const data = new FormData(form);
	let i = 0;
	let j = 1;
	let name;
	const names = [];

	while (i < 4)
	{
		name = data.get("p" + j);
		if (name === "")
			name = j.toString();
		names.push(name);
		i++;
		j++;
	}
	struct.names = names;
}

function	shuffle(array)
{
	let i = array.length;
	while (i != 0)
	{
	  let j = Math.floor(Math.random() * i);
	  i--;
	  [array[i], array[j]] = [array[j], array[i]];
	}
}

function	showTournamentOverview(struct)
{
	struct.tournament.players[0].innerHTML = struct.tournament.names[0];
	struct.tournament.players[1].innerHTML = struct.tournament.names[1];
	struct.tournament.players[2].innerHTML = struct.tournament.names[2];
	struct.tournament.players[3].innerHTML = struct.tournament.names[3];
	struct.tournament.winners[0].innerHTML = "-";
	struct.tournament.winners[0].style.opacity = 0;
	struct.tournament.winners[1].innerHTML = "-";
	struct.tournament.winners[1].style.opacity = 0;
	struct.tournament.markers[0].innerHTML = "EN ATTENTE";
	struct.tournament.markers[1].innerHTML = "SUIVANT";
	struct.tournament.markers[2].innerHTML = "PROCHAINEMENT";
	struct.menu.form.classList.add("hidden");
	struct.tournament.overview.classList.remove("hidden");
}

function	updateTournamentControlNames(struct)
{
	let i;

	if (struct.tournament.matches == 3)
		i = 0;
	else if (struct.tournament.matches == 2)
		i = 2;
	if (struct.tournament.matches != 1)
	{
		struct.screen.playerOnControls[0].innerHTML = struct.tournament.names[i];
		struct.screen.playerOnControls[1].innerHTML = struct.tournament.names[i + 1];
	}
	else
	{
		struct.screen.playerOnControls[0].innerHTML = struct.tournament.winners[0].innerHTML;
		struct.screen.playerOnControls[1].innerHTML = struct.tournament.winners[1].innerHTML;
	}
}

function	updateTournamentMarkers(struct)
{
	struct.tournament.markers[0].innerHTML = struct.tournament.markerArray[0][0];
	struct.tournament.markers[1].innerHTML = struct.tournament.markerArray[0][1];
	struct.tournament.markers[2].innerHTML = struct.tournament.markerArray[0][2];
	struct.tournament.markerArray.shift();
}

function	updateTournamentWinners(struct)
{
	if (struct.tournament.winners[0].dataset.decided == "tbd")
	{
		if (struct.screen.game.scores[0] > struct.screen.game.scores[1])
			struct.tournament.winners[0].innerHTML = struct.tournament.names[0];
		else
			struct.tournament.winners[0].innerHTML = struct.tournament.names[1];
		struct.tournament.winners[0].style.opacity = 1;
		struct.tournament.winners[0].setAttribute("data-decided", "yes");
	}
	else if (struct.tournament.winners[1].dataset.decided == "tbd")
	{
		if (struct.screen.game.scores[0] > struct.screen.game.scores[1])
			struct.tournament.winners[1].innerHTML = struct.tournament.names[2];
		else
			struct.tournament.winners[1].innerHTML = struct.tournament.names[3];
		struct.tournament.winners[1].style.opacity = 1;
		struct.tournament.winners[1].setAttribute("data-decided", "yes");
	}
}

async function	endOfTournament(struct)
{
	const winner = (struct.screen.game.scores[0] > struct.screen.game.scores[1]) ? struct.tournament.winners[0].innerHTML : struct.tournament.winners[1].innerHTML;
	struct.menu.form.classList.remove("hidden");
	struct.tournament.overview.classList.add("hidden");
	struct.tournament.winners[0].setAttribute("data-decided", "tbd");
	struct.tournament.winners[1].setAttribute("data-decided", "tbd");
	struct.screen.playerOnControls[0].innerHTML = "";
	struct.screen.playerOnControls[1].innerHTML = "";
	alert("👑 " + winner + " 👑");
	struct.tournament = getTournamentStruct();
	resetInsertCoinButton(struct.menu.insertCoinButton);
}
