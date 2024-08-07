"use strict";
/////////////////////////
// Script
/////////////////////////
navigate("game");

async function navigate(page)
{
	const container = document.getElementsByTagName("body")[0];
	await fetch("/pages/" + page + ".html")
	.then(response => response.text())
		.then(html => { container.innerHTML = html; })
	if (page == "game")
		run();
	else if (page == "login")
		forgottenPassword();
}
