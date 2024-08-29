"use strict";
/////////////////////////
// Script
/////////////////////////
navigate("login")
	.then(() => window.history.replaceState( { login: true, signUp: false, game: false } , null, ""))
	.then(() => launchPageScript("login", false, null))
	.catch((e) => console.log(e));

window.onpopstate = function(event) {
	if (event.state)
	{
		if (event.state.login === true)
		{
			navigate("login")
				.then(() => launchPageScript("login", false, event.state.signUp))
				.catch((e) => console.log(e));
		}
		else if (event.state.game === true)
		{
			navigate("game")
				.then(() => launchPageScript("game", true, false))
				.catch((e) => console.log(e));
		}
	}
};

async function navigate(page)
{
	const container = document.getElementsByTagName("body")[0];
	await fetch("/pages/" + page + ".html")
		.then(response => response.text())
		.then(html => { container.innerHTML = html; })
		.catch(() => Promise.reject("Error: couldn't fetch the page"))
}

async function	launchPageScript(page, guestMode, signUpMode)
{
	if (page === "game")
		run(guestMode);
	else if (page === "login")
		login(signUpMode);
}
