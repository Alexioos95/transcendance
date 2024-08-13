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
		.catch(() => console.error("couldn't fetch pages for SPA"))
	if (page == "game")
		run();
	else if (page == "login")
		forgottenPassword();
}
