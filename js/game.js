/////////////////////////
// Script
/////////////////////////
gameSelectorForm();

function	gameSelectorForm()
{
	const button = document.getElementById("selector");
	const elements = document.getElementsByClassName("stick");
	let keys = {
		w: 0,
		s: 0,
		up: 0,
		down: 0
	};
	const sticks = {
		left: elements[0],
		right: elements[1],
		keys: keys
	};
	button.addEventListener("click", function() { handler(button, sticks) });
}

function	sleep(ms) { return (new Promise(resolve => setTimeout(resolve, ms))); }

function	getCoin(button)
{
	const coin = document.createElement("div");
	coin.classList.add("coin");
	button.appendChild(coin);
	return (coin);
}

async function	handler(button, sticks)
{
	const prevCoin = document.getElementsByClassName("coin")[0];
	if (prevCoin !== undefined)
		return ;
	const coin = getCoin(button);
	const text = document.querySelectorAll("#selector span")[0];
	await sleep(50);
	await addAnimations(coin, text);
	await checkValidation(coin, text, sticks);
	button.removeChild(coin);
}

async function	addAnimations(coin, text)
{
	text.classList.add("active");
	coin.classList.add("active");
	await sleep(3100);
}

async function	checkValidation(coin, text, sticks)
{
	const form = document.querySelector(".wrapper-options form");
	const data = new FormData(form);
	const game = data.get("game");
	const mode = data.get("mode");
	if (game === null || mode === null)
		await rejectCoin(coin);
	else
	{
		await activateStick(sticks);
		await sleep(150);
		startPong();
	}
	text.classList.remove("active");
}

async function	rejectCoin(coin)
{
	coin.classList.add("fall");
	coin.classList.remove("active");
	await sleep(1000);
}

async function	activateStick(sticks)
{
	const canvas = document.getElementById("canvas");
	const path = "/svg/stick/state";
	const extension = ".svg";

	for (let i = 0; i < 5; i++)
	{
		sticks.left.setAttribute("src", path + i + extension);
		sticks.right.setAttribute("src", path + i + extension);
		await sleep(60);
	}
	canvas.addEventListener("keydown", function(event) { enableStickMove(event, sticks); });
	canvas.addEventListener("keyup", function(event) { disableStickMove(event, sticks); });
}

function	enableStickMove(event, sticks)
{
	if (event.key == "w" || event.key == "W")
	{
		sticks.keys.w = 1;
		if (sticks.keys.s == 0)
			sticks.left.setAttribute("src", "/svg/stick/up.svg");
		else
			sticks.left.setAttribute("src", "/svg/stick/state4.svg");
	}
	else if (event.key == "s" || event.key == "S")
	{
		sticks.keys.s = 1;
		if (sticks.keys.w == 0)
			sticks.left.setAttribute("src", "/svg/stick/down.svg");
		else
			sticks.left.setAttribute("src", "/svg/stick/state4.svg");
	}
	else if (event.key == "ArrowUp")
	{
		sticks.keys.up = 1;
		if (sticks.keys.down == 0)
			sticks.right.setAttribute("src", "/svg/stick/up.svg");
		else
			sticks.right.setAttribute("src", "/svg/stick/state4.svg");
	}
	else if (event.key == "ArrowDown")
	{
		sticks.keys.down = 1;
		if (sticks.keys.up == 0)
			sticks.right.setAttribute("src", "/svg/stick/down.svg");
		else
			sticks.right.setAttribute("src", "/svg/stick/state4.svg");
	}
}

function	disableStickMove(event, sticks)
{
	if (event.key == "w" || event.key == "W")
	{
		sticks.keys.w = 0;
		sticks.left.setAttribute("src", "/svg/stick/state4.svg");
	}
	else if (event.key == "s" || event.key == "S")
	{
		sticks.keys.s = 0;
		sticks.left.setAttribute("src", "/svg/stick/state4.svg");
	}
	else if (event.key == "ArrowUp")
	{
		sticks.keys.up = 0;
		sticks.right.setAttribute("src", "/svg/stick/state4.svg");
	}
	else if (event.key == "ArrowDown")
	{
		sticks.keys.down = 0;
		sticks.right.setAttribute("src", "/svg/stick/state4.svg");
	}
}
