/////////////////////////
// Script
/////////////////////////
async function	run()
{
	const struct = {
		loginButton: document.getElementsByClassName("login-button")[0],
		coinButton: document.getElementById("selector"),
		sticks: getSticksStruct(),
		game: getPongStruct()
	};
	struct.loginButton.addEventListener("click", function() {
		if (struct.game.animationId !== undefined)
			cancelAnimationFrame(struct.game.animationId);
		navigate("login");
	});

	//event listener sir abandon =>struc met game running a false
	while (1)
	{
		//if (struct.game.running == false)
		await getFormStruct(struct)
			.then(() => coinAnimation(struct))
			.then(() => checkValidation(struct))
			.then(() => activateStick(struct))
			.then(() => sleep(150))
			.then(() => resetCoinButton(struct.coinButton))
			.then(() => struct.game.run(struct))
			.catch((e) => {
				if (e === 0)
					rejectCoin(struct);
			})
		//check si quelaue chose dns socket chat
		//si la partie finie tu remets running a false
	}
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

async function getFormStruct(struct) {
	return new Promise((resolve, reject) => {
		function handleClick() { resolve(); }
		struct.coinButton.addEventListener("click", handleClick, { once: true });
	});
}

/////////////////////////
// Game Selector Form
/////////////////////////
function	sleep(ms)
{ return new Promise(resolve => setTimeout(resolve, ms)); }

function	getCoin(button)
{
	const coin = document.createElement("div");
	coin.classList.add("coin");
	button.appendChild(coin);
	return (coin);
}

async function	coinAnimation(struct)
{
	if (document.getElementsByClassName("coin")[0] !== undefined)
		return new Promise ((resolve, reject) => { reject(undefined); });
	const coin = getCoin(struct.coinButton);
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
	return new Promise((resolve, reject) => {
		text.classList.add("active");
		coin.classList.add("active");
		resolve();
	});
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
		if (struct.game.animationId != -1)
		{
			cancelAnimationFrame(struct.game.animationId);
			struct.game = getPongStruct();
		}
		title.innerHTML = struct.game.name;
		return (resolve());
	});
}

async function	rejectCoin(struct)
{
	const coin = document.getElementsByClassName("coin")[0];
	coin.classList.add("fall");
	coin.classList.remove("active");
	await sleep(1000);
	resetCoinButton(struct.coinButton);
}

function	resetCoinButton(button)
{
	const text = document.querySelectorAll("#selector span")[0];
	const coin = document.getElementsByClassName("coin")[0];

	text.classList.remove("active")
	button.removeChild(coin);
}

async function	activateStick(struct)
{
	const wrapper = document.getElementsByClassName("wrapper-canvas")[0];
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
	wrapper.addEventListener("keydown", function(event) { enableStickMove(event, struct.sticks); });
	wrapper.addEventListener("keyup", function(event) { disableStickMove(event, struct.sticks); });
}

function	enableStickMove(event, sticks)
{
	if (event.key == "w" || event.key == "W")
	{
		sticks.keys.w = 1;
		if (sticks.keys.s == 0)
			sticks.left.src = "/svg/stick/up.svg";
		else
			sticks.left.src = "/svg/stick/state4.svg";
	}
	else if (event.key == "s" || event.key == "S")
	{
		sticks.keys.s = 1;
		if (sticks.keys.w == 0)
			sticks.left.src = "/svg/stick/down.svg";
		else
			sticks.left.src = "/svg/stick/state4.svg";
	}
	else if (event.key == "ArrowUp")
	{
		sticks.keys.up = 1;
		if (sticks.keys.down == 0)
			sticks.right.src = "/svg/stick/up.svg";
		else
			sticks.right.src = "/svg/stick/state4.svg";
	}
	else if (event.key == "ArrowDown")
	{
		sticks.keys.down = 1;
		if (sticks.keys.up == 0)
			sticks.right.src = "/svg/stick/down.svg";
		else
			sticks.right.src = "/svg/stick/state4.svg";
	}
}

function	disableStickMove(event, sticks)
{
	if (event.key == "w" || event.key == "W")
	{
		sticks.keys.w = 0;
		sticks.left.src = "/svg/stick/state4.svg";
	}
	else if (event.key == "s" || event.key == "S")
	{
		sticks.keys.s = 0;
		sticks.left.src = "/svg/stick/state4.svg";
	}
	else if (event.key == "ArrowUp")
	{
		sticks.keys.up = 0;
		sticks.right.src = "/svg/stick/state4.svg";
	}
	else if (event.key == "ArrowDown")
	{
		sticks.keys.down = 0;
		sticks.right.src = "/svg/stick/state4.svg";
	}
}

async function	deactivateStick(struct, sticks)
{
	const wrapper = document.getElementsByClassName("wrapper-canvas")[0];
	wrapper.outerHTML = wrapper.outerHTML;
	const canvas = document.getElementById("canvas");
	const ctx = canvas.getContext("2d");
	const path = "/svg/stick/state";
	const extension = ".svg";
	struct.canvas = canvas;
	struct.ctx = ctx;
	for (let i = 4; i > -1; i--)
	{
		sticks.left.src = path + i + extension;
		sticks.right.src = path + i + extension;
		await sleep(60);
	}
	sticks.left.setAttribute("data-active", "off");
	sticks.right.setAttribute("data-active", "off");
}
