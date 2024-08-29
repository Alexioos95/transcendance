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
	struct.langSelect.addEventListener("change", function(event) {
		if (event.target.value === "fr")
		{
			fetch("/lang/fr.json")
				.then(response => response.json())
				.then(result => { translateLoginPage(struct, result); })
		}
		else if (event.target.value === "en")
		{
			fetch("/lang/en.json")
				.then(response => response.json())
				.then(result => { translateLoginPage(struct, result); })
		}
	});
	if (signUpMode !== undefined && signUpMode === true)
		signUpForm(struct);
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
		guestConnection: document.getElementsByClassName("special-login-guest")[0],
		langSelect: document.getElementsByTagName("select")[0],
		translateText: document.getElementsByClassName("translate-text"),
		translatePlaceholder: document.getElementsByClassName("translate-pholder"),
		translateAriaLabel: document.getElementsByClassName("translate-aria-label"),
	};
	return (struct);
}

function	move(struct)
{
	struct.signUp.disabled = true;
	struct.password.ariaHidden = "false";
	struct.password.classList.add("hideInFade");
	struct.showPassword.classList.add("hideInFade");
	struct.connection.classList.add("recovery");
	if (struct.langSelect.value === "fr")
	{
		struct.connection.innerText = "Envoyer un mail de recuperation";
		struct.forgotPassword.innerText = "Je me souviens !";
		struct.forgotPassword.setAttribute("aria-label", "Je me souviens");
	}
	if (struct.langSelect.value === "en")
	{
		struct.connection.innerText = "Send a recovery email";
		struct.forgotPassword.innerText = "I remember!";
		struct.forgotPassword.setAttribute("aria-label", "I remember");
	}
	struct.signUp.classList.add("hideInFade");
}

function	restore(struct)
{
	struct.password.ariaHidden = "false";
	struct.password.classList.remove("hideInFade");
	struct.showPassword.classList.remove("hideInFade");
	struct.connection.classList.remove("recovery");
	if (struct.langSelect.value === "fr")
	{
		struct.connection.innerText = "Connexion";
		struct.forgotPassword.innerText = "Mot de passe oublie";
		struct.forgotPassword.setAttribute("aria-label", "Mot de passe oublie");
	}
	else if (struct.langSelect.value === "en")
	{
		struct.connection.innerText = "Sign in";
		struct.forgotPassword.innerText = "Forgotten password";
		struct.forgotPassword.setAttribute("aria-label", "Forgotten password");
	}
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

function	translateLoginPage(struct, obj)
{
	let plainTexts = Object.values(obj.login.plainText);
	let placeHolders = Object.values(obj.login.placeholder);
	let ariaLabels = Object.values(obj.login.ariaLabel);

	let i = 0;
	for (let text of plainTexts)
	{
		struct.translateText[i].innerHTML = text;
		i++;
	}
	i = 0;
	for (let placeholder of placeHolders)
	{
		struct.translatePlaceholder[i].placeholder = placeholder;
		i++;
	}
	i = 0;
	for (let ariaLabel of ariaLabels)
	{
		struct.translateAriaLabel[i].ariaLabel = ariaLabel;
		i++;
	}
}
