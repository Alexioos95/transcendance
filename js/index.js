"use strict";
/////////////////////////
// Script
/////////////////////////
navigate("login").then(() => launchPageScript("login", false));

async function navigate(page)
{
	const container = document.getElementsByTagName("body")[0];
	await fetch("/pages/" + page + ".html")
	.then(response => response.text())
		.then(html => { container.innerHTML = html; })
		.catch(() => console.error("couldn't fetch page for SPA"))
}

async function	launchPageScript(page, restriction)
{
	if (page === "game")
		run(restriction);
	else if (page === "login")
		login();
}
