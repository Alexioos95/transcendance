"use strict";
/////////////////////////
// Script
/////////////////////////
async function	run(guestMode)
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
		chat: getChatStruct(),
		translation: getTranslationStruct(),
		run: 1
	};
	setupEventListeners(struct, guestMode);
	if (guestMode === true)
		setGuestRestrictions(struct);
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
	}
}

function	setupEventListeners(struct, guestMode)
{
	// Header Buttons
	struct.header.historyButton.addEventListener("click", function() {
		resetPhoneClasses(struct, struct.cards.chat);
		struct.tabs.wrapperTabs.classList.add("hidden");
		struct.tabs.wrapperInputs.classList.add("zindex");
		struct.history.wrapper.classList.remove("zindex", "hidden");
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
		if (struct.chat.socket !== undefined)
			struct.chat.socket.close(1000);
		navigate("login")
			.then(() => launchPageScript("login", false, false))
			.then(() => {
				if (guestMode === true)
					window.history.pushState({ login: true, signUp: false, game: false }, null, "");
			})
			.catch((e) => console.error(e));
	});
	// Cross Buttons
	struct.options.leaveButton.addEventListener("click", function() {
		if (struct.tournament.on === true && struct.tournament.names.length === 0)
			showScreen(struct.screen, struct.screen.wrapperTournamentForm);
		else
			showScreen(struct.screen, struct.screen.wrapperCanvas);
	});
	struct.history.leaveButton.addEventListener("click", function() { resetHistoryClasses(struct); });
	// Lang
	struct.options.lang.fr.addEventListener("click", function() { fetchTranslation(struct, "fr") });
	struct.options.lang.en.addEventListener("click", function() { fetchTranslation(struct, "en") });
	struct.options.lang.nl.addEventListener("click", function() { fetchTranslation(struct, "nl") });
	// Tabs Account/Blocked
	struct.options.account.button.addEventListener("click", function() { showTab(struct.options.account, struct.options.blocked) });
	struct.options.blocked.button.addEventListener("click", function() { showTab(struct.options.blocked, struct.options.account) });
	// Tabs Chat/Friend
	struct.tabs.chat.button.addEventListener("click", function() { showTab(struct.tabs.chat, struct.tabs.friend) });
	struct.tabs.friend.button.addEventListener("click", function() { showTab(struct.tabs.friend, struct.tabs.chat) });
	// Sticks
	struct.screen.wrapperCanvas.addEventListener("keydown", function(event) { enableStickMove(event, struct); });
	struct.screen.wrapperCanvas.addEventListener("keyup", function(event) { disableStickMove(event, struct); });
	struct.screen.wrapperCanvas.addEventListener("mousemove", function(event) { enableStickMove(event, struct); });
	struct.screen.wrapperCanvas.addEventListener("mouseup", function(event) { disableStickMove(event, struct); });
	// Chat
	if (guestMode === false)
		liveChat(struct);
}

function	liveChat(struct)
{
	struct.chat.socket = new WebSocket("ws://made-f0ar12s1:8000/ws/chat/");
	struct.chat.socket.addEventListener("error", function() {
		const tr = document.querySelectorAll(".tab-chat tr");
		const buttons = document.querySelector(".tab-chat button");
		const lock = document.getElementsByClassName("tab-chat-lock")[0];

		struct.tabs.chat.input.classList.add("hidden");
		for (let i = 1; i < tr.length; i++)
			tr[i].style.opacity = 0.5;
		for (let i = 0; i < buttons.length; i++)
			buttons[i].disabled = true;
		lock.classList.remove("hidden");
	});
	struct.chat.socket.addEventListener("message", function(event) {
		const tr = document.createElement("tr");
		const td = document.createElement("td");
		const chatMessage = document.createElement("div");
		const chatUserAvatar = document.createElement("div");
		const avatar = document.createElement("img");
		const p = document.createElement("p");
		const span = document.createElement("span");
		const text = document.createTextNode(": " + JSON.parse(event.data).message);
		const chatOptions = document.createElement("div");
		const i1 = document.createElement("i");
		const i2 = document.createElement("i");
		const i3 = document.createElement("i");
		const i4 = document.createElement("i");
		let isScrolled = false;

		avatar.src = "/default_avatar.png";
		avatar.alt = "Avatar";
		span.innerHTML = "USERNAME";
		p.appendChild(span);
		p.appendChild(text);
		chatUserAvatar.classList.add("chat-user-avatar");
		chatUserAvatar.appendChild(avatar);
		chatMessage.classList.add("chat-message");
		chatMessage.appendChild(chatUserAvatar);
		chatMessage.appendChild(p);
		i1.classList.add("fa-solid", "fa-user-plus");
		i2.classList.add("fa-solid", "fa-clock-rotate-left");
		i3.classList.add("fa-solid", "fa-table-tennis-paddle-ball");
		i4.classList.add("fa-solid", "fa-circle-xmark");
		chatOptions.appendChild(createChatButton("Ajouter en ami", "hover-green", i1));
		chatOptions.appendChild(createChatButton("Voir l'historique", "hover-purple", i2));
		chatOptions.appendChild(createChatButton("Inviter pour un Pong", "hover-blue", i3));
		chatOptions.appendChild(createChatButton("Bloquer l'utilisateur", "hover-red", i4));
		chatOptions.classList.add("chat-options");
		td.appendChild(chatMessage);
		td.appendChild(chatOptions);
		td.tabIndex = "0";
		if (struct.tabs.chat.table.scrollTop === struct.tabs.chat.table.scrollHeight - struct.tabs.chat.table.offsetHeight)
			isScrolled = true;
		tr.appendChild(td);
		struct.chat.output.appendChild(tr);
		if (isScrolled === true && struct.tabs.chat.table.classList.contains("active"))
			struct.tabs.chat.table.scrollTop = struct.tabs.chat.table.scrollHeight;
	});
	struct.chat.input.addEventListener("keydown", function(event) {
		if (event.key === "Enter")
		{
			event.preventDefault();
			if (struct.chat.input.value.trim() !== "")
			{
				struct.chat.socket.send(JSON.stringify({ "message": struct.chat.input.value }));
				struct.chat.input.value = "";
			}
		}
	});
}

