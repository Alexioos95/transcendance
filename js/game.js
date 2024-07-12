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
		tournament: getTournamentStruct(),
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
		title.innerHTML = struct.game.name;
		return (resolve());
	});
}

async function	setupTournament(struct)
{
	if (struct.tournament.on == false || struct.game.name == "tetris")
		return ;
	showTournamentForm();
	completeTournamentStruct(struct.tournament);
	await waitTournamentForm(struct)
		.then(() => addNamesToTournamentStruct(struct.tournament))
		.then(() => createMatches(struct.tournament))













}

async function	rejectCoin(struct)
{
	const coin = document.getElementsByClassName("coin")[0];
	coin.classList.add("fall");
	coin.classList.remove("active");
	await sleep(1000);
	resetinsertCoinButton(struct.insertCoinButton);
}

function	resetinsertCoinButton(button)
{
	const text = document.querySelectorAll("#selector span")[0];
	const coin = document.getElementsByClassName("coin")[0];
	text.classList.remove("active")
	button.removeChild(coin);
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

	for (let i = 0; i < 5; i++)
	{
		struct.sticks.left.src = path + i + extension;
		struct.sticks.right.src = path + i + extension;
		await sleep(60);
	}
	struct.sticks.left.setAttribute("data-active", "on");
	struct.sticks.right.setAttribute("data-active", "on");
	await sleep(150);
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

async function	endGame(struct)
{
	resetinsertCoinButton(struct.insertCoinButton);
	await deactivateStick(struct.sticks);
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
	sticks.left.setAttribute("data-active", "off");
	sticks.right.setAttribute("data-active", "off");
}

/////////////////////////
// Tournament
/////////////////////////
function	getTournamentStruct()
{
	const struct = {
		on: false,
		cancel: undefined,
		validate: undefined,
		names: [],
		matches: []
	};
	return (struct);
}

function	showTournamentForm()
{
	const form = document.getElementsByClassName("tournament-form")[0];
	form.classList.remove("hidden");
}

function	completeTournamentStruct(struct)
{
	struct.cancel = document.getElementsByTagName("tournament-form hidden i");
	struct.validate = document.getElementsByTagName("tournament-form button");
}

async function	waitTournamentForm(struct)
{
	return new Promise((resolve, reject) => {
		function handleClick() { resolve(); }
		struct.validate.addEventListener("click", handleClick, { once: true });
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
	struct.tournament.names = names;
}

async function	createMatches(struct)
{
	let match;
	shuffle(struct.names);

	match = [struct.names[0], struct.names[1]];
	struct.matches.push(match);
	match = [struct.names[2], struct.names[3]];
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
