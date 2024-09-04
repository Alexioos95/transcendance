"use strict";
/////////////////////////
// Script
/////////////////////////
checkJWT();

async function	checkJWT()
{
	// PING ALL MODULES
	await fetch("/user/checkJwt/")
		.then(response => {
			if (response.ok)
			{
				console.log(response.json());
				navigate("game")
					.then(() => launchPageScript("game", false, null)); // Envoy JSON
			}
			else
			{
				console.log(response.status);
				console.log(response.text());
				navigate("login")
					.then(() => launchPageScript("login", false, null))
					.catch((e) => console.log(e));
			}
		})
		.catch(() => console.error("Error: failed to fetch the checkJwt route"))
}

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
	await fetch("/html/" + page + ".html")
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
