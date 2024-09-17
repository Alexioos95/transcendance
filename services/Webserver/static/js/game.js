"use strict";
/////////////////////////
// Script
/////////////////////////
async function	run(data)
{
	const struct = {
		body: document.querySelector("body"),
		username: document.querySelector(".nav-user span"),
		header: getHeaderStruct(),
		cards: getCardsStruct(),
		gameForm: getGameFormStruct(),
		screen: getScreenStruct(),
		tournament: getTournamentStruct(),
		options: getOptionsStruct(),
		history: getHistoryStruct(),
		tabs: getTabsStruct(),
		chat: getChatStruct(),
		friend: getFriendStruct(),
		blocked: getBlockedStruct(),
		history: getHistoryStruct(),
		translation: getTranslationStruct(),
		guestMode: false,
		run: 1
	};
	setupEventListeners(struct, data);
	replaceDatas(struct, data);
	while (struct.run === 1)
	{
		await waitCoin(struct.gameForm)
			.then(() => coinAnimation(struct))
			.then(() => checkGameSelectorValidation(struct))
			.then(() => waitMatchMaking(struct))
			.then(() => setupTournament(struct))
			.then(() => launchGame(struct))
			.catch((e) => {
				if (e === 0)
					rejectCoin(struct.gameForm);
			});
	}
}

