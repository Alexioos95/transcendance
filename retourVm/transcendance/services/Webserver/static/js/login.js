"use strict";
/////////////////////////
// Script
/////////////////////////
function	login()
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

		const form = document.getElementsByTagName("form")[0];
		const data = new FormData(form);
		const obj = {
			email: data.get("email"),
			password: data.get("password"),
			lang: struct.langSelect.value
		};
		if (struct.connection.classList.contains("recovery"))
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
						return (response.json().then(data => { console.log(data) }));
					}
				})
				.catch(() => console.error("Error: failed to fetch the resetPaswd route"));
		}
		else
		{
			console.log("fetch /user/login");
			fetch("/user/login/", { method: "POST", body: JSON.stringify(obj), credentials: "include"})
				.then(response => {
					if (response.ok)
					{
						console.log("response /user/login ok; navigate to Game");
						return (response.json().then(data => { call2FA(struct, data) }));
					}
					else
					{
						console.log("response /user/login not good; do nothing // Need to place error");
						console.log(response.status);
						return (response.json().then(data => { console.log(data) }));
					}
				})
				.catch(() => console.error("Error: failed to fetch the login route"));
		}
	});
	struct.signUp.addEventListener("click", function() { signUpFunction(struct) });
	struct.cancelSignUp.addEventListener("click", function() {
		struct.username.classList.add("hidden");
		struct.cancelSignUp.classList.add("hideInFade");
		struct.connection.classList.remove("hidden");
		struct.forgotPassword.classList.remove("hidden");
		struct.wrapperSpecialLogin.classList.remove("hideInFade");
		struct.signUp.classList.remove("primary");
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
	// 	signUpForm(struct);
}

async function call2FA(struct, data)
{
	console.log(data);

	if (data.twoFA === "false")
		return (navigate("game", data));
	const div = document.querySelector("form div.hidden");
	struct.username.classList.add("hidden");
	struct.forgotPassword.classList.add("hidden");
	struct.wrapperSpecialLogin.classList.add("hideInFade");
	div.classList.remove("hidden");

	await waitCode(struct, data);
}

async function waitCode(struct, data)
{
	return new Promise((resolve, reject) => {
		const button = document.querySelector("form div button");
		button.addEventListener("click", function() {
			const obj = { code: input.value };

			fetch("user/log2fa//", { method: "POST", body: JSON.stringify(obj), credentials: "include"})
			.then(response => {
				if (response.ok)
					return (response.json().then(data => { navigate("game", data) }));
				else
				{
					console.log("response user/log2fa/ not good; // do nothing");
					console.log(response.status);
				}
			})
			.catch(() => console.error("Error: failed to fetch the log2fa route"));
		}, { once: true });
	});
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
	if (struct.langSelect.value === "FR")
	{
		struct.connection.innerText = "Envoyer un mail de recuperation";
		struct.forgotPassword.innerText = "Je me souviens !";
		struct.forgotPassword.setAttribute("aria-label", "Je me souviens");
	}
	if (struct.langSelect.value === "EN")
	{
		struct.connection.innerText = "Send a recovery email";
		struct.forgotPassword.innerText = "I remember!";
		struct.forgotPassword.setAttribute("aria-label", "I remember");
	}
	if (struct.langSelect.value === "NL")
	{
		struct.connection.innerText = "Zend een recuperatie email";
		struct.forgotPassword.innerText = "Ik herinner mijn paswoord!";
		struct.forgotPassword.setAttribute("aria-label", "Ik herinner mijn paswoord");
	}
	struct.signUp.classList.add("hideInFade");
}

function	restore(struct)
{
	struct.password.ariaHidden = "false";
	struct.password.classList.remove("hideInFade");
	struct.showPassword.classList.remove("hideInFade");
	struct.connection.classList.remove("recovery");
	if (struct.langSelect.value === "FR")
	{
		struct.connection.innerText = "Connexion";
		struct.forgotPassword.innerText = "Mot de passe oublie";
		struct.forgotPassword.setAttribute("aria-label", "Mot de passe oublie");
	}
	else if (struct.langSelect.value === "EN")
	{
		struct.connection.innerText = "Sign in";
		struct.forgotPassword.innerText = "Forgotten password";
		struct.forgotPassword.setAttribute("aria-label", "Forgotten password");
	}
	else if (struct.langSelect.value === "NL")
	{
		struct.connection.innerText = "Aanmelden";
		struct.forgotPassword.innerText = "Paswoord vergeten";
		struct.forgotPassword.setAttribute("aria-label", "Paswoord vergeten");
	}
	struct.signUp.classList.remove("hideInFade");
	struct.signUp.disabled = false;
}

function	signUpFunction(struct)
{
	if (struct.signUp.classList.contains("primary"))
	{
		const form = document.getElementsByTagName("form")[0];
		const data = new FormData(form);
		const obj = {
			username: data.get("username"),
			email: data.get("email"),
			password: data.get("password"),
			lang: struct.langSelect.value
		};

		console.log("fetch /user/register");
		fetch("/user/register/", { method: "POST", body: JSON.stringify(obj), credentials: "include"})
			.then(response => {
				if (response.status === 201)
				{
					console.log("response /user/register ok; navigate to Game");
					return (response.json().then(data => { navigate("game", data); }));
				}
				else
				{
					console.log("response /user/register not good; do nothing // Need to place error");
					console.log(response.status);
					return (response.json().then(data => { console.log(data) }));
				}
			})
			// .catch(() => console.error("Error: failed to fetch the register route"));
	}
	else
	{
		signUpForm(struct);
		// window.history.pushState({ login: true, signUp: true, game: false }, null, "");
	}
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
