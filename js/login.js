/////////////////////////
// Google button
/////////////////////////
function	loadGoogleButtonWidth()
{
	console.log("CALL");
	const googleButton = document.getElementsByClassName("g_id_signin")[0];
	if (googleButton != undefined)
		googleButton.remove();
	const wrapperGoogle = document.getElementsByClassName("login-google")[0];
	const button = document.getElementsByClassName("login-42")[0];
	const width = button.offsetWidth - 20;
	const newDiv = document.createElement("div");
	newDiv.classList.add("g_id_signin");
	newDiv.setAttribute("data-type", "standard");
	newDiv.setAttribute("data-size", "large");
	newDiv.setAttribute("data-theme", "outline");
	newDiv.setAttribute("data-text", "signin_with");
	newDiv.setAttribute("data-shape", "rectangular");
	newDiv.setAttribute("data-logo_alignment", "center");
	newDiv.setAttribute("data-width", width);
	wrapperGoogle.appendChild(newDiv);
}

/////////////////////////
// Forgotten password
/////////////////////////
function	forgottenPassword()
{
	const link = document.getElementsByTagName("p");
	const pwd = document.getElementsByTagName("input");
	const button = document.getElementsByTagName("button");
	link[0].addEventListener("click", function() { move(link[0], pwd[1], button[0]); });
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
document.addEventListener("load", loadGoogleButtonWidth());
