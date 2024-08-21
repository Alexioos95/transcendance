"use strict";
/////////////////////////
// Script
/////////////////////////
navigate("login")
	.then(() => launchPageScript("login", false))
	.catch((e) => console.log(e));

async function navigate(page)
{
	const container = document.getElementsByTagName("body")[0];
	await fetch("/pages/" + page + ".html")
		.then(response => response.text())
		.then(html => { container.innerHTML = html; })
		.catch(() => Promise.reject("Error: couldn't fetch the page"))
}

async function	launchPageScript(page, guestMode)
{
	if (page === "game")
		run(guestMode);
	else if (page === "login")
		login();
}
