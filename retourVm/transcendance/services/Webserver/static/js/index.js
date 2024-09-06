"use strict";
/////////////////////////
// Script
/////////////////////////
checkJWT();

async function	checkJWT()
{
	await fetch("http://made-f0br7s18:7000/user/checkJwt/")
		.then(response => {
			if (response.ok)
			{
				console.log("response /user/checkJwt ok; navigate to Game");
				return (response.json().then(data => { navigate("game", data); }));
			}
			else
			{
				console.log("response /user/checkJwt not good; navigate to login");
				console.log("response.status=", response.status);
				console.log("response.text=", response.text());
				navigate("login", undefined);
			}
		})
		// .catch(() => console.error("Error: failed to fetch the checkJwt route"))
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
		.then(() => { launchPageScript(page, data) })
		.catch(() => Promise.reject("Error: couldn't fetch the page"))
}

async function	launchPageScript(page, data)
{
	if (page === "game")
		run(data);
	else if (page === "login")
		login();
}
