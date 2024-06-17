/////////////////////////
// Forgotten password
/////////////////////////
function	forgottenPassword()
{
	const link = document.getElementsByTagName("p")[0];
	const pwd = document.getElementsByTagName("input")[1];
	const button = document.getElementsByTagName("button")[0];
	link.addEventListener("click", function() { move(link, pwd, button); });
}

function	move(link, pwd, button)
{
	// Fade password field
	pwd.style.transition = "all 0.25s ease-out, background 0s";
	pwd.style.opacity = "0";
	// Move button up
	button.style.transition = "margin-top 1s ease-out, background 0s";
	button.style.marginTop = "-50px";
	button.style.zIndex = "1";
	// Remove password field
	pwd.addEventListener("transitionend", function() {
		if (link.innerText == "Je me souviens !")
			pwd.value = "";
	});
	pwd.style.visibility = "0";
	// Change texts
	button.innerText = "Envoyer un mail de recuperation";
	link.innerText = "Je me souviens !";
	link.setAttribute("aria-label", "Je me souviens");
	// Hover effects
	button.addEventListener("mouseover", function() { button.style.background = "rgb(200, 200, 200)"; });
	button.addEventListener("mouseleave", function() {
		button.style.background = "white";
		button.style.marginTop = "-50px";
		button.style.marginBottom = "0px";
	});
	// Click effect
	button.addEventListener("mousedown", function() {
		button.style.transition = "none";
		button.style.marginTop = "-48px";
		button.style.marginBottom = "-2px";
	});
	// Restore
	link.addEventListener("click", function() { restore(link, pwd, button); });
}

function restore(link, pwd, button)
{
	// Move button down
	button.style.transition = "margin-top 1s ease-out, background 0s";
	button.style.marginTop = "8px";
	button.style.zIndex = "0";
	// Restore password field
	pwd.style.transition = "all 1.5s ease-out, background 0s";
	pwd.style.opacity = "1";
	pwd.style.visibility = "1";
	// Change texts
	button.innerText = "Connexion/Inscription";
	link.innerText = "Mot de passe oublie";
	link.setAttribute("aria-label", "Mot de passe oublie");
	// Hover effects
	button.addEventListener("mouseover", function() { button.style.background = "rgb(200, 200, 200)"; });
	button.addEventListener("mouseleave", function() {
		button.style.background = "white";
		button.style.marginTop = "8px";
		button.style.marginBottom = "0px";
	});
	// Click effect
	button.addEventListener("mousedown", function() {
		button.style.transition = "none";
		button.style.marginTop = "10px";
		button.style.marginBottom = "-2px";
	});
	// Move
	link.addEventListener("click", function() { move(link, pwd, button); });
}

/////////////////////////
// Script
/////////////////////////
// loadGoogleButtonWidth();
forgottenPassword();
