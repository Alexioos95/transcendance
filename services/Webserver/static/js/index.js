"use strict";
/////////////////////////
// Script
/////////////////////////
checkJWT();

async function	checkJWT()
{
	await fetch("/user/checkJwt/")
		.then(response => {
			if (response.ok)
				return (response.json().then(data => { data.guestMode = "false"; navigate("game", data); }));
			else
				navigate("login", undefined);
		})
		.catch(() => console.error("Error: failed to fetch the checkJwt route"))
}

// window.onpopstate = function(event) {
// 	if (event.state)
// 	{
// 		if (event.state.login === true)
// 		{
// 			navigate("login")
// 				.then(() => launchPageScript("login", false, event.state.signUp))
// 				.catch((e) => console.log(e));
// 		}
// 		else if (event.state.game === true)
// 		{
// 			navigate("game")
// 				.then(() => launchPageScript("game", true, false))
// 				.catch((e) => console.log(e));
// 		}
// 	}
// };

async function navigate(page, data)
{
	const container = document.getElementsByTagName("body")[0];

	await fetch("/html/" + page + ".html")
		.then(response => response.text())
		.then(html => { container.innerHTML = html; })
		.then(() => {
			if (page === "game")
				run(data);
			else if (page === "login")
				login();
		})
		.catch(() => Promise.reject("Error: couldn't fetch the page"))
}
