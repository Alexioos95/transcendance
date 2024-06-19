/////////////////////////
// Game selector form
/////////////////////////
gameSelectorForm();

function	gameSelectorForm()
{
	const button = document.getElementById("selector");
	button.addEventListener("click", function() {
		const prevCoin = document.getElementsByClassName("coin")[0];
		if (prevCoin !== undefined)
			return ;
		const coin = getCoin(button);
		const text = document.querySelectorAll("#selector span")[0];
		setTimeout(() => handler(button, coin, text), 50);
	});
}

function	sleep(ms) { return (new Promise(resolve => setTimeout(resolve, ms))); }

function	getCoin(button)
{
	const coin = document.createElement("div");
	coin.classList.add("coin");
	button.appendChild(coin);
	return (coin);
}

async function	handler(button, coin, text)
{
	await addAnimations(coin, text);
	await checkValidation(button, coin, text);
	button.removeChild(coin);
}

async function	addAnimations(coin, text)
{
	text.classList.add("active");
	coin.classList.add("active");
	await sleep(4250);
}

async function	rejectCoin(coin, text)
{
	coin.classList.add("fall");
	coin.classList.remove("active");
	await sleep(1000);
}

async function	checkValidation(button, coin, text)
{
	const form = document.querySelector(".wrapper-options form");
	const data = new FormData(form);
	const game = data.get("game");
	const mode = data.get("mode");
	if (game === null || mode === null)
		await rejectCoin(coin, text);
	else
	{
		await sleep(1000);
		startPong();
	}
	text.classList.remove("active");
}
