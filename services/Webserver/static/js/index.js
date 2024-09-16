"use strict";
/////////////////////////
// Script
/////////////////////////
entrypoint();

function	entrypoint()
{
	if (window.location.href.indexOf("resetmypassword") === -1 && window.location.href.indexOf("code") > -1)
	{
		console.log("opener == ", window.opener);
		close();
		return ;
	}
	checkJWT();
	popState();
}

async function	checkJWT()
{
	if (window.location.href.indexOf("resetmypassword") > -1)
		navigate("reset", undefined, undefined);
	else
	{
		await fetch("/user/checkJwt/")
			.then(response => response.json())
			.then(data => {
				if (data.error === undefined)
				{
					data.guestMode = "false";
					return (navigate("game", data, { signUp: "false", lang: "FR" }));
				}
				else
				{
					history.replaceState({ state: "login", lang: "FR" }, "", "");
					return (navigate("login", undefined,  { signUp: "false", lang: "FR" }));
				}
			})
			.catch(() => console.error("Failed to fetch the checkJwt route"));
	}
}

async function popState()
{
	window.addEventListener("popstate", function(event) {
		if (event.state)
		{
			fetch("/user/checkJwt/")
				.then(response => response.json())
				.then(data => {
					if (data.error === undefined)
					{
						data.guestMode = "false";
						return (navigate("game", data, { signUp: "false", lang: "FR" }));
					}
					else
					{
						const data = event.state;

						if (data.state === "login")
							navigate("login", undefined, { signUp: "false", lang: data.lang })
						else if (data.state === "signUp")
							navigate("login", undefined, { signUp: "true", lang: data.lang })
						else if (data.state === "guestMode")
						{
							const data = { guestMode: "true", lang: data.lang };
							navigate("game", data, { signUp: "false", lang: data.lang });
						}
					}
				});
		}
	});
}

async function navigate(page, data, infos)
{
	const container = document.getElementsByTagName("body")[0];

	await fetch("/html/" + page + ".html")
		.then(response => response.text())
		.then(html => { container.innerHTML = html; })
		.then(() => {
			if (page === "game")
				run(data);
			else if (page === "login")
				login(infos);
			else if (page === "reset")
				resetPassword();
		})
		.catch(() => Promise.reject("Error: couldn't fetch the page"))
}
