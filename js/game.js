"use strict";
/////////////////////////
// Script
/////////////////////////
async function	run()
{
	const struct = {
		header: getHeaderStruct(),
		cards: getCardsStruct(),
		gameForm: getGameFormStruct(),
		screen: getScreenStruct(),
		tournament: getTournamentStruct(),
		options: getOptionsStruct(),
		history: getHistoryStruct(),
		tabs: getTabsStruct(),
		run: 1
	};
	setupEventListeners(struct);
	while (struct.run === 1)
	{
		await waitCoin(struct.gameForm)
			.then(() => coinAnimation(struct))
			.then(() => checkGameSelectorValidation(struct))
			.then(() => setupTournament(struct))
			.then(() => launchGame(struct))
			.catch((e) => {
				if (e === 0)
					rejectCoin(struct.gameForm);
			});
		// Faire un await pour le chat (?);
	}
}

function	setupEventListeners(struct)
{
	// addEventListener abandonButton => stopper le jeu;

	// Header Buttons
	struct.header.historyButton.addEventListener("click", function() {
		resetPhoneClasses(struct, struct.cards.chat);
		struct.tabs.wrapperTabs.classList.add("hidden");
		struct.tabs.wrapperInputs.classList.add("zindex");
		struct.history.wrapper.classList.remove("zindex");
		struct.history.wrapper.classList.remove("hidden");
	});
	struct.header.gameSelectorButton.addEventListener("click", function() { resetPhoneClasses(struct, struct.cards.gameSelector); });
	struct.header.chatButton.addEventListener("click", function() {
		resetPhoneClasses(struct, struct.cards.chat);
		resetHistoryClasses(struct);
		showTab(struct.tabs.chat, struct.tabs.friend)
	});
	struct.header.friendButton.addEventListener("click", function() {
		resetPhoneClasses(struct, struct.cards.chat);
		resetHistoryClasses(struct);
		showTab(struct.tabs.friend, struct.tabs.chat)
	});
	struct.header.optionButton.addEventListener("click", function() {
		resetPhoneClasses(struct, struct.cards.screen);
		showScreen(struct.screen, struct.screen.wrapperOptions)
	});
	struct.header.logoutButton.addEventListener("click", function() {
		struct.run = 0;
		navigate("login");
	});
	// Cross Buttons
	struct.options.leaveButton.addEventListener("click", function() {
		if (struct.tournament.on === true && struct.tournament.names.length === 0)
			showScreen(struct.screen, struct.screen.wrapperTournamentForm);
		else
			showScreen(struct.screen, struct.screen.wrapperCanvas);
	});
	struct.history.leaveButton.addEventListener("click", function() {		
		resetHistoryClasses(struct);
	});
	// Tabs Account/Blocked
	struct.options.account.button.addEventListener("click", function() {
		showTab(struct.options.account, struct.options.blocked)
	});
	struct.options.blocked.button.addEventListener("click", function() {
		showTab(struct.options.blocked, struct.options.account)
	});
	// Tabs Chat/Friend
	struct.tabs.chat.button.addEventListener("click", function() {
		showTab(struct.tabs.chat, struct.tabs.friend)
	});
	struct.tabs.friend.button.addEventListener("click", function() {
		showTab(struct.tabs.friend, struct.tabs.chat)
	});
	// Sticks
	struct.screen.wrapperCanvas.addEventListener("keydown", function(event) { enableStickMove(event, struct); });
	struct.screen.wrapperCanvas.addEventListener("keyup", function(event) { disableStickMove(event, struct); });
}

async function	launchGame(struct)
{
	if (struct.tournament.on === false)
	{
		await waitGoButton(struct)
			.then(() => activateStick(struct));
		struct.screen.game.run(struct)
	}
	else
	{
		await waitGoButton(struct)
			.then(() => clearCanvas(struct.screen.wrapperCanvas))
			.then(() => activateStick(struct))
			.then(() => updateTournamentMarkers(struct))
			.then(() => struct.screen.game.run(struct));
	}
}

