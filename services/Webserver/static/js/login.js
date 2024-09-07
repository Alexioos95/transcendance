"use strict";
/////////////////////////
// Script
/////////////////////////
function	login()
{
	const struct = getLoginStruct();

	struct.formButton.forgotPassword.addEventListener("click", function() {
		if (struct.formInput.password.classList.contains("hideInFade"))
			showConnection(struct);
		else
			showRecovery(struct);
	});
	struct.formInput.password.addEventListener("transitionend", function() {
		if (struct.formButton.connection.classList.contains("recovery"))
			struct.formInput.password.value = "";
	});
	struct.formButton.showPassword.addEventListener("click", function() {
		if (struct.formInput.password.type == "password")
		{
			struct.formInput.password.type = "text";
			struct.formButton.showPasswordIcon.classList.remove("fa-eye-slash");
			struct.formButton.showPasswordIcon.classList.add("fa-eye");
		}
		else
		{
			struct.formInput.password.type = "password";
			struct.formButton.showPasswordIcon.classList.remove("fa-eye");
			struct.formButton.showPasswordIcon.classList.add("fa-eye-slash");
		}
	});
	struct.formButton.connection.addEventListener("click", function(event) {
		event.preventDefault();
		handleConnection(struct);
	});
	struct.formButton.signUp.addEventListener("click", function() { handleSignUp(struct) });
	struct.formButton.cancelSignUp.addEventListener("click", function() {
		cancelSignUp(struct);
		// window.history.back();
	});
	struct.guestConnection.addEventListener("click", function() {
		navigate("game", { guestMode: "true", lang: struct.langSelect.value } )
			// .then(() => window.history.pushState({ login: false, signUp: false, game: true }, null, ""))
	});
	struct.langSelect.addEventListener("change", function(event) {
		fetch("/lang/" + event.target.value + ".json")
			.then(response => response.json())
			.then(result => { translateLoginPage(struct, result); })
	});
	// if (signUpMode !== undefined && signUpMode === true)
	// 	showSignUpForm(struct);
}

/////////////////////////
// Sign Up
/////////////////////////
function	handleSignUp(struct)
{
	if (struct.formButton.signUp.classList.contains("primary"))
	{
		const obj = {
			username: struct.formInput.username.value,
			email: struct.formInput.email.value,
			password: struct.formInput.password.value,
			lang: struct.langSelect.value
		};

		fetch("/user/register/", { method: "POST", body: JSON.stringify(obj), credentials: "include"})
			.then(response => {
				if (response.status === 201)
					return (response.json().then(data => { navigate("game", data); }));
				else
					response.json().then(data => { console.log(data); struct.errorRegister.innerHTML = data.e; });
			})
			.catch(() => console.error("Error: failed to fetch the register route"));
	}
	else
	{
		showSignUpForm(struct);
		// window.history.pushState({ login: true, signUp: true, game: false }, null, "");
	}
}

function	cancelSignUp(struct)
{
	struct.formInput.username.classList.add("hidden");
	struct.formButton.cancelSignUp.classList.add("hideInFade");
	struct.formButton.connection.classList.remove("hidden");
	struct.formButton.forgotPassword.classList.remove("hidden");
	struct.formButton.signUp.classList.remove("primary");
	struct.wrapperSpecialLogin.classList.remove("hideInFade");
}

/////////////////////////
// Sign In
/////////////////////////
function	handleConnection(struct)
{
	const obj = {
		email: struct.formInput.email.value,
		password: struct.formInput.password.value,
		lang: struct.langSelect.value
	};

	if (struct.formButton.connection.classList.contains("recovery"))
	{
		console.log("fetch /user/resetPaswd");
		fetch("/user/resetPaswd/", { method: "POST", body: JSON.stringify(obj), credentials: "include"})
			.then(response => {
				if (response.ok)
					console.log("response /user/resetPaswd ok; do nothing // Need to continue");
				else
				{
					console.log("response /user/resetPaswd not good; do nothing // Need to place error");
					console.log(response.status);
				}
			})
			.catch(() => console.error("Error: failed to fetch the resetPaswd route"));
	}
	else
	{
		fetch("/user/login/", { method: "POST", body: JSON.stringify(obj), credentials: "include"})
			.then(response => {
				if (response.ok)
				{
					struct.errorLogin.innerHTML = "";
					return (response.json().then(data => { call2FA(struct, data) }));
				}
				else
					response.json().then(data => { console.log(data); struct.errorLogin.innerHTML = data.e; });
			})
			.catch(() => console.error("Error: failed to fetch the login route"));
	}
}

async function call2FA(struct, data)
{
	if (data.twoFA === "false")
		return (navigate("game", data));
	const div = document.getElementsByClassName("div-2fa")[0];

	struct.formInput.username.classList.add("hidden");
	struct.formButton.forgotPassword.classList.add("hidden");
	struct.formButton.connection.classList.add("hidden");
	struct.formButton.connection.type = "button";
	struct.formButton.signUp.classList.add("hidden");
	struct.wrapperSpecialLogin.classList.add("hideInFade");
	div.classList.remove("hidden");
	await waitCode(struct);
}

async function waitCode(struct)
{
	return new Promise((resolve, reject) => {
		const button = document.querySelector(".div-2fa button");
		const input = document.querySelector(".div-2fa input");

		button.addEventListener("click", function(event) {
			event.preventDefault();
			const obj = { code: input.value };

			fetch("/user/log2fa/", { method: "POST", body: JSON.stringify(obj), credentials: "include"})
			.then(response => {
				if (response.ok)
					return (response.json().then(data => { navigate("game", data) }));
				else
					response.json().then(data => { struct.errors.twoFA.innerHTML = data.e; });
			})
			.catch(() => console.error("Error: failed to fetch the log2fa route"));
		});
	});
}

