/////////////////////////
// Script
/////////////////////////
gameSelectorForm();

function	gameSelectorForm()
{
	const button = document.getElementById("selector");
	button.addEventListener("click", function() { handler(button) });
}

function	sleep(ms) { return (new Promise(resolve => setTimeout(resolve, ms))); }

function	getCoin(button)
{
	const coin = document.createElement("div");
	coin.classList.add("coin");
	button.appendChild(coin);
	return (coin);
}

async function	handler(button)
{
	const prevCoin = document.getElementsByClassName("coin")[0];
	if (prevCoin !== undefined)
		return ;
	const coin = getCoin(button);
	const text = document.querySelectorAll("#selector span")[0];
	await sleep(50);
	await addAnimations(coin, text);
	await checkValidation(coin, text);
	button.removeChild(coin);
}

async function	addAnimations(coin, text)
{
	text.classList.add("active");
	coin.classList.add("active");
	await sleep(3000);
}

async function	rejectCoin(coin)
{
	coin.classList.add("fall");
	coin.classList.remove("active");
	await sleep(1000);
}

async function	checkValidation(coin, text)
{
	const form = document.querySelector(".wrapper-options form");
	const data = new FormData(form);
	const game = data.get("game");
	const mode = data.get("mode");
	if (game === null || mode === null)
		await rejectCoin(coin);
	else
	{
		await activateStick();
		await sleep(100);
		startPong();
	}
	text.classList.remove("active");
}

async function	activateStick()
{
	const sticks = document.getElementsByClassName("stick");
	const left = sticks[0];
	const right = sticks[1];
	const path = "../svg/stick/state";
	const extension = ".svg";

	for (let i = 0; i < 5; i++)
	{
		left.setAttribute("src", path + i + extension);
		right.setAttribute("src", path + i + extension);
		await sleep(50);
	}
}