async function	launchGame(struct)
{
	if (struct.tournament.on === false)
	{
		await waitGoButton(struct)
			.then(() => activateStick(struct))
			.then(() => struct.screen.game.run(struct));
	}
	else
	{
		await waitGoButton(struct)
			.then(() => clearCanvas(struct.screen.wrapperCanvas))
			.then(() => activateStick(struct))
			.then(() => updateTournamentMarkers(struct, true))
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
		updateTournamentMarkers(struct, true);
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
	struct.history.wrapper.classList.add("zindex", "hidden");
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
	show.button.classList.add("active");
	show.table.classList.add("active");
	if (show.input !== undefined)
		show.input.classList.add("active");
}

function	showScreen(struct, show)
{
	struct.wrapperCanvas.classList.add("hidden");
	struct.wrapperTournamentForm.classList.add("hidden");
	struct.wrapperOptions.classList.add("hidden");
	show.classList.remove("hidden");
}

function	fetchTranslation(struct, lang)
{
	if (struct.options.lang.curr !== lang)
	{
		fetch("/lang/" + lang + ".json")
			.then(response => response.json())
			.then(result => { translateGamePage(struct, result, lang); })
			.catch(() => { console.error("Error: couldn't translate the page"); });
	}
}
async function	translateGamePage(struct, obj, currLang)
{
	struct.options.lang.curr = currLang;
	let plainTexts = Object.values(obj.plainText);
	let placeHolders = Object.values(obj.placeholder);
	let titles = Object.values(obj.title);
	let ariaLabels = Object.values(obj.ariaLabel);
	let i = 0;

	for (let text of plainTexts)
	{
		struct.translation.txt[i].innerHTML = text;
		i++;
	}
	i = 0;
	for (let placeholder of placeHolders)
	{
		struct.translation.pholder[i].placeholder = placeholder;
		i++;
	}
	i = 0;
	for (let title of titles)
	{
		struct.translation.title[i].title = title;
		i++;
	}
	i = 0;
	for (let ariaLabel of ariaLabels)
	{
		struct.translation.ariaLabel[i].ariaLabel = ariaLabel;
		i++;
	}
	updateTournamentMarkers(struct, false);
}

async function	setGuestRestrictions(struct)
{
	const historyIcon = document.querySelectorAll("header .fa-clock-rotate-left")[0];
	const lockIcon = document.querySelectorAll(".tab-tabs .fa-lock")[0];
	const hideForGuest = document.getElementsByClassName("hide-for-guest");

	historyIcon.classList.add("hidden");
	for (let i = 0; i < 3; i++)
		hideForGuest[i].classList.add("hidden");
	lockIcon.classList.remove("hidden");
	struct.header.historyButton.title = "";
	struct.header.historyButton.disabled = true;
	struct.header.historyButton.style.cursor = "default";
	struct.tabs.chat.input.classList.add("hidden");
	struct.tabs.chat.table.classList.add("hidden");
	struct.tabs.friend.input.classList.add("hidden");
	struct.tabs.friend.table.classList.add("hidden");
}

function	createChatButton(title, addClass, child)
{
	const button = document.createElement("button");

	button.type = "button";
	button.title = title;
	button.classList.add(addClass);
	button.appendChild(child);
	return (button);
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
		keys: document.getElementsByClassName("key"),
		playerOnControls: document.getElementsByClassName("playername"),
		game: undefined
	};
	return (struct);
}

