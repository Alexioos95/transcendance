/////////////////////////
// Game selector form
/////////////////////////
gameSelectorForm();

function	gameSelectorForm()
{
	const button = document.getElementById("selector");

	button.addEventListener("click", function() {
		coinAnimation();
	});
}

function	coinAnimation()
{
	const text = document.querySelectorAll("#selector span")[0];
	const coin = document.getElementsByClassName("coin")[0];
	text.style.opacity = 0;
	text.style.animation = "none";
	coin.style.transition = "margin 3s ease";
	coin.classList.add("active");
	setTimeout(() => {
		checkValidation(coin, text);
	}, 2500);
}

function	removeCoinAnimation(coin, text)
{
	console.log("CALL");
	// coin.classList.remove("active");
	coin.classList.add("fall");
}

function	restoreCoinAnimation(coin, text)
{
	coin.style.transition = "none";
	coin.classList.remove("active");
	text.style.opacity = 1;
	text.style.animation = "fade 3s infinite";
}

function	checkValidation(coin, text)
{
	const form = document.querySelector(".wrapper-options form");
	const data = new FormData(form);
	const game = data.get("game");
	const mode = data.get("mode");
	console.log(data);
	console.log(game);
	console.log(mode);
	if (game === null || mode === null)
	{
		removeCoinAnimation(coin, text);
		// restoreCoinAnimation(coin, text);
	}
	else
	{
		restoreCoinAnimation(coin, text);
		startPong();
		restoreCoinAnimation(coin, text);
	}
}