/////////////////////////
// Animation
/////////////////////////
function	showConnection(struct)
{
	struct.formInput.password.ariaHidden = "false";
	struct.formInput.password.classList.remove("hideInFade");
	struct.formButton.showPassword.classList.remove("hideInFade");
	struct.formButton.connection.classList.remove("recovery");
	if (struct.langSelect.value === "FR")
	{
		struct.formButton.connection.innerText = "Connexion";
		struct.formButton.forgotPassword.innerText = "Mot de passe oublie";
		struct.formButton.forgotPassword.setAttribute("aria-label", "Mot de passe oublie");
	}
	else if (struct.langSelect.value === "EN")
	{
		struct.formButton.connection.innerText = "Sign in";
		struct.formButton.forgotPassword.innerText = "Forgotten password";
		struct.formButton.forgotPassword.setAttribute("aria-label", "Forgotten password");
	}
	else if (struct.langSelect.value === "NL")
	{
		struct.formButton.connection.innerText = "Aanmelden";
		struct.formButton.forgotPassword.innerText = "Paswoord vergeten";
		struct.formButton.forgotPassword.setAttribute("aria-label", "Paswoord vergeten");
	}
	struct.formButton.signUp.classList.remove("hideInFade");
	struct.formButton.signUp.disabled = false;
}

function	showRecovery(struct)
{
	struct.formButton.signUp.disabled = true;
	struct.formInput.password.ariaHidden = "false";
	struct.formInput.password.classList.add("hideInFade");
	struct.formButton.showPassword.classList.add("hideInFade");
	struct.formButton.connection.classList.add("recovery");
	if (struct.langSelect.value === "FR")
	{
		struct.formButton.connection.innerText = "Envoyer un mail de recuperation";
		struct.formButton.forgotPassword.innerText = "Je me souviens !";
		struct.formButton.forgotPassword.setAttribute("aria-label", "Je me souviens");
	}
	if (struct.langSelect.value === "EN")
	{
		struct.formButton.connection.innerText = "Send a recovery email";
		struct.formButton.forgotPassword.innerText = "I remember!";
		struct.formButton.forgotPassword.setAttribute("aria-label", "I remember");
	}
	if (struct.langSelect.value === "NL")
	{
		struct.formButton.connection.innerText = "Zend een recuperatie email";
		struct.formButton.forgotPassword.innerText = "Ik herinner mijn paswoord!";
		struct.formButton.forgotPassword.setAttribute("aria-label", "Ik herinner mijn paswoord");
	}
	struct.formButton.signUp.classList.add("hideInFade");
}

function	showSignUpForm(struct)
{
	struct.formInput.username.classList.remove("hidden");
	struct.formButton.connection.classList.add("hidden");
	struct.formButton.forgotPassword.classList.add("hidden");
	struct.formButton.signUp.classList.add("primary");
	struct.formButton.cancelSignUp.classList.remove("hideInFade");
	struct.wrapperSpecialLogin.classList.add("hideInFade");
}

/////////////////////////
// Translation
/////////////////////////
function	translateLoginPage(struct, obj)
{
	let plainTexts = Object.values(obj.login.plainText);
	let placeHolders = Object.values(obj.login.placeholder);
	let ariaLabels = Object.values(obj.login.ariaLabel);

	let i = 0;
	for (let text of plainTexts)
	{
		struct.translate.text[i].innerHTML = text;
		i++;
	}
	i = 0;
	for (let placeholder of placeHolders)
	{
		struct.translate.placeholder[i].placeholder = placeholder;
		i++;
	}
	i = 0;
	for (let ariaLabel of ariaLabels)
	{
		struct.translate.ariaLabel[i].ariaLabel = ariaLabel;
		i++;
	}
}

/////////////////////////
// Get(?)Struct
/////////////////////////
function	getLoginStruct()
{
	const inputStruct = {
		email: document.getElementsByClassName("email")[0],
		password: document.getElementsByClassName("password")[0],
		username: document.getElementsByClassName("username")[0],
	};
	const buttonStruct = {
		showPassword: document.getElementsByClassName("show-password")[0],
		showPasswordIcon: document.querySelector(".show-password i"),
		connection: document.getElementsByClassName("submit")[0],
		forgotPassword: document.getElementsByClassName("forgot-password")[0],
		signUp: document.getElementsByClassName("signup")[0],
		cancelSignUp: document.getElementsByClassName("cancel-signup")[0],
	};
	const translateStruct = {
		text: document.getElementsByClassName("translate-text"),
		placeholder: document.getElementsByClassName("translate-pholder"),
		ariaLabel: document.getElementsByClassName("translate-aria-label"),
	};
	const errorsStruct = {
		login: document.getElementsByClassName("error-login")[0],
		twoFA: document.getElementsByClassName("error-2fa")[0],
		register: document.getElementsByClassName("error-register")[0]
	};
	const struct = {
		formInput: inputStruct,
		formButton: buttonStruct,
		wrapperSpecialLogin: document.getElementsByClassName("special-login")[0],
		guestConnection: document.getElementsByClassName("special-login-guest")[0],
		langSelect: document.getElementsByTagName("select")[0],
		translate: translateStruct,
		errors: errorsStruct
	};
	return (struct);
}
