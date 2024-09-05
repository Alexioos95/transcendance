const queryString = window.location.search;
console.log(window.opener);
console.log(queryString);
const urlParams = new URLSearchParams(queryString);
console.log(typeof(urlParams));
console.log(urlParams);
if (urlParams.size != 0)
{
    localStorage.setItem("auth", urlParams.toString());
    close();
}
async function main() {
    let data;

    async function getInfo(button) {
        return new Promise((resolve, reject) => {
            button.addEventListener("click", function(event) {
                const nom = document.querySelector('.nom').value;
                const password = document.querySelector('.password').value;

                data = {
                    nom: nom,
                    password: password
                };

                resolve(data);
            });
        });
    }


//login

    const loginbuttons = document.getElementsByClassName('login');
    const loginbutton = loginbuttons[0];
    const info = await getInfo(loginbutton);

    //const csrftoken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;
    //console.log('CSRF Token:', csrftoken);
    //console.log('Data to send:', info);

    fetch('/user/login/', {
        credentials: 'include',
        method: 'POST',
        // headers: {
        //     'Content-Type': 'application/json',
        //     // 'X-CSRFToken': csrftoken,
        // },
        body: JSON.stringify(info)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        console.log("Response headers:", response.headers);
        return response.json().then(data => ({ data, headers: response.headers }));
    })
    .then(({ data, headers }) => {
        {
            let messageKey = Object.keys(data)[0]; 
            let messageValue = data[messageKey];
           // sessionStorage.setItem(messageKey, messageValue);
            // localStorage.setItem(messageKey, messageValue);
            // cookies.set(data);
            console.log("message key", messageKey, "val ", messageValue);
            console.log('Success:', data);
        }
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });

}
main();

function fetchUntilSuccess() {
    const intervalId = setInterval(async () => {
        try {
            const response = await fetch('http://made-f0Br6s19:8000/user/checkAuth42/', {
                method: 'POST'
            });
            
            if (response.status === 200) {
                const data = await response.json();
                console.log('Data:', data);
                document.body.innerHTML += `<p>coucou ${data.login}</p>`;
                clearInterval(intervalId);
            } else if (response.status === 204) {
                console.log('Cache is empty.');
            } else {
                console.log('Waiting for a successful response...');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }, 500);
}



function openOAuthPopup()
{
    const strWindowFeatures ='toolbar=no, menubar=no, width=400, height=500, top=500, left=100';
    const authUrl = "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-f59fbc2018cb22b75560aad5357e1680cd56b1da8404e0155abc804bc0d6c4b9&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Fauth42&response_type=code";
    //const authUrl = 'http://127.0.0.1:8000/';
    //const popupWindow = window.open(authUrl, 'Intra OAuth', 'popup=true');
    windowObjectReference = window.open(authUrl, "oauth", strWindowFeatures);
    // console.log(popupWindow);
    //const checkPopup = setInterval(() => {
        // if (popupWindow.window.location.href
        // .includes("code")) {popupWindow.close()}
        // else
        // console.log(popupWindow.window.location.href);
        //  if (!popupWindow || !popupWindow.closed) return;
        //  console.log("coucou");
        //   }, 100);
        //popupWindow.close();
    }
    

    
    const button = document.querySelectorAll('.boutton42')[0];
    button.addEventListener('click', function() {
        openOAuthPopup();
        fetchUntilSuccess();
    })
        


async function mainregister() {

    async function getInforegister(button) {
        return new Promise((resolve, reject) => {
            button.addEventListener("click", function(event) {
                const nom = document.querySelector('.registernom').value;
                const password = document.querySelector('.registerpassword').value;
                const email = document.querySelector('.email').value;

                data = {
                    'nom': nom,
                    'password': password,
		    'email': email
                };

                resolve(data);
            });
        });
    }
//register

    const registerbuttons = document.getElementsByClassName('register');
    const registerbutton = registerbuttons[0];
    const info = await getInforegister(registerbutton);

//    const csrftoken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;
//    console.log('CSRF Token:', csrftoken);
//    console.log('Data to send:', info);

    fetch('/user/register/', {
        credentials: 'include',
        method: 'POST',
        // headers: {
        //     'Content-Type': 'application/json',
        //     // 'X-CSRFToken': csrftoken,
        // },
        body: JSON.stringify(info)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        console.log("Response headers:", response.headers);
        return response.json().then(data => ({ data, headers: response.headers }));
    })
    .then(({ data, headers }) => {
        {
            let messageKey = Object.keys(data)[0]; 
            let messageValue = data[messageKey];
           // sessionStorage.setItem(messageKey, messageValue);
            localStorage.setItem(messageKey, messageValue);
            // cookies.set(data);
            console.log("message key", messageKey, "val ", messageValue);
            console.log('Success:', data);
        }
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
}
mainregister();
