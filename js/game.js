/////////////////////////
// Game selector form
/////////////////////////

const button = document.getElementById("selector");
const text = document.querySelectorAll("#selector span")[0];
const coin = document.getElementsByClassName("coin")[0];

button.addEventListener("click", function() {
	text.style.opacity = 0;
	text.style.animation = "none";
	coin.style.transition = "margin 3s ease";
	coin.classList.add("active");
	setTimeout(() => {
		startPong();
		coin.style.transition = "none";
		coin.classList.remove("active");
		text.style.opacity = 1;
		text.style.animation = "fade 3s infinite";
	}, 2500);
});