function	setupEventListeners(struct, data)
{
	// Accessibility CSS
	const labels = document.querySelectorAll("label > [type=\"radio\"]");

	labels.forEach((radio) => {
  		radio.addEventListener("focus", function() {
			if (radio.matches(":focus-visible"))
				radio.parentElement.style.outline = "1px black auto";
		});
		radio.addEventListener('blur', function() { radio.parentElement.style.outline = "none"; });
	});
	// Header Buttons
	struct.header.historyButton.addEventListener("click", function() { seeHistory(struct, undefined, struct.username.innerHTML); });
	struct.header.gameSelectorButton.addEventListener("click", function() { resetPhoneClasses(struct, struct.cards.gameSelector); });
	struct.header.chatButton.addEventListener("click", function() {
		resetPhoneClasses(struct, struct.cards.chat);
		resetHistoryClasses(struct);
		showTab(struct.tabs.chat, struct.tabs.friend);
	});
	struct.header.friendButton.addEventListener("click", function() {
		resetPhoneClasses(struct, struct.cards.chat);
		resetHistoryClasses(struct);
		showTab(struct.tabs.friend, struct.tabs.chat);
	});
	struct.header.optionButton.addEventListener("click", function() {
		resetPhoneClasses(struct, struct.cards.screen);
		showScreen(struct.screen, struct.screen.wrapperOptions)
	});
	struct.header.logoutButton.addEventListener("click", function() {
		struct.run = 0;
		if (struct.screen.game !== undefined)
			struct.screen.game.running = 0;
		if (struct.guestMode === true)
		{
			struct.run = 0;
			return (navigate("login", undefined, { signUp: "false", lang: struct.options.lang.curr }));
		}
		else
		{
			fetch("/user/disconnect/", { method: "GET", credentials: "include"})
				.then(() => {
					if (struct.chat.socket !== undefined)
						struct.chat.socket.close(1000);
				})
				.then(() => { return (navigate("login", undefined, { signUp: "false", lang: struct.options.lang.curr }))})
				.catch(() => console.error("Failed to fetch the disconnect route"));
		}
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
	struct.options.lang.fr.addEventListener("click", function() {
		fetchTranslation(struct, "FR");
		struct.options.lang.fr.classList.add("active");
		struct.options.lang.en.classList.remove("active");
		struct.options.lang.nl.classList.remove("active");
	});
	struct.options.lang.en.addEventListener("click", function() {
		fetchTranslation(struct, "EN");
		struct.options.lang.fr.classList.remove("active");
		struct.options.lang.en.classList.add("active");
		struct.options.lang.nl.classList.remove("active");
	});
	struct.options.lang.nl.addEventListener("click", function() {
		fetchTranslation(struct, "NL");
		struct.options.lang.fr.classList.remove("active");
		struct.options.lang.en.classList.remove("active");
		struct.options.lang.nl.classList.add("active");
	});
	// Tabs Account/Blocked
	struct.options.account.button.addEventListener("click", function() { showTab(struct.options.account, struct.options.blocked) });
	struct.options.account.showPasswords[0].addEventListener("click", function() {
		if (struct.options.account.passwords[0].type == "password")
			{
				struct.options.account.passwords[0].type = "text";
				struct.options.account.showPasswordsIcons[0].classList.remove("fa-eye-slash");
				struct.options.account.showPasswordsIcons[0].classList.add("fa-eye");
			}
			else
			{
				struct.options.account.passwords[0].type = "password";
				struct.options.account.showPasswordsIcons[0].classList.remove("fa-eye");
				struct.options.account.showPasswordsIcons[0].classList.add("fa-eye-slash");
			}
	});
	struct.options.account.showPasswords[1].addEventListener("click", function() {
		if (struct.options.account.passwords[1].type == "password")
			{
				struct.options.account.passwords[1].type = "text";
				struct.options.account.showPasswordsIcons[1].classList.remove("fa-eye-slash");
				struct.options.account.showPasswordsIcons[1].classList.add("fa-eye");
			}
			else
			{
				struct.options.account.passwords[1].type = "password";
				struct.options.account.showPasswordsIcons[1].classList.remove("fa-eye");
				struct.options.account.showPasswordsIcons[1].classList.add("fa-eye-slash");
			}
	});
	struct.options.account.twoFA.radios[0].addEventListener("change", function() {
		const obj = { type: "off" };

		fetch("/user/init2fa/", { method: "POST", body: JSON.stringify(obj), credentials: "include"})
			.then(response => response.json())
			.catch(() => console.error("Failed to fetch the init2fa route"));
		struct.options.account.twoFA.wrapper.classList.add("hidden");
	});
	struct.options.account.twoFA.radios[1].addEventListener("change", function() {
		const obj = { type: "email" };

		fetch("/user/init2fa/", { method: "POST", body: JSON.stringify(obj), credentials: "include"})
			.then(response => response.json())
			.then(data => {
				if (data.error === undefined)
					struct.options.account.twoFA.wrapper.classList.remove("hidden");
				else
					struct.options.account.error.innerHTML = data.error;
			})
			.catch(() => console.error("Failed to fetch the init2fa route"));
		struct.options.account.twoFA.wrapper.classList.remove("hidden");
	});
	struct.options.account.twoFA.button.addEventListener("click", function() {
		const obj = { type: struct.options.account.twoFA.input.value };

		fetch("/user/set2fa/", { method: "POST", body: JSON.stringify(obj), credentials: "include"})
			.then(response => response.json())
			.then(data => {
				if (data.error === undefined)
				{
					struct.options.account.error.classList.remove("error");
					struct.options.account.error.classList.add("success");
					struct.options.account.error.innerHTML = "SUCCESS";
				}
				else
				{
					struct.options.account.error.classList.remove("success");
					struct.options.account.error.classList.add("error");
					struct.options.account.error.innerHTML = "YIKES";
				}
			})
			.catch(() => console.error("Failed to fetch the set2fa route"));
	});
	struct.options.account.formSubmit.addEventListener("click", function(event) {
		event.preventDefault();

		const data = new FormData(struct.options.account.form);
		const avatarImage = document.getElementsByClassName("change-avatar")[0].files[0];
		const obj = {
			lang: data.get("lang"),
			username: data.get("options-username"),
			email: data.get("options-email"),
			passwordCurr: data.get("options-password-curr"),
			passwordNew: data.get("options-password-new"),
			twoFA: data.get("2fa")
		};
		if (avatarImage !== undefined)
		{
			const avatarForm = new FormData();

			avatarForm.append("file", avatarImage);
			fetch("/user/sendFile/", { method: "POST", body: avatarForm, credentials: "include"})
				.catch(e => {
					struct.options.account.error.classList.add("error");
					struct.options.account.error.classList.remove("success");
					struct.options.account.error.innerHTML = e;
					console.error("Failed to fetch the sendFile route")
					return ;
				});
		}
		fetch("/user/updateUserInfos/", { method: "POST", body: JSON.stringify(obj), credentials: "include"})
			.then(response => response.json())
			.then(data => {
				if (data.error === undefined)
				{
					struct.options.account.error.classList.remove("error");
					struct.options.account.error.classList.add("success");
					struct.options.account.error.innerHTML = "SUCCESS";
				}
				else
				{
					struct.options.account.error.classList.remove("success");
					struct.options.account.error.classList.add("error");
					struct.options.account.error.innerHTML = "YIKES";
				}
			})
			.catch(() => console.error("Failed to fetch the updateUserInfos route"));
	});
	struct.options.blocked.button.addEventListener("click", function() { showTab(struct.options.blocked, struct.options.account) });
	// Tabs Chat/Friend
	struct.tabs.chat.button.addEventListener("click", function() { showTab(struct.tabs.chat, struct.tabs.friend) });
	struct.tabs.friend.button.addEventListener("click", function() { showTab(struct.tabs.friend, struct.tabs.chat) });
	// Sticks
	struct.screen.wrapperCanvas.addEventListener("keydown", function(event) { enableStickMove(event, struct); });
	struct.screen.wrapperCanvas.addEventListener("keyup", function(event) { disableStickMove(event, struct); });
	struct.screen.wrapperCanvas.addEventListener("mousemove", function(event) { enableStickMove(event, struct); });
	struct.screen.wrapperCanvas.addEventListener("mouseup", function(event) { disableStickMove(event, struct); });
	// Game Mode
	struct.gameForm.inputs[0].addEventListener("change", function() {
		struct.screen.primaryPlayer.classList.remove("solo");
		struct.screen.secondaryPlayer.classList.remove("hidden");
	});
	struct.gameForm.inputs[1].addEventListener("change", function() {
		struct.screen.primaryPlayer.classList.remove("solo");
		struct.screen.secondaryPlayer.classList.remove("hidden");
	});
	struct.gameForm.inputs[2].addEventListener("change", function() {
		struct.screen.primaryPlayer.classList.add("solo");
		struct.screen.secondaryPlayer.classList.add("hidden");
	});
	// Chat
	if (data.guestMode === "false")
	{
		liveChat(struct);
		struct.friend.input.addEventListener("keydown", function(event) {
			if (event.key === "Enter")
			{
				event.preventDefault();
				addFriend(struct, undefined, struct.friend.input.value)
				struct.friend.input.value = "";
			}
		});
	}
	document.defaultView.addEventListener("resize", function() {
		const avatar = document.querySelector(".nav-user img");
		if ((struct.body.offsetHeight * 2) + (struct.body.offsetHeight / 2) < struct.body.offsetWidth)
		{
			struct.screen.wrapperDecorations.classList.add("hidden");
			struct.screen.wrapperScreen.classList.add("full");
		}
		else
		{
			struct.screen.wrapperDecorations.classList.remove("hidden");
			struct.screen.wrapperScreen.classList.remove("full");
		}
		if (avatar !== undefined)
			avatar.style.width = avatar.clientHeight + "px";
	});
}

function	replaceDatas(struct, data)
{
	fetchTranslation(struct, data.lang);
	struct.options.lang.curr = data.lang;
	if ((struct.body.offsetHeight * 2) + (struct.body.offsetHeight / 2) < struct.body.offsetWidth)
	{
		struct.screen.wrapperDecorations.classList.add("hidden");
		struct.screen.wrapperScreen.classList.add("full");
	}
	if (data.guestMode === "true")
		setGuestRestrictions(struct, data);
	else
	{
		const avatar = document.querySelector(".nav-user img");
		const inputs = document.querySelectorAll(".options-wrapper-connection input");

		if (data.avatar !== undefined && data.avatar !== "")
			avatar.src = data.avatar;
		else
			avatar.src = "/images/default_avatar.png";
		avatar.style.width = avatar.clientHeight + "px";
		struct.username.innerHTML = data.username;
		inputs[0].value = data.username;
		inputs[1].value = data.email;

		const myInterval = setInterval(() => {
			if (struct.run === 0)
				return (clearInterval(myInterval));
			fetch("/user/updateInfo/", { method: "GET", credentials: "include"})
				.then(response => response.json())
				.then(data => {
					if (data.error !== undefined || struct.run === 0)
						return (clearInterval(myInterval));
					// Re-build Avatar and Username
					if (data.avatar !== undefined && data.avatar !== "" && data.avatar !== avatar.src)
						avatar.src = data.avatar;
					if (struct.username.innerHTML !== data.username)
						struct.username.innerHTML = data.username;
					// Re-build Lists
					buildFriendlist(struct, data);
					buildBlocklist(struct, data);
					receiveInvitation(struct, data);
					acceptInvitation(struct, data);
				})
				.catch(() => console.error("Failed to fetch the updateInfo route"));
		}, 1000);
	}
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

function	alphabeticalSort(array)
{
	array.sort((a, b) => {
		nameA = a.getAttribute("data-user");
		nameB = b.getAttribute("data-user");

		if (nameA.toLowerCase() > nameB.toLowerCase())
			return (1);
		else if (nameA.toLowerCase() < nameB.toLowerCase())
			return (-1);
		return (0);
	});
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

function translationLoop(struct, items, structName, property)
{
	items.forEach((item, index) => {
		struct.translation[structName][index][property] = item;
	});
};

function translationTabOptionsLoop(element, tabOptions, translation)
{
	for (let i = 0; i < element.length; i++)
	{
		element[i].title = tabOptions[translation];
		element[i].ariaLabel = tabOptions[translation];
	}
};

function	createOptionButton(title, addClass, addClass2, child)
{
	const button = document.createElement("button");

	button.type = "button";
	button.title = title;
	button.ariaLabel = title;
	button.classList.add(addClass, addClass2);
	button.appendChild(child);
	return (button);
}

//////////////////////
// Re-building HTML
//////////////////////
function	buildFriendlist(struct, data)
{
	while (struct.friend.output.firstChild)
		struct.friend.output.firstChild.remove();
	if (data.friendList.length === 0)
		return ;

	const logged = [];
	const unlogged = [];
	let array;

	if (struct.options.lang.curr === "FR")
		array = ["Voir l'historique", "Inviter pour un Pong", "Retirer de la liste d'amis"];
	else if (struct.options.lang.curr === "EN")
		array = ["See history", "Invite for a Pong", "Remove from friendlist"];
	else if (struct.options.lang.curr === "NL")
		array = ["Zie geschiedenis", "Uitnodigen voor Pong", "Van vriendenlijst verwijderen"];
	for (let i = 0; i < data.friendList.length; i++)
	{
		// Create elements
		const tr = document.createElement("tr");
		const td = document.createElement("td");
		const friendCard = document.createElement("div");
		const avatarWrapper = document.createElement("div");
		const img = document.createElement("img");
		const friendUser = document.createElement("div");
		const usernameWrapper = document.createElement("div");
		const username = document.createElement("span");
		const statusIcon = document.createElement("i");
		const friendOption = document.createElement("div");
		const i1 = document.createElement("i");
		const i2 = document.createElement("i");
		const i3 = document.createElement("i");

		// Set avatar
		if (data.friendList[i].avatar !== undefined && data.friendList[i].avatar != "")
			img.src = data.friendList[i].avatar;
		else
			img.src = "/images/default_avatar.png";
		img.alt = "Avatar";
		// Set username and status
		username.innerHTML = data.friendList[i].username;
		let status = "online";
		if (data.friendList[i].online === "false")
			status = "offline";
		statusIcon.classList.add("fa-solid", "fa-circle-dot", status);
		statusIcon.title = status;
		// Add classes;
		avatarWrapper.classList.add("friend-user-avatar");
		friendUser.classList.add("friend-user");
		friendCard.classList.add("friend-card");
		// Friend Options
		i1.classList.add("fa-solid", "fa-clock-rotate-left");
		i2.classList.add("fa-solid", "fa-table-tennis-paddle-ball");
		i3.classList.add("fa-solid", "fa-user-minus");
		const button1 = createOptionButton(array[0], "hover-purple", "seeHistory", i1);
		const button2 = createOptionButton(array[1], "hover-blue", "invitePong", i2);
		const button3 = createOptionButton(array[2], "hover-red", "removeFriend", i3);
		button1.addEventListener("click", function() { seeHistory(struct, button1, undefined); });
		button2.addEventListener("click", function() { sendInvite(struct, button2); });
		button3.addEventListener("click", function() { deleteFriend(button3); });
		// Append
		avatarWrapper.appendChild(img);
		usernameWrapper.appendChild(username);
		usernameWrapper.appendChild(statusIcon);
		friendOption.appendChild(button1);
		friendOption.appendChild(button2);
		friendOption.appendChild(button3);
		friendUser.appendChild(usernameWrapper);
		friendUser.appendChild(friendOption);
		friendCard.appendChild(avatarWrapper);
		friendCard.appendChild(friendUser);
		td.appendChild(friendCard);
		td.tabIndex = "0";
		tr.appendChild(td);
		tr.setAttribute("data-user", data.friendList[i].username);
		// Push
		if (status === "online")
			logged.push(tr);
		else
			unlogged.push(tr);
	}
	alphabeticalSort(logged);
	alphabeticalSort(unlogged);
	for (let i = 0; i < logged.length; i++)
		struct.friend.output.appendChild(logged[i]);
	for (let i = 0; i < unlogged.length; i++)
		struct.friend.output.appendChild(unlogged[i]);
}

function	buildBlocklist(struct, data)
{
	let word;
	let array = [];

	while (struct.blocked.output.firstChild)
		struct.blocked.output.firstChild.remove();
	if (data.blockList.length === 0)
		return ;
	if (struct.options.lang.curr === "FR")
		word = "Debloquer";
	else if (struct.options.lang.curr === "EN")
		word = "Unblock";
	else if (struct.options.lang.curr === "NL")
		word = "Deblokkeren";
	for (let i = 0; i < data.blockList.length; i++)
	{
		// Create elements
		const tr = document.createElement("tr");
		const td = document.createElement("td");
		const blockedCard = document.createElement("div");
		const avatarWrapper = document.createElement("div");
		const img = document.createElement("img");
		const blockedUser = document.createElement("div");
		const username = document.createElement("span");
		const button = document.createElement("button");
		const icon = document.createElement("i");
		const span = document.createElement("span");

		// Set avatar
		img.src = data.blockList[i].avatar;
		img.alt = "Avatar";
		// Set username
		username.innerHTML = data.blockList[i].username;
		// Set button
		icon.classList.add("fa-solid", "fa-square-minus");
		span.innerHTML = word;
		span.classList.add("removeBlock");
		button.appendChild(icon);
		button.appendChild(document.createTextNode("\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t"));
		button.appendChild(span);
		button.addEventListener("click", function() { deleteBlocked(button); });
		// Add classes
		blockedCard.classList.add("blocked-card");
		avatarWrapper.classList.add("blocked-user-avatar");
		blockedUser.classList.add("blocked-user");
		// Append
		avatarWrapper.appendChild(img);
		blockedUser.appendChild(username);
		blockedUser.appendChild(button);
		blockedCard.appendChild(avatarWrapper);
		blockedCard.appendChild(blockedUser);
		td.append(blockedCard);
		td.tabIndex = "0";
		tr.append(td);
		tr.setAttribute("data-user", data.blockList[i].username);
		array.push(tr);
	}
	alphabeticalSort(array);
	for (let i = 0; i < array.length; i++)
		struct.blocked.output.appendChild(array[i]);
}

function	buildHistory(struct, data, username)
{
	let array = [];

	struct.history.username.innerHTML = username;
	while (struct.history.output.firstChild)
		struct.history.output.firstChild.remove();
	for (let i = 0; i < data.matches.length; i++)
	{
		// Create elements
		const tr = document.createElement("tr");
		const td = document.createElement("td");
		const historyCard = document.createElement("div");
		const historyCardGame = document.createElement("div");
		const historyCardText = document.createElement("div");
		const username1 = document.createElement("span");
		const score1 = document.createElement("span");
		const bar = document.createElement("div");
		const username2 = document.createElement("span");
		const score2 = document.createElement("span");
		const date = document.createElement("span");
		const dateFormat = new Date(data.matches[i].date);
		// Bools
		let status = "history-card-win";
		let game = "history-card-pong";

		if (data.matches[i].winner !== username)
			status = "history-card-lose";
		if (data.matches[i].game !== "pong")
			status = "history-card-tetris";
		// Datas
		username1.innerHTML = data.matches[i].username1;
		score1.innerHTML = data.matches[i].score1;
		username2.innerHTML = data.matches[i].username2;
		score2.innerHTML = data.matches[i].score2;
		// Date
		let day;
		let month;

		day = dateFormat.getDate();
		month = dateFormat.getMonth() + 1;
		if (day < 10)
			day = "0" + day;
		if (month < 10)
			month = "0" + month;
		if (struct.options.lang.curr === "FR")
			date.innerHTML = day + "/" + month + "/" + dateFormat.getFullYear();
		else
			date.innerHTML = month + "/" + day + "/" + dateFormat.getFullYear();
		// Add classes
		historyCard.classList.add("history-card", status);
		historyCardGame.classList.add("history-card-game", game);
		historyCardText.classList.add("history-card-text");
		bar.classList.add("bar");
		date.classList.add("history-card-date");
		// Append
		historyCardText.appendChild(username1);
		historyCardText.appendChild(score1);
		historyCardText.appendChild(bar);
		historyCardText.appendChild(username2);
		historyCardText.appendChild(score2);
		historyCard.appendChild(historyCardGame);
		historyCard.appendChild(historyCardText);
		historyCard.appendChild(date);
		td.appendChild(historyCard);
		td.tabIndex = "0";
		tr.appendChild(td);
		array.push(tr);
	}
	for (let i = array.length - 1; i >= 0; i--)
		struct.history.output.appendChild(array[i]);
}

async function	setGuestRestrictions(struct)
{
	const historyIcon = document.querySelectorAll("header .fa-clock-rotate-left")[0];
	const lockIcon = document.querySelectorAll(".tab-tabs .fa-lock")[0];
	const hideForGuest = document.getElementsByClassName("hide-for-guest");
	const avatar = document.querySelector(".nav-user img");
	const inputs = document.querySelectorAll(".mode-selector input");

	if (struct.options.lang.curr === "FR")
		struct.username.innerHTML = "Invité";
	else if (struct.options.lang.curr === "EN")
		struct.username.innerHTML = "Guest";
	else if (struct.options.lang.curr === "NL")
		struct.username.innerHTML = "Gast";
	avatar.src = "/images/default_avatar.png";
	avatar.style.width = avatar.clientHeight + "px";
	inputs[2].disabled = true;
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
	struct.guestMode = true;
}

async function	translateGamePage(struct, obj, currLang)
{
	struct.options.lang.curr = currLang;
	const plainTexts = Object.values(obj.plainText);
	const placeHolders = Object.values(obj.placeholder);
	const titles = Object.values(obj.title);
	const ariaLabels = Object.values(obj.ariaLabel);
	const tabOptions = Object.values(obj.tabOptions)
	const friendButtons = document.getElementsByClassName("addFriend");
	const rmFriendButtons = document.getElementsByClassName("removeFriend");
	const historyButtons = document.getElementsByClassName("seeHistory");
	const inviteButtons = document.getElementsByClassName("invitePong");
	const blockButtons = document.getElementsByClassName("addBlock");
	const rmBlockButtons = document.getElementsByClassName("removeBlock");

	translationLoop(struct, plainTexts, "txt", "innerHTML");
	translationLoop(struct, placeHolders, "pholder", "placeholder");
	translationLoop(struct, titles, "title", "title");
	translationLoop(struct, ariaLabels, "ariaLabel", "ariaLabel");
	translationTabOptionsLoop(friendButtons, tabOptions, 0);
	translationTabOptionsLoop(rmFriendButtons, tabOptions, 1);
	translationTabOptionsLoop(historyButtons, tabOptions, 2);
	translationTabOptionsLoop(inviteButtons, tabOptions, 3);
	translationTabOptionsLoop(blockButtons, tabOptions, 4);
	for (let i = 0; i < rmBlockButtons.length; i++)
		rmBlockButtons[i].innerHTML = tabOptions[5];
	updateTournamentMarkers(struct, false);
}

//////////////////////////
// Tabs Options Fetches
//////////////////////////
function	addFriend(struct, button, usernameInput)
{
	let username;

	if (usernameInput === undefined)
		username = button.parentElement.parentElement.querySelector("span").innerHTML;
	else
		username = usernameInput;
	const obj = { newFriend: username };

	fetch("/user/addFriend/", { method: "POST", body: JSON.stringify(obj), credentials: "include"})
		.then(response => response.json())
		.then(data => {
			const tr = document.createElement("tr");
			const td = document.createElement("td");
			const p = document.createElement("p");
			let isScrolled = false;

			p.classList.add("chat-announcement");
			if (data.error === undefined)
				p.innerHTML = "Added to friend";
			else
				p.innerHTML = "Failed to add to friend";
			if (parseInt(struct.tabs.chat.table.scrollTop, 10) === struct.tabs.chat.table.scrollHeight - struct.tabs.chat.table.offsetHeight)
				isScrolled = true;
			td.appendChild(p);
			td.tabIndex = "0";
			tr.appendChild(td);
			struct.chat.output.appendChild(tr);
			if (isScrolled === true && struct.tabs.chat.table.classList.contains("active"))
				struct.tabs.chat.table.scrollTop = struct.tabs.chat.table.scrollHeight;
			if (data.error !== undefined && username === usernameInput)
			{
				struct.tabs.wrapperInputs.classList.add("in-error");
				sleep(1000)
					.then(() => { struct.tabs.wrapperInputs.classList.remove("in-error"); });
			}
		})
		.catch(() => console.error("Failed to fetch the addFriend route"));
}

function	deleteFriend(button)
{
	const username = button.parentElement.parentElement.querySelector("span").innerHTML;
	const obj = { unfriend: username };

	fetch("/user/deleteFriend/", { method: "POST", body: JSON.stringify(obj), credentials: "include"})
		.catch(() => console.error("Failed to fetch the deleteFriend route"));
}

function	seeHistory(struct, button, own)
{
	let username;

	if (own !== undefined)
		username = own;
	else
		username = button.parentElement.parentElement.querySelector("span").innerHTML;
	const obj = { seeHistory: username };

	fetch("/user/seeHistory/", { method: "POST", body: JSON.stringify(obj), credentials: "include"})
		.then(response => response.json())
		.then(data => {
			if (data.error === undefined)
			{
				resetPhoneClasses(struct, struct.cards.chat);
				struct.tabs.wrapperTabs.classList.add("hidden");
				struct.tabs.wrapperInputs.classList.add("zindex");
				struct.history.wrapper.classList.remove("zindex", "hidden");
				buildHistory(struct, data, username);
			}
			else
			{
				const tr = document.createElement("tr");
				const td = document.createElement("td");
				const p = document.createElement("p");

				p.classList.add("chat-announcement");
				p.innerHTML = "Failed to see history of user";
				td.appendChild(p);
				td.tabIndex = "0";
				tr.appendChild(td);
				struct.chat.output.appendChild(tr);
			}
		})
		.catch(() => console.error("Failed to fetch the seeHistory route"));
}

function	sendInvite(struct, button)
{
	const username = button.parentElement.parentElement.querySelector("span").innerHTML;
	const obj = { toChallenge: username };

	fetch("/user/sendInvitation/", { method: "POST", body: JSON.stringify(obj), credentials: "include"})
		.then(response => response.json())
		.then(data => {
			const tr = document.createElement("tr");
			const td = document.createElement("td");
			const p = document.createElement("p");
			let isScrolled = false;

			p.classList.add("chat-announcement");
			if (data.error === undefined)
				p.innerHTML = "Challenged user!";
			else
				p.innerHTML = "Failed to challenge user";
			if (parseInt(struct.tabs.chat.table.scrollTop, 10) === struct.tabs.chat.table.scrollHeight - struct.tabs.chat.table.offsetHeight)
				isScrolled = true;
			td.appendChild(p);
			td.tabIndex = "0";
			tr.appendChild(td);
			struct.chat.output.appendChild(tr);
			if (isScrolled === true && struct.tabs.chat.table.classList.contains("active"))
				struct.tabs.chat.table.scrollTop = struct.tabs.chat.table.scrollHeight;
		})
		.catch(() => console.error("Failed to fetch the sendInvitation route"));
}

function	blockUser(struct, button)
{
	const username = button.parentElement.parentElement.querySelector("span").innerHTML;
	const obj = { toBlock: username };

	fetch("/user/blockUser/", { method: "POST", body: JSON.stringify(obj), credentials: "include"})
		.then(response => response.json())
		.then(data => {
			const tr = document.createElement("tr");
			const td = document.createElement("td");
			const p = document.createElement("p");
			let isScrolled = false;

			p.classList.add("chat-announcement");
			if (data.error === undefined)
				p.innerHTML = "Added to blocked";
			else
				p.innerHTML = "Failed to block user";
			if (parseInt(struct.tabs.chat.table.scrollTop, 10) === struct.tabs.chat.table.scrollHeight - struct.tabs.chat.table.offsetHeight)
				isScrolled = true;
			td.appendChild(p);
			td.tabIndex = "0";
			tr.appendChild(td);
			struct.chat.output.appendChild(tr);
			if (isScrolled === true && struct.tabs.chat.table.classList.contains("active"))
				struct.tabs.chat.table.scrollTop = struct.tabs.chat.table.scrollHeight;
		})
		.catch(() => console.error("Failed to fetch the blockUser route"));
}

function	deleteBlocked(button)
{
	const username = button.parentElement.querySelector("span").innerHTML;
	const obj = { unblock: username };

	fetch("/user/deleteBlockedUser/", { method: "POST", body: JSON.stringify(obj), credentials: "include"})
		.catch(() => console.error("Failed to fetch the deleteBlockedUser route"));
}

/////////////////////////
// Live Chat
/////////////////////////
function	liveChat(struct)
{
	struct.chat.socket = new WebSocket("wss://" + window.location.hostname + ":4433/ws/chat/");
	struct.chat.socket.addEventListener("error", function() {
		const tr = document.querySelectorAll(".tab-chat tr");
		const buttons = document.querySelectorAll(".tab-chat button");
		const lock = document.getElementsByClassName("tab-chat-lock")[0];

		struct.tabs.chat.input.classList.add("hidden");
		if (tr !== undefined)
		{
			for (let i = 1; i < tr.length; i++)
				tr[i].style.opacity = 0.5;
		}
		if (buttons !== undefined)
		{
			for (let i = 0; i < buttons.length; i++)
				buttons[i].disabled = true;
		}
		lock.classList.remove("hidden");
	});
	struct.chat.socket.addEventListener("message", function(event) {
		const data = JSON.parse(event.data);

		if (data.type === "connected")
			return ;
		const tr = createChatMessage(struct, data);
		let isScrolled = false;

		if (parseInt(struct.tabs.chat.table.scrollTop, 10) === struct.tabs.chat.table.scrollHeight - struct.tabs.chat.table.offsetHeight)
			isScrolled = true;
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

function	createChatMessage(struct, data)
{
	// Create elements
	const tr = document.createElement("tr");
	const td = document.createElement("td");
	const chatMessage = document.createElement("div");
	const chatUserAvatar = document.createElement("div");
	const avatar = document.createElement("img");
	const p = document.createElement("p");
	const span = document.createElement("span");
	const text = document.createTextNode(": " + data.message);
	const chatOptions = document.createElement("div");
	const i1 = document.createElement("i");
	const i2 = document.createElement("i");
	const i3 = document.createElement("i");
	const i4 = document.createElement("i");
	let options = true;
	let array;

	// Get lang
	if (struct.options.lang.curr === "FR")
		array = ["Ajouter en ami", "Voir l'historique", "Inviter pour un Pong", "Bloquer l'utilisateur"];
	else if (struct.options.lang.curr === "EN")
		array = ["Add to friendlist", "See history", "Invite for a Pong", "Block the user"];
	else if (struct.options.lang.curr === "NL")
		array = ["Aan vriendenlijst toevoegen", "Zie geschiedenis", "Uitnodigen voor Pong", "Gebruiker blokkeren"];
	// Set avatar
	if (data.avatar !== undefined && data.avatar !== "")
		avatar.src = data.avatar;
	else
		avatar.src = "/images/default_avatar.png"
	avatar.alt = "Avatar";
	chatUserAvatar.classList.add("chat-user-avatar");
	chatUserAvatar.appendChild(avatar);
	// Set username
	if (struct.username.innerHTML === data.user)
		options = false;
	span.innerHTML = data.user;
	p.appendChild(span);
	p.appendChild(text);
	// Set message
	chatMessage.classList.add("chat-message");
	chatMessage.appendChild(chatUserAvatar);
	chatMessage.appendChild(p);
	// Set buttons
	if (options === true)
	{
		i1.classList.add("fa-solid", "fa-user-plus");
		i2.classList.add("fa-solid", "fa-clock-rotate-left");
		i3.classList.add("fa-solid", "fa-table-tennis-paddle-ball");
		i4.classList.add("fa-solid", "fa-circle-xmark");
		const button1 = createOptionButton(array[0], "hover-green", "addFriend", i1);
		const button2 = createOptionButton(array[1], "hover-purple", "seeHistory", i2);
		const button3 = createOptionButton(array[2], "hover-blue", "invitePong", i3);
		const button4 = createOptionButton(array[3], "hover-red", "addBlock", i4);
		button1.addEventListener("click", function() { addFriend(struct, button1, undefined); });
		button2.addEventListener("click", function() { seeHistory(struct, button2, undefined); });
		button3.addEventListener("click", function() { sendInvite(struct, button3); });
		button4.addEventListener("click", function() { blockUser(struct, button4); });
		// Append
		chatOptions.appendChild(button1);
		chatOptions.appendChild(document.createTextNode("\n\t\t\t\t\t\t\t\t\t\t"));
		chatOptions.appendChild(button2);
		chatOptions.appendChild(document.createTextNode("\n\t\t\t\t\t\t\t\t\t\t"));
		chatOptions.appendChild(button3);
		chatOptions.appendChild(document.createTextNode("\n\t\t\t\t\t\t\t\t\t\t"));
		chatOptions.appendChild(button4);
		chatOptions.classList.add("chat-options");
	}
	// Append
	td.appendChild(chatMessage);
	if (options === true)
		td.appendChild(chatOptions);
	td.tabIndex = "0";
	tr.appendChild(td);
	return (tr);
}

function	receiveInvitation(struct, data)
{
	if (data.challengeReceived.username === undefined || data.challengeReceived.username.length === 0)
		return ;

	let accept = "Accepter";
	let sentence = " vous a invite pour un Pong ";
	let isScrolled = false;

	// Lang
	if (struct.options.lang.curr === "EN")
	{
		sentence = " invited you to a Pong ";
		accept = "Accept";
	}
	else if (struct.options.lang.curr === "NL")
	{
		sentence = " je uitgenodigd voor een Pong ";
		accept = "Accepteren";
	}
	if (parseInt(struct.tabs.chat.table.scrollTop, 10) === struct.tabs.chat.table.scrollHeight - struct.tabs.chat.table.offsetHeight)
		isScrolled = true;
	for (let i = 0; i < data.challengeReceived.username.length; i++)
	{
		// Create elements
		const tr = document.createElement("tr");
		const td = document.createElement("td");
		const button = document.createElement("button");
		const p = document.createElement("p");
		const span = document.createElement("span");
		const text = document.createTextNode(sentence);
		const icon = document.createElement("i");
		// Set button
		button.type = "button";
		button.title = accept;
		button.ariaLabel = accept;
		button.classList.add("button-challenge");
		button.addEventListener("click", function() {
			const obj = { username: button.querySelector("p span").innerHTML };

			fetch("/user/acceptInvitation/", { method: "POST", body: JSON.stringify(obj), credentials: "include"})
				.then(response => response.json())
				.then(data => {
					if (data.error === undefined)
					{
						if (struct.screen.game !== undefined)
							struct.screen.game.running = 0;
						coinAnimation(struct)
							.then(() => {
								clearCanvas(struct.screen.wrapperCanvas);
								showScreen(struct.screen, struct.screen.wrapperCanvas)
								resetPhoneClasses(struct);
							})
							.then(() => {
								struct.screen.game = getPongStruct();
								struct.screen.primaryPlayer.classList.add("solo");
								struct.screen.secondaryPlayer.classList.add("hidden");
								struct.screen.game.online = true;
								struct.screen.game.run(struct);
							});
					}
				})
				.catch(() => console.error("Failed to fetch the acceptInvitation route"));
		});
		span.innerHTML = data.challengeReceived.username[i];
		icon.classList.add("fa-solid", "fa-check");
		// Append
		p.appendChild(span);
		p.appendChild(text);
		p.appendChild(icon);
		p.classList.add("chat-announcement", "chat-challenge");
		button.appendChild(p);
		td.appendChild(button);
		td.appendChild(button);
		td.tabIndex = "0";
		tr.appendChild(td);
		struct.chat.output.appendChild(tr);
	}
	if (isScrolled === true && struct.tabs.chat.table.classList.contains("active"))
		struct.tabs.chat.table.scrollTop = struct.tabs.chat.table.scrollHeight;
}

function	acceptInvitation(struct, data)
{
	if (data.challengeAccepted.username === "")
		return ;
	if (struct.screen.game !== undefined)
		struct.screen.game.running = 0;
	coinAnimation(struct)
		.then(() => {
			clearCanvas(struct.screen.wrapperCanvas);
			showScreen(struct.screen, struct.screen.wrapperCanvas)
			resetPhoneClasses(struct);
		})
		.then(() => {
			struct.screen.game = getPongStruct();
			struct.screen.primaryPlayer.classList.add("solo");
			struct.screen.secondaryPlayer.classList.add("hidden");
			struct.screen.game.online = true;
			struct.screen.game.run(struct);
		});
}

//////////////////
// Get(?)Struct
//////////////////
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
		wrapperScreen: document.getElementsByClassName("wrapper-screen-all")[0],
		wrapperCanvas: document.getElementsByClassName("wrapper-canvas")[0],
		wrapperOptions: document.getElementsByClassName("wrapper-options")[0],
		wrapperTournamentForm: document.getElementsByClassName("tournament-form")[0],
		wrapperDecorations: document.getElementsByClassName("wrapper-bottom-section")[0],
		primaryPlayer: document.getElementsByClassName("wrapper-player-controls")[1],
		secondaryPlayer: document.getElementsByClassName("wrapper-player-controls")[0],
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
		markerArray: [[0, 2, 3], [1, 2, 3], [4, 0, 3], [4, 1, 3], [4, 4, 0], [4, 4, 1], [4, 4, 4]],
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
	const input = document.querySelector(".twofa-set-div input");
	const button = document.querySelector(".twofa-set-div button");

	const twoFAStruct = {
		radios: document.querySelectorAll(".twofa-label input"),
		wrapper: document.getElementsByClassName("twofa-set-div")[0],
		input: input,
		button: button,
	};
	const accountStruct = {
		button: buttons[0],
		table: document.getElementsByClassName("wrapper-options-forms")[0],
		form: document.getElementsByClassName("options-form")[0],
		twoFA: twoFAStruct,
		passwords: document.getElementsByClassName("options-password"),
		showPasswords: document.getElementsByClassName("show-password"),
		showPasswordsIcons: document.querySelectorAll(".show-password i"),
		error: document.getElementsByClassName("error-update")[0],
		formSubmit: document.getElementsByClassName("options-save")[0]
	};
	const blockedStruct = {
		button: buttons[1],
		table: document.getElementsByClassName("wrapper-blocked")[0]
	};
	const langStruct = {
		curr: "FR",
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
		leaveButton: document.querySelector(".wrapper-history button"),
		username: document.querySelector(".wrapper-history h3"),
		output: document.querySelector(".tab-history tbody")
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

function	getFriendStruct()
{
	const textareas = document.querySelectorAll(".wrapper-inputs textarea");
	const friendOutput = document.querySelector(".tab-friends tbody")

	const struct = {
		output: friendOutput,
		input: textareas[1],
	};
	return (struct);
}

function	getBlockedStruct()
{
	const struct = { output: document.querySelector(".wrapper-blocked tbody") };
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
	coin.classList.add("active");
	text.classList.add("active");
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

		if (game === null || mode === null || (game === "tetris" && game === "online"))
			return (reject(0));
		else if (game === "pong")
			struct.screen.game = getPongStruct();
		else if (game === "tetris")
			struct.screen.game = getTetrisStruct();
		setupGameControls(struct, game);
		title.style.opacity = 0;
		sleep(350)
			.then(() => title.style.opacity = 1)
			.then(() => title.innerHTML = struct.screen.game.name)
		clearCanvas(struct.screen.wrapperCanvas);
		showScreen(struct.screen, struct.screen.wrapperCanvas);
		resetPhoneClasses(struct);
		struct.header.wrapper.classList.add("zindex");
		struct.options.wrapper.classList.add("hidden");
		struct.cards.screen.classList.remove("zindex");
		if (mode === "tournament")
			struct.tournament.on = true;
		else if (mode === "online")
			struct.screen.game.online = true;
		resolve();
	});
}

async function waitMatchMaking(struct)
{
	if (struct.screen.game.online === true)
	{
		return new Promise((resolve, reject) => {
			const myInterval = setInterval(() => {
				fetch("/user/matchMaking/", { method: "GET", credentials: "include"})
					.then(response => response.json())
					.then(data => {
						if (data.matched === "true")
						{
							clearInterval(myInterval);
							resolve();
						}
					})
					.catch(() => console.error("Failed to fetch the matchMaking route"));
			}, 5000);
		});
	}
}

async function	waitGoButton(struct)
{
	if (struct.screen.game.online === true)
		return ;
	return new Promise((resolve, reject) => {
		const button = document.createElement("button");
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
		struct.screen.wrapperDecorations.classList.add("wrapper-bottom-section-hover");
		button.addEventListener("click", function() {
			struct.options.wrapper.classList.add("hidden");
			struct.screen.wrapperDecorations.classList.remove("wrapper-bottom-section-hover");
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

	if (text !== undefined)
		text.classList.remove("active")
	if (button !== undefined && coin !== undefined)
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

	if (struct.options.lang.curr === "FR")
		array = struct.tournament.markerArrayStringsFR;
	else if (struct.options.lang.curr === "EN")
		array = struct.tournament.markerArrayStringsEN;
	else if (struct.options.lang.curr === "NL")
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