async function	endGame(struct)
{
	if (struct.tournament.on === false)
	{
		if (isOnPhone())
			await sleep(2500);
		struct.cards.gameSelector.classList.remove("zindex");
		struct.cards.screen.classList.add("zindex");
		struct.header.wrapper.classList.remove("zindex");
		resetInsertCoinButton(struct.gameForm.insertCoinButton);
	}
	await deactivateStick(struct.screen.sticks);
	if (struct.tournament.on === true)
	{
		struct.tournament.matches--;
		updateTournamentWinners(struct);
		updateTournamentMarkers(struct);
		updateTournamentNames(struct, struct.screen.playerOnControls);
		if (struct.tournament.matches != 0)
			launchGame(struct);
		else
			endOfTournament(struct);
	}
}

/////////////////////////
// Utility
/////////////////////////
async function	sleep(ms)
{ return new Promise(resolve => setTimeout(resolve, ms)); }

function	isOnPhone()
{
	if (window.innerWidth < 1024)
		return (true);
	return (false);
}

function	resetPhoneClasses(struct, except)
{
	struct.cards.gameSelector.classList.add("zindex");
	struct.cards.screen.classList.add("zindex");
	struct.cards.chat.classList.add("zindex");
	struct.history.wrapper.classList.add("zindex");
	if (except !== undefined)
		except.classList.remove("zindex");
}

function	resetHistoryClasses(struct)
{
	struct.tabs.wrapperTabs.classList.remove("hidden");
	struct.tabs.wrapperInputs.classList.remove("zindex");
	struct.history.wrapper.classList.add("zindex");
	struct.history.wrapper.classList.add("hidden");
}