function	getSticksStruct()
{
	const elements = document.getElementsByClassName("stick");
	const struct = {
		keys: { w: 0, s: 0, up: 0, down: 0, mouseLeft: 0, mouseRight:0 },
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
		markerArray: [[0, 2, 3], [1, 2, 3], [4, 0, 3], [4, 1, 3], [4, 4, 0], [4, 4, 1], [4, 4, 4]], // 0 = WAITING, 1 = ONGOING, 2 = NEXT, 3 = SOON, 4 = "" (Finished);
		markerArrayStringsFR: ["EN ATTENTE", "EN COURS", "SUIVANT", "PROCHAINEMENT", ""],
		markerArrayStringsEN: ["WAITING", "ONGOING", "NEXT", "SOON", ""],
		markerArrayStringsNL: ["WACHTEND", "DOORLOPEND", "VOLGENDE", "BINNENKORT", ""],
		names: [],
		matches: 3
	};
	return (struct);
}

function	getOptionsStruct()
{
	const buttons = document.querySelectorAll(".wrapper-options-buttons button");
	const labels = document.getElementsByClassName("lang-label");

	const accountStruct = {
		button: buttons[0],
		table: document.getElementsByClassName("wrapper-options-forms")[0]
	};
	const blockedStruct = {
		button: buttons[1],
		table: document.getElementsByClassName("wrapper-blocked")[0]
	};
	const langStruct = {
		curr: "fr",
		fr: labels[0],
		en: labels[1],
		nl: labels[2]
	};
	const struct = {
		wrapper: document.getElementsByClassName("wrapper-options")[0],
		leaveButton: document.querySelector(".wrapper-options .cross-button"),
		account: accountStruct,
		blocked: blockedStruct,
		lang: langStruct
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
		input: inputs[0],
	};
	const friendStruct = {
		button: buttons[1],
		table: tables[1],
		input: inputs[1],
	};
	const struct = {
		wrapperTabs: document.getElementsByClassName("wrapper-tabs")[0],
		wrapperInputs: document.getElementsByClassName("wrapper-inputs")[0],
		chat: chatStruct,
		friend: friendStruct
	};
	return (struct);
}

function	getChatStruct()
{
	const textareas = document.querySelectorAll(".wrapper-inputs textarea");
	const chatOutput = document.querySelector(".tab-chat tbody")

	const struct = {
		output: chatOutput,
		input: textareas[0],
		socket: undefined
	};
	return (struct);
}

