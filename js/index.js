"use strict";
/////////////////////////
// Script
/////////////////////////
navigate("login");

async function navigate(page)
{
	const container = document.getElementsByTagName("body")[0];
	await fetch("/pages/" + page + ".html")
	.then(response => response.text())
		.then(html => { container.innerHTML = html; })
		.then(() => launchPageScript(page))
		.catch(() => console.error("couldn't fetch page for SPA"))
}

async function	launchPageScript(page)
{
	if (page == "game")
		run();
	else if (page == "login")
		login();
}
