/////////////////////////
// Script
/////////////////////////
async function	run()
{
	const struct = {
		loginButton: document.getElementsByClassName("login-button")[0],
		insertCoinButton: document.getElementById("selector"),
		wrapperCanvas: document.getElementsByClassName("wrapper-canvas")[0],
		sticks: getSticksStruct(),
		game: undefined,
		tournament: undefined,
		run: 1
	};
	struct.loginButton.addEventListener("click", function() {
		struct.run = 0;
		navigate("login");
	});
	// addEventListener abandonButton => stopper le jeu;
	struct.wrapperCanvas.addEventListener("keydown", function(event) { enableStickMove(event, struct); });
	struct.wrapperCanvas.addEventListener("keyup", function(event) { disableStickMove(event, struct); });
	while (struct.run == 1)
	{
		struct.tournament = getTournamentStruct();
		await waitCoin(struct)
			.then(() => coinAnimation(struct))
			.then(() => checkValidation(struct))
			.then(() => setupTournament(struct))
			.then(() => activateStick(struct))
			.then(() => struct.game.run(struct))
			.catch((e) => {
				if (e === 0)
					rejectCoin(struct);
			});
		// Faire un await pour le chat (?);
	}
}

function	sleep(ms)
{ return new Promise(resolve => setTimeout(resolve, ms)); }

/////////////////////////
// Game Selector Form
/////////////////////////
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
	const coin = getCoin(struct.insertCoinButton);
	const text = document.querySelectorAll("#selector span")[0];
	return new Promise ((resolve, reject) => {
		sleep(50)
			.then(() => addAnimations(coin, text))
			.then(() => sleep(3100))
			.then(() => resolve())
	});
}

async function	addAnimations(coin, text)
{
	text.classList.add("active");
	coin.classList.add("active");
}

async function	checkValidation(struct, data)
{
	return new Promise((resolve, reject) => {
		const form = document.querySelector(".wrapper-options form");
		const data = new FormData(form);
		const game = data.get("game");
		const mode = data.get("mode");
		const title = document.getElementsByTagName("h2")[0];

		if (game === null || mode === null)
			return (reject(0));
		if (game == "pong")
			struct.game = getPongStruct();
		// else if (game == "tetris")
			// struct.game = getTetrisStruct();
		if (mode == "tournament")
			struct.tournament.on = true;
		title.style.opacity = 0;
		sleep(450)
			.then(() => title.style.opacity = 1)
			.then(() => title.innerHTML = struct.game.name)
		while (struct.wrapperCanvas.lastChild.nodeName != "FORM")
			struct.wrapperCanvas.removeChild(struct.wrapperCanvas.lastChild);
		return (resolve());
	});
}

async function	setupTournament(struct)
{
	if (struct.tournament.on == false)
		return ;
	await waitTournamentForm(struct.tournament)
		.then(() => addNamesToTournamentStruct(struct.tournament))
		.then(() => createMatches(struct.tournament))
		.catch((e) => Promise.reject(0))
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
	const text = document.querySelectorAll("#selector span")[0];
	const coin = document.getElementsByClassName("coin")[0];
	text.classList.remove("active")
	button.removeChild(coin);
}

async function	endGame(struct)
{
	resetInsertCoinButton(struct.insertCoinButton);
	await deactivateStick(struct.sticks);
}

/////////////////////////
// Sticks
/////////////////////////
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

async function	activateStick(struct)
{
	const path = "/svg/stick/state";
	const extension = ".svg";

	await sleep(450);
	for (let i = 0; i < 5; i++)
	{
		struct.sticks.left.src = path + i + extension;
		struct.sticks.right.src = path + i + extension;
		await sleep(60);
	}
	await sleep(500);
}

function	enableStickMove(event, struct)
{
	if (struct.game.running == 0)
		return ;
	if (event.key == "w" || event.key == "W")
	{
		struct.sticks.keys.w = 1;
		if (struct.sticks.keys.s == 0)
			struct.sticks.left.src = "/svg/stick/up.svg";
		else
			struct.sticks.left.src = "/svg/stick/state4.svg";
	}
	else if (event.key == "s" || event.key == "S")
	{
		struct.sticks.keys.s = 1;
		if (struct.sticks.keys.w == 0)
			struct.sticks.left.src = "/svg/stick/down.svg";
		else
			struct.sticks.left.src = "/svg/stick/state4.svg";
	}
	else if (event.key == "ArrowUp")
	{
		struct.sticks.keys.up = 1;
		if (struct.sticks.keys.down == 0)
			struct.sticks.right.src = "/svg/stick/up.svg";
		else
			struct.sticks.right.src = "/svg/stick/state4.svg";
	}
	else if (event.key == "ArrowDown")
	{
		struct.sticks.keys.down = 1;
		if (struct.sticks.keys.up == 0)
			struct.sticks.right.src = "/svg/stick/down.svg";
		else
			struct.sticks.right.src = "/svg/stick/state4.svg";
	}
}

function	disableStickMove(event, struct)
{
	if (struct.game.running == 0)
		return ;
	if (event.key == "w" || event.key == "W")
	{
		struct.sticks.keys.w = 0;
		struct.sticks.left.src = "/svg/stick/state4.svg";
	}
	else if (event.key == "s" || event.key == "S")
	{
		struct.sticks.keys.s = 0;
		struct.sticks.left.src = "/svg/stick/state4.svg";
	}
	else if (event.key == "ArrowUp")
	{
		struct.sticks.keys.up = 0;
		struct.sticks.right.src = "/svg/stick/state4.svg";
	}
	else if (event.key == "ArrowDown")
	{
		struct.sticks.keys.down = 0;
		struct.sticks.right.src = "/svg/stick/state4.svg";
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
function	getTournamentStruct()
{
	const struct = {
		on: false,
		cancel: document.querySelector(".tournament-form .fa-circle-arrow-left"),
		validate: document.querySelector(".tournament-form button"),
		names: [],
		matches: []
	};
	return (struct);
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

async function	addNamesToTournamentStruct(struct)
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

async function	createMatches(struct)
{
	let match;
	shuffle(struct.names);

	match = [struct.names[0], struct.names[1]];
	struct.matches.push(match);
	match = [struct.names[2], struct.names[3]];
	struct.matches.push(match);
	match = [];
	struct.matches.push(match);
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
