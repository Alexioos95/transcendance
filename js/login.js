"use strict";
/////////////////////////
// Script
/////////////////////////
function	login(signUpMode)
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
	struct.showPassword.addEventListener("click", function() {
		if (struct.password.type == "password")
		{
			struct.password.type = "text";
			struct.showPasswordIcon.classList.remove("fa-eye-slash");
			struct.showPasswordIcon.classList.add("fa-eye");
		}
		else
		{
			struct.password.type = "password";
			struct.showPasswordIcon.classList.remove("fa-eye");
			struct.showPasswordIcon.classList.add("fa-eye-slash");
		}
	});
	struct.connection.addEventListener("click", function(event) {
		event.preventDefault();
		navigate("game")
			.then(() => launchPageScript("game", false, false))
			.catch((e) => console.log(e));
	});
	struct.signUp.addEventListener("click", function() {
		if (struct.signUp.classList.contains("primary"))
			struct.signUp.type = "submit";
		else
		{
			signUpForm(struct);
			window.history.pushState({ login: true, signUp: true, game: false }, null, "");
		}
	});
	struct.cancelSignUp.addEventListener("click", function() {
		window.history.back();
	});
	struct.guestConnection.addEventListener("click", function() {
		navigate("game")
			.then(() => launchPageScript("game", true, false))
			.then(() => window.history.pushState({ login: false, signUp: false, game: true }, null, ""))
			.catch((e) => console.log(e));
	});
	if (signUpMode !== undefined && signUpMode === true)
	{
		document.title = "ft_transcendance [Inscription]";
		signUpForm(struct);
	}
}

function	getLoginStruct()
{
	const struct = {
		password: document.getElementsByClassName("password")[0],
		showPassword: document.getElementsByClassName("show-password")[0],
		showPasswordIcon: document.querySelector(".show-password i"),
		username: document.getElementsByClassName("username")[0],
		connection: document.getElementsByClassName("submit")[0],
		forgotPassword: document.getElementsByClassName("forgot-password")[0],
		signUp: document.getElementsByClassName("signup")[0],
		cancelSignUp: document.getElementsByClassName("cancel-signup")[0],
		wrapperSpecialLogin: document.getElementsByClassName("special-login")[0],
		guestConnection: document.getElementsByClassName("special-login-guest")[0]
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
	document.title = "ft_transcendance [Inscription]";
}
