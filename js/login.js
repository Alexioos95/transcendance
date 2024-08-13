"use strict";
/////////////////////////
// Script
/////////////////////////
function	forgottenPassword()
{
	const link = document.getElementsByClassName("forgot-password")[0];
	const pwd = document.getElementsByClassName("password")[0];
	const button = document.getElementsByClassName("submit")[0];

	link.addEventListener("click", function() {
		if (pwd.classList.contains("hideInput"))
			restore(link, pwd, button);
		else
			move(link, pwd, button);
	});
	pwd.addEventListener("transitionend", function() {
		if (button.classList.contains("recovery"))
			pwd.value = "";
	});
	button.addEventListener("transitionend", function() { button.classList.add("notransition"); });
}

function	move(link, pwd, button)
{
	pwd.classList.add("hideInput");
	button.classList.remove("notransition");
	button.classList.add("recovery");
	button.innerText = "Envoyer un mail de recuperation";
	link.innerText = "Je me souviens !";
	link.setAttribute("aria-label", "Je me souviens");
}

function restore(link, pwd, button)
{
	pwd.classList.remove("hideInput");
	button.classList.add("notransition");
	button.classList.remove("recovery");
	button.innerText = "Connexion";
	link.innerText = "Mot de passe oublie";
	link.setAttribute("aria-label", "Mot de passe oublie");
}