function	clearCanvas(wrapper)
{
	while (wrapper.firstChild)
		wrapper.firstChild.remove();
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

function	showTab(show, hide)
{
	hide.button.classList.remove("active");
	hide.table.classList.remove("active");
	if (hide.input !== undefined)
		hide.input.classList.remove("active");
	if (show !== undefined)
	{
		show.button.classList.add("active");
		show.table.classList.add("active");
		if (show.input !== undefined)
			show.input.classList.add("active");
	}
}

function	showScreen(struct, show)
{
	struct.wrapperCanvas.classList.add("hidden");
	struct.wrapperTournamentForm.classList.add("hidden");
	struct.wrapperOptions.classList.add("hidden");
	show.classList.remove("hidden");
}

//////////////////////////////////////////////////////
// Get(?)Struct
//////////////////////////////////////////////////////
function	getHeaderStruct()
{
	const buttons = document.querySelectorAll("header button");
	const struct = {
		wrapper: document.getElementsByTagName("header")[0],
		historyButton: buttons[0],
		gameSelectorButton: buttons[1],
		chatButton: buttons[2],
		friendButton: buttons[3],
		optionButton: buttons[4],
		logoutButton: buttons[5]
	};
	return (struct);
}

function	getCardsStruct()
{
	const cards = document.getElementsByClassName("wrapper-sections")[0].children;
	const struct = {
		gameSelector: cards[0],
		screen: cards[1],
		chat: cards[2]
	};
	return (struct);
}

function	getGameFormStruct()
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
		wrapperOptions: document.getElementsByClassName("wrapper-options")[0],
		wrapperTournamentForm: document.getElementsByClassName("tournament-form")[0],
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
	const buttons = document.querySelectorAll(".tournament-form button");
	const struct = {
		on: false,
		cancel: buttons[0],
		validate: buttons[1],
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

function	getOptionsStruct()
{
	const buttons = document.querySelectorAll(".wrapper-options-buttons button");
	const accountStruct = {
		button: buttons[0],
		table: document.getElementsByClassName("options-form")[0]
	};
	const blockedStruct = {
		button: buttons[1],
		table: document.getElementsByClassName("wrapper-blocked")[0]
	};
	const struct = {
		wrapper: document.getElementsByClassName("wrapper-options")[0],
		leaveButton: document.querySelector(".wrapper-options .cross-button"),
		account: accountStruct,
		blocked: blockedStruct
	};
	return (struct);
}

function	getHistoryStruct()
{
	const struct = {
		wrapper: document.getElementsByClassName("wrapper-history")[0],
		leaveButton: document.querySelector(".wrapper-history button")
	};
	return (struct);
}

function	getTabsStruct()
{
	const buttons = document.querySelectorAll(".wrapper-tabs-buttons button");
	const tables = document.querySelectorAll(".wrapper-tabs-tables table");
	const inputs = document.querySelectorAll(".wrapper-inputs div");
	const chatStruct = {
		button: buttons[0],
		table: tables[0],
		input: inputs[0]
	};
	const friendStruct = {
		button: buttons[1],
		table: tables[1],
		input: inputs[1]
	};
	const struct = {
		wrapperTabs: document.getElementsByClassName("wrapper-tabs")[0],
		wrapperInputs: document.getElementsByClassName("wrapper-inputs")[0],
		chat: chatStruct,
		friend: friendStruct
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
	if (struct.run === 0)
		return new Promise ((resolve, reject) => { reject(); });
	if (document.getElementsByClassName("coin")[0] !== undefined)
		return new Promise ((resolve, reject) => { reject(); });
	const coin = getCoin(struct.gameForm.insertCoinButton);
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
		if (game === "pong")
			struct.screen.game = getPongStruct();
		// else if (game === "tetris")
			// struct.screen.game = getTetrisStruct();
		if (mode === "tournament")
			struct.tournament.on = true;
		title.style.opacity = 0;
		sleep(450)
			.then(() => title.style.opacity = 1)
			.then(() => title.innerHTML = struct.screen.game.name)
		clearCanvas(struct.screen.wrapperCanvas);
		showScreen(struct.screen, struct.screen.wrapperCanvas)
		resetPhoneClasses(struct)
		struct.header.wrapper.classList.add("zindex");
		struct.options.wrapper.classList.add("hidden");
		struct.cards.screen.classList.remove("zindex");
		resolve();
	});
}

async function	waitGoButton(struct)
{
	return new Promise((resolve, reject) => {
		const button = document.createElement("button");
		const controls = document.getElementsByClassName("wrapper-bottom-section")[0];
		const span1 = document.createElement("span");
		const span2 = document.createElement("span");

		button.classList.add("go-button");
		button.type = "button";
		button.innerHTML = "GO!";
		span1.classList.add("canvas-user-1");
		span2.classList.add("canvas-user-2");
		const names = [span1, span2];
		if (struct.tournament.on === true)
		{
			updateTournamentNames(struct, names);
			struct.screen.wrapperCanvas.appendChild(span1);
			struct.screen.wrapperCanvas.appendChild(span2);
		}
		struct.screen.wrapperCanvas.appendChild(button);
		controls.classList.add("wrapper-bottom-section-hover");
		button.addEventListener("click", function() {
			struct.options.wrapper.classList.add("hidden");
			controls.classList.remove("wrapper-bottom-section-hover");
			button.remove();
			resolve();
		}, { once: true });
	});
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
	const path = "../svg/stick/state";
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
	if (struct.screen.game === undefined || struct.screen.game.running === 0)
		return ;
	if (event.key === "w" || event.key === "W")
	{
		struct.screen.sticks.keys.w = 1;
		if (struct.screen.sticks.keys.s === 0)
			struct.screen.sticks.left.src = "/svg/stick/up.svg";
		else
			struct.screen.sticks.left.src = "/svg/stick/state4.svg";
	}
	else if (event.key === "s" || event.key === "S")
	{
		struct.screen.sticks.keys.s = 1;
		if (struct.screen.sticks.keys.w === 0)
			struct.screen.sticks.left.src = "/svg/stick/down.svg";
		else
			struct.screen.sticks.left.src = "/svg/stick/state4.svg";
	}
	else if (event.key === "ArrowUp")
	{
		struct.screen.sticks.keys.up = 1;
		if (struct.screen.sticks.keys.down === 0)
			struct.screen.sticks.right.src = "/svg/stick/up.svg";
		else
			struct.screen.sticks.right.src = "/svg/stick/state4.svg";
	}
	else if (event.key === "ArrowDown")
	{
		struct.screen.sticks.keys.down = 1;
		if (struct.screen.sticks.keys.up === 0)
			struct.screen.sticks.right.src = "/svg/stick/down.svg";
		else
			struct.screen.sticks.right.src = "/svg/stick/state4.svg";
	}
}

function	disableStickMove(event, struct)
{
	if (struct.screen.game === undefined || struct.screen.game.running === 0)
		return ;
	if (event.key === "w" || event.key === "W")
	{
		struct.screen.sticks.keys.w = 0;
		struct.screen.sticks.left.src = "/svg/stick/state4.svg";
	}
	else if (event.key === "s" || event.key === "S")
	{
		struct.screen.sticks.keys.s = 0;
		struct.screen.sticks.left.src = "/svg/stick/state4.svg";
	}
	else if (event.key === "ArrowUp")
	{
		struct.screen.sticks.keys.up = 0;
		struct.screen.sticks.right.src = "/svg/stick/state4.svg";
	}
	else if (event.key === "ArrowDown")
	{
		struct.screen.sticks.keys.down = 0;
		struct.screen.sticks.right.src = "/svg/stick/state4.svg";
	}
}

async function	deactivateStick(sticks)
{
	const path = "../svg/stick/state";
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
	if (struct.tournament.on === false)
		return ;
	await waitTournamentForm(struct)
		.then(() => getTournamentNames(struct.tournament))
		.then(() => shuffle(struct.tournament.names))
		.then(() => showTournamentOverview(struct))
		.then(() => updateTournamentNames(struct, struct.screen.playerOnControls))
		.then(() => Promise.resolve())
		.catch((e) => Promise.reject(0))
}

async function	waitTournamentForm(struct)
{
	showScreen(struct.screen, struct.screen.wrapperTournamentForm);
	return new Promise((resolve, reject) => {
		function validate() {
			showScreen(struct.screen, struct.screen.wrapperCanvas);
			resolve();
		};
		function resetTournamentForm() {
			struct.tournament.on = false;
			struct.cards.gameSelector.classList.remove("zindex");
			struct.cards.screen.classList.add("zindex");
			struct.header.wrapper.classList.remove("zindex");
			showScreen(struct.screen, struct.screen.wrapperCanvas);
			struct.screen.wrapperTournamentForm.reset();
			reject();
		};
		struct.tournament.validate.addEventListener("click", validate, { once: true });
		struct.tournament.cancel.addEventListener("click", resetTournamentForm, { once: true });
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
	struct.gameForm.form.classList.add("hidden");
	struct.tournament.overview.classList.remove("hidden");
}

function	updateTournamentNames(struct, elements)
{
	let i;

	if (struct.tournament.matches === 3)
		i = 0;
	else if (struct.tournament.matches === 2)
		i = 2;
	if (struct.tournament.matches != 1)
	{
		elements[0].innerHTML = struct.tournament.names[i];
		elements[1].innerHTML = struct.tournament.names[i + 1];
	}
	else
	{
		elements[0].innerHTML = struct.tournament.winners[0].innerHTML;
		elements[1].innerHTML = struct.tournament.winners[1].innerHTML;
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
	if (struct.tournament.winners[0].dataset.decided === "tbd")
	{
		if (struct.screen.game.scores[0] > struct.screen.game.scores[1])
			struct.tournament.winners[0].innerHTML = struct.tournament.names[0];
		else
			struct.tournament.winners[0].innerHTML = struct.tournament.names[1];
		struct.tournament.winners[0].style.opacity = 1;
		struct.tournament.winners[0].setAttribute("data-decided", "yes");
	}
	else if (struct.tournament.winners[1].dataset.decided === "tbd")
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
	struct.gameForm.form.classList.remove("hidden");
	struct.tournament.overview.classList.add("hidden");
	struct.tournament.winners[0].setAttribute("data-decided", "tbd");
	struct.tournament.winners[1].setAttribute("data-decided", "tbd");
	struct.screen.playerOnControls[0].innerHTML = "";
	struct.screen.playerOnControls[1].innerHTML = "";
	alert("👑 " + winner + " 👑");
	struct.tournament = getTournamentStruct();
	resetInsertCoinButton(struct.gameForm.insertCoinButton);
	resetPhoneClasses(struct, struct.cards.gameSelector);
}
