"use strict";
/////////////////////////
// Script
/////////////////////////
function	forgottenPassword()
{
	const struct = getLoginStruct();

	struct.forgotPassword.addEventListener("click", function() {
		if (struct.password.classList.contains("hideInFade"))
			restore(struct);
		else
			move(struct);
	});
	struct.password.addEventListener("transitionend", function() {
		if (struct.connection.classList.contains("recovery"))
			struct.password.value = "";
	});
	struct.signUp.addEventListener("click", function() {
		signUpForm(struct);
	});
	struct.cancelSignUp.addEventListener("click", function() {
		cancelSignUp(struct);
	});
}

function	getLoginStruct()
{
	const struct = {
		password: document.getElementsByClassName("password")[0],
		username: document.getElementsByClassName("username")[0],
		connection: document.getElementsByClassName("submit")[0],
		forgotPassword: document.getElementsByClassName("forgot-password")[0],
		signUp: document.getElementsByClassName("signup")[0],
		cancelSignUp: document.getElementsByClassName("cancel-signup")[0],
		wrapperSpecialLogin: document.getElementsByClassName("special-login")[0]
	};
	return (struct);
}

function	move(struct)
{
	struct.signUp.disabled = true;
	struct.password.classList.add("hideInFade");
	struct.connection.classList.add("recovery");
	struct.connection.innerText = "Envoyer un mail de recuperation";
	struct.forgotPassword.innerText = "Je me souviens !";
	struct.forgotPassword.setAttribute("aria-label", "Je me souviens");
	struct.signUp.classList.add("hideInFade");
}

function	restore(struct)
{
	struct.password.classList.remove("hideInFade");
	struct.connection.classList.remove("recovery");
	struct.connection.innerText = "Connexion";
	struct.forgotPassword.innerText = "Mot de passe oublie";
	struct.forgotPassword.setAttribute("aria-label", "Mot de passe oublie");
	struct.signUp.classList.remove("hideInFade");
	struct.signUp.disabled = false;
}

function	signUpForm(struct)
{
	struct.username.classList.remove("hidden");
	struct.connection.classList.add("hidden");
	struct.forgotPassword.classList.add("hidden");
	struct.wrapperSpecialLogin.classList.add("hideInFade");
	struct.signUp.classList.add("primary");
	struct.cancelSignUp.classList.remove("hideInFade");
}

function	cancelSignUp(struct)
{
	struct.username.classList.add("hidden");
	struct.connection.classList.remove("hidden");
	struct.forgotPassword.classList.remove("hidden");
	struct.wrapperSpecialLogin.classList.remove("hideInFade");
	struct.signUp.classList.remove("primary");
	struct.cancelSignUp.classList.add("hideInFade");
}