function	getTranslationStruct()
{
	const struct = {
		txt: document.getElementsByClassName("translate-txt"),
		pholder: document.getElementsByClassName("translate-pholder"),
		title: document.getElementsByClassName("translate-title"),
		ariaLabel: document.getElementsByClassName("translate-aria-label")
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
	await sleep(2500);
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
		else if (game === "tetris")
			struct.screen.game = getTetrisStruct();
		setupGameControls(struct, game);
		title.style.opacity = 0;
		sleep(350)
			.then(() => title.style.opacity = 1)
			.then(() => title.innerHTML = struct.screen.game.name)
		if (mode === "tournament")
			struct.tournament.on = true;
		else if (mode === "online")
			struct.screen.game.online = true;
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
	const coin = document.getElementsByClassName("coin")[0];

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
// Controls
/////////////////////////
function	setupGameControls(struct, game)
{
	if (game === "pong")
	{
		struct.screen.keys[0].innerHTML = "";
		struct.screen.keys[1].innerHTML = "";
		struct.screen.keys[2].innerHTML = "W";
		struct.screen.keys[3].innerHTML = "";
		struct.screen.keys[4].innerHTML = "";
		struct.screen.keys[5].innerHTML = "S";
		struct.screen.keys[6].innerHTML = "";
		struct.screen.keys[7].innerHTML = "";
		struct.screen.keys[8].innerHTML = "<i class=\"fa-solid fa-arrow-up\"></i>";
		struct.screen.keys[9].innerHTML = "";
		struct.screen.keys[10].innerHTML = "";
		struct.screen.keys[11].innerHTML = "<i class=\"fa-solid fa-arrow-down\"></i>";
	}
	else if (game === "tetris")
	{
		struct.screen.keys[0].innerHTML = "";
		struct.screen.keys[1].innerHTML = "";
		struct.screen.keys[2].innerHTML = "";
		struct.screen.keys[3].innerHTML = "";
		struct.screen.keys[4].innerHTML = "";
		struct.screen.keys[5].innerHTML = "";
		struct.screen.keys[6].innerHTML = "";
		struct.screen.keys[7].innerHTML = "";
		struct.screen.keys[8].innerHTML = "";
		struct.screen.keys[9].innerHTML = "";
		struct.screen.keys[10].innerHTML = "";
		struct.screen.keys[11].innerHTML = "";
	}
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
	if (event.type === "keydown")
	{
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
	else if (event.type === "mousemove")
	{
		if (struct.screen.game.paddles && struct.screen.game.paddles.left.mouse === 1)
		{
			if (struct.screen.game.paddles.left.move_top === 1)
			{
				struct.screen.sticks.keys.down = 0;
				struct.screen.sticks.keys.up = 1;
				struct.screen.sticks.keys.mouseLeft = 1;
				struct.screen.sticks.left.src = "/svg/stick/up.svg";
			}
			else if (struct.screen.game.paddles.left.move_bot === 1)
			{
				struct.screen.sticks.keys.up = 0;
				struct.screen.sticks.keys.down = 1;
				struct.screen.sticks.keys.mouseLeft = 1;
				struct.screen.sticks.left.src = "/svg/stick/down.svg";
			}
		}
		else if (struct.screen.game.paddles && struct.screen.game.paddles.right.mouse === 1)
		{
			if (struct.screen.game.paddles.right.move_top === 1)
			{
				struct.screen.sticks.keys.down = 0;
				struct.screen.sticks.keys.up = 1;
				struct.screen.sticks.keys.mouseRight = 1;
				struct.screen.sticks.right.src = "/svg/stick/up.svg";
			}
			else if (struct.screen.game.paddles.right.move_bot === 1)
			{
				struct.screen.sticks.keys.up = 0;
				struct.screen.sticks.keys.down = 1;
				struct.screen.sticks.keys.mouseRight = 1;
				struct.screen.sticks.right.src = "/svg/stick/down.svg";
			}
		}
	}
}

function	disableStickMove(event, struct)
{
	if (struct.screen.game === undefined || struct.screen.game.running === 0)
		return ;
	if (event.type === "keyup")
	{
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
	else if (event.type === "mouseup")
	{
		if (struct.screen.sticks.keys.mouseLeft === 1)
		{
			struct.screen.sticks.keys.mouseLeft = 0;
			struct.screen.sticks.keys.up = 0;
			struct.screen.sticks.keys.down = 0;
			struct.screen.sticks.left.src = "/svg/stick/state4.svg";
		}
		else if (struct.screen.sticks.keys.mouseRight === 1)
		{
			struct.screen.sticks.keys.mouseRight = 0;
			struct.screen.sticks.keys.up = 0;
			struct.screen.sticks.keys.down = 0;
			struct.screen.sticks.right.src = "/svg/stick/state4.svg";
		}
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
	for (let i = 0; i < 4; i++)
		struct.tournament.players[i].innerHTML = struct.tournament.names[i];
	for (let i = 0; i < 2; i++)
	{
		struct.tournament.winners[i].innerHTML = "-";
		struct.tournament.winners[i].style.opacity = 0;
	}
	struct.gameForm.form.classList.add("hidden");
	struct.tournament.overview.classList.remove("hidden");
	updateTournamentMarkers(struct, true);
}

function	updateTournamentNames(struct, elements)
{
	if (struct.tournament.matches !== 1)
	{
		let i;

		if (struct.tournament.matches === 3)
			i = 0;
		else if (struct.tournament.matches === 2)
			i = 2;
		elements[0].innerHTML = struct.tournament.names[i];
		elements[1].innerHTML = struct.tournament.names[i + 1];
	}
	else
	{
		elements[0].innerHTML = struct.tournament.winners[0].innerHTML;
		elements[1].innerHTML = struct.tournament.winners[1].innerHTML;
	}
}

function	updateTournamentMarkers(struct, shift)
{
	let array;

	if (struct.options.lang.curr === "fr")
		array = struct.tournament.markerArrayStringsFR;
	else if (struct.options.lang.curr === "en")
		array = struct.tournament.markerArrayStringsEN;
	else if (struct.options.lang.curr === "nl")
		array = struct.tournament.markerArrayStringsNL;
	for (let i = 0; i < 3; i++)
		struct.tournament.markers[i].innerHTML = array[struct.tournament.markerArray[0][i]];
	if (shift === true)
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
