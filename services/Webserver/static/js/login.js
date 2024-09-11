"use strict";
/////////////////////////
// Script
/////////////////////////
function	login(prevData)
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
	struct.formButton.signUp.addEventListener("click", function(event) {
		event.preventDefault();
		handleSignUp(struct)
	});
	struct.formButton.cancelSignUp.addEventListener("click", function() {
		cancelSignUp(struct);
		window.history.pushState({ state: "login", lang: struct.langSelect.value }, "", "");
	});
	struct.guestConnection.addEventListener("click", function() {
		navigate("game", { guestMode: "true", lang: struct.langSelect.value }, { signUp: "false", lang: struct.langSelect.value });
		window.history.pushState({ state: "guestMode", lang: struct.langSelect.value }, "", "");
	});
	struct.langSelect.addEventListener("change", function(event) {
		fetch("/lang/" + event.target.value + ".json")
			.then(response => response.json())
			.then(result => { translateLoginPage(struct, result.login); })
	});
	if (prevData)
	{
		fetch("/lang/" + prevData.lang + ".json")
			.then(response => response.json())
			.then(result => { translateLoginPage(struct, result.login); })
			.then(() => { struct.langSelect.value = prevData.lang; });
		if (prevData.signUp === "true")
			showSignUpForm(struct);
	}
}

function	resetErrorDisplay(p)
{
	p.classList.remove("success");
	p.classList.add("error");
	p.innerHTML = "";
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
					return (response.json().then(data => { navigate("game", data, { signUp: "false", lang: struct.langSelect.value }); }));
				else
					response.json().then(data => { console.log(data); struct.error.register.innerHTML = data.error; });
			})
			.catch(() => console.error("Error: failed to fetch the register route"));
	}
	else
	{
		showSignUpForm(struct);
		window.history.pushState({ state: "signUp", lang: struct.langSelect.value }, "", "");
	}
}

function	cancelSignUp(struct)
{
	struct.error.register.innerHTML = "";
	struct.formInput.username.classList.add("hidden");
	struct.formButton.cancelSignUp.classList.add("hideInFade");
	struct.formButton.connection.classList.remove("hidden");
	struct.formButton.forgotPassword.classList.remove("hidden");
	struct.formButton.signUp.classList.remove("primary");
	struct.wrapperSpecialLogin.classList.remove("hideInFade");
	struct.formButton.connection.type = "submit";
	struct.formButton.signUp.type = "button";
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
				{
					struct.error.login.classList.add("success");
					struct.error.login.classList.remove("error");
					struct.error.login.innerHTML = "Success";
				}
				else
				{
					struct.error.login.classList.remove("success");
					struct.error.login.classList.add("error");
					response.json().then(data => struct.error.login.innerHTML = data.error);
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
					resetErrorDisplay(struct.error.login);
					return (response.json().then(data => { call2FA(struct, data) }));
				}
				else
					response.text().then(data => { console.log(data); struct.error.login.innerHTML = data.error; });
					// response.json().then(data => { console.log(data); struct.error.login.innerHTML = data.error; });
			})
			.catch(() => console.error("Error: failed to fetch the login route"));
	}
}

async function call2FA(struct, data)
{
	if (data.twoFA === "false")
		return (navigate("game", data, { signUp: "false", lang: struct.langSelect.value }));
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
					return (response.json().then(data => { navigate("game", data, { signUp: "false", lang: struct.langSelect.value })}));
				else
					response.json().then(data => { struct.error.twoFA.innerHTML = data.error; });
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
	resetErrorDisplay(struct.error.login);
	struct.error.login.classList.remove("recovery");
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
	resetErrorDisplay(struct.error.login);
	struct.error.login.classList.add("recovery");
	struct.formButton.signUp.disabled = true;
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
	resetErrorDisplay(struct.error.login);
	struct.formInput.username.classList.remove("hidden");
	struct.formButton.connection.classList.add("hidden");
	struct.formButton.forgotPassword.classList.add("hidden");
	struct.formButton.signUp.classList.add("primary");
	struct.formButton.cancelSignUp.classList.remove("hideInFade");
	struct.wrapperSpecialLogin.classList.add("hideInFade");
	struct.formButton.connection.type = "button";
	struct.formButton.signUp.type = "submit"
}

/////////////////////////
// Reset Password
/////////////////////////
function resetPassword()
{
	const struct = {
		input: document.querySelector("form input"),
		showPassword: document.getElementsByClassName("show-password")[0],
		showPasswordIcon: document.querySelector(".show-password .i"),
		button: document.getElementsByClassName("submit")[0],
		langSelect: document.getElementsByTagName("select")[0],
		error: document.getElementsByClassName("error-reset")[0]
	};

	struct.showPassword.addEventListener("click", function() {
		if (password.type == "password")
			{
				struct.input.type = "text";
				struct.showPasswordIcon.classList.remove("fa-eye-slash");
				struct.showPasswordIcon.classList.add("fa-eye");
			}
			else
			{
				struct.input.type = "password";
				struct.showPasswordIcon.classList.remove("fa-eye");
				struct.showPasswordIcon.classList.add("fa-eye-slash");
			}
	});
	struct.button.addEventListener("click", function() {
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get('code');
		console.log(code);
		const obj = { password: struct.input.value, 'code': code};

		fetch("/user/sendNewPaswd/", { method: "POST", body: JSON.stringify(obj), credentials: "include"})
			.then(response => {
				if (response.ok)
				{
					showMessage(struct.error)
						.then(() => sleep(1000))
						.then(() => navigate("login", undefined, { guestMode: "false", lang: struct.langSelect.value }))
				}
				else
				{
					struct.error.classList.add("error");
					struct.error.classList.remove("success");
					response.text().then(data => { console.log(data) });
					// response.json().then(data => { struct.error.innerHTML = data.error });
				}
			})
			.catch(() => console.error("Error: failed to fetch the sendNewPaswd route"));
	});
	struct.langSelect.addEventListener("change", function(event) {
		fetch("/lang/" + event.target.value + ".json")
			.then(response => response.json())
			.then(result => { translateLoginPage(struct, result.reset); })
	});
}

async function showMessage(p)
{
	p.classList.add("success");
	p.classList.remove("error");
	p.innerHTML = "Success";	
}

/////////////////////////
// Translation
/////////////////////////
function	translateLoginPage(struct, obj)
{
	let plainTexts = Object.values(obj.plainText);
	let placeHolders = Object.values(obj.placeholder);
	let ariaLabels = Object.values(obj.ariaLabel);

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
	const errorStruct = {
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
		error: errorStruct
	};
	return (struct);
}
