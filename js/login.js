/////////////////////////
// Script
/////////////////////////
forgottenPassword();

function	forgottenPassword()
{
	const link = document.getElementsByTagName("p")[0];
	const pwd = document.getElementsByTagName("input")[1];
	const button = document.getElementsByTagName("button")[0];

	link.addEventListener("click", function() {
		if (pwd.classList.contains("hidden"))
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
	pwd.classList.add("hidden");
	button.classList.remove("notransition");
	button.classList.add("recovery");
	button.innerText = "Envoyer un mail de recuperation";
	link.innerText = "Je me souviens !";
	link.setAttribute("aria-label", "Je me souviens");
}

function restore(link, pwd, button)
{
	pwd.classList.remove("hidden");
	button.classList.remove("notransition");
	button.classList.remove("recovery");
	button.innerText = "Connexion/Inscription";
	link.innerText = "Mot de passe oublie";
	link.setAttribute("aria-label", "Mot de passe oublie");
}
