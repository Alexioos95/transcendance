function getCanevas()
{
	const canvas = document.getElementById("canvas");
	return (canvas);
}

function createPaddle(canvas, height, width, position)
{
	let paddle = {
		x: 0,
		y: 0,
		move_top: 0,
		move_bot: 0,
	}
	if (position == "l")
	{
		paddle.x = canvas.width / 20;
		paddle.y = (canvas.height / 2) - (height / 2)
	}
	else if (position == "r")
	{
		paddle.x = canvas.width - (canvas.width / 20) - width;
		paddle.y = (canvas.height / 2) - (height / 2);
	}
	return (paddle);
}

function getPaddles(canvas)
{
	let height = canvas.height / 5;
	let width = canvas.width / 50;
	let paddles = {
		height: height,
		width: width,
		speed: 7,
		left: createPaddle(canvas, height, width, "l"),
		right: createPaddle(canvas, height, width, "r")
	}
	return (paddles);
}

function enableMove(event, paddles)
{
	if (event.key == "w" || event.key == "W")
		paddles.left.move_top = 1;
	else if (event.key == "s" || event.key == "S")
		paddles.left.move_bot = 1;
	else if (event.key == "ArrowUp")
		paddles.right.move_top = 1;
	else if (event.key == "ArrowDown")
		paddles.right.move_bot = 1;
}

function disableMove(event, paddles)
{
	if (event.key == "w" || event.key == "w")
		paddles.left.move_top = 0;
	else if (event.key == "s" || event.key == "S")
		paddles.left.move_bot = 0;
	else if (event.key == "ArrowUp")
		paddles.right.move_top = 0;
	else if (event.key == "ArrowDown")
		paddles.right.move_bot = 0;
}

function movePaddles(canvas, paddles)
{
	if (paddles.left.move_top == 1 && paddles.left.y > 0)
		paddles.left.y -= paddles.speed;
	if (paddles.left.move_bot == 1 && paddles.left.y < (canvas.height - paddles.height))
		paddles.left.y += paddles.speed;
	if (paddles.right.move_top == 1 && paddles.right.y > 0)
		paddles.right.y -= paddles.speed;
	if (paddles.right.move_bot == 1 && paddles.right.y < (canvas.height - paddles.height))
		paddles.right.y += paddles.speed;
}

function getBall(canvas)
{
	const ball = {
		radius: 16,
		x: canvas.width / 2,
		y: canvas.height / 2,
		dir_x: (Math.round(Math.random() * 100) % 2 != 1) ? -1 : 1,
		dir_y: (Math.round(Math.random() * 100) % 2 != 1) ? -1 : 1,
		speed: 8,
		out: 0
	}
	return (ball);
}

function resetBall(canvas, ball)
{
	console.log("Point!");
	ball.x = canvas.width / 2;
	ball.y = canvas.height / 2;
	ball.dir_x = (Math.round(Math.random() * 100) % 2 != 1) ? -1 : 1;
	ball.dir_y = (Math.round(Math.random() * 100) % 2 != 1) ? -1 : 1;
	ball.out = 0;
}

function collision(paddles, ball)
{
	if (ball.x >= (paddles.left.x + paddles.width) && ball.x <= paddles.right.x) // FROM SIDE
	{
		if ((ball.x - ball.radius) <= (paddles.left.x + paddles.width)
		&& ball.y >= paddles.left.y && ball.y <= (paddles.left.y + paddles.height)) // Touche la surface droite du paddle gauche
			ball.dir_x *= -1;
		else if ((ball.x + ball.radius) >= paddles.right.x  && ball.y >= paddles.right.y
		&& ball.y <= (paddles.right.y + paddles.height)) // Touche la surface gauche du paddle droit
			ball.dir_x *= -1;
		else if (ball.dir_x > 0)
		{
			if ((ball.y - ball.radius) <= (paddles.right.y + paddles.height) && ball.y >= (paddles.right.y + paddles.height)
				&& (ball.x + ball.radius) >= paddles.right.x && ball.x <= paddles.right.x) // Dans le corner bas gauche du paddle droit
			{
				console.log("Corner Bot - Droit");
				ball.dir_x *= -1;
				ball.dir_y *= -1;
			}
			else if ((ball.y + ball.radius) >= paddles.right.y && ball.y <= paddles.right.y
				&& (ball.x + ball.radius) >= paddles.right.x && ball.x <= paddles.right.x) // Dans le corner haut gauche du paddle droit
			{
				console.log("Corner Top - Droit");
				ball.dir_x *= -1;
				ball.dir_y *= -1;
			}
		}
		else if (ball.dir_x < 0)
		{
			if ((ball.y - ball.radius) <= (paddles.left.y + paddles.height) && ball.y >= (paddles.left.y + paddles.height)
				&& (ball.x - ball.radius) <= (paddles.left.x + paddles.width) && ball.x >= (paddles.left.x + paddles.width)) // Dans le corner bas droit du paddle gauche
			{
				console.log("Corner Bot - Gauche");
				ball.dir_x *= -1;
				ball.dir_y *= -1;
			}
			else if ((ball.y + ball.radius) >= paddles.left.y && ball.y <= paddles.left.y
				&& (ball.x - ball.radius) <= (paddles.left.x + paddles.width) && ball.x >= (paddles.left.x + paddles.width)) // Dans le corner haut droit du paddle gauche
			{
				console.log("Corner Top - Gauche");
				ball.dir_x *= -1;
				ball.dir_y *= -1;
			}
		}
	}
	else if (ball.dir_y > 0) // FROM TOP
	{
		if (ball.y < paddles.left.y && (ball.y + ball.radius) >= paddles.left.y) // Juste au dessus du paddle gauche
		{
			if ((ball.x + ball.radius) >= paddles.left.x && (ball.x - ball.radius) <= (paddles.left.x + paddles.width)) // Dans la surface
			{
				console.log("Top - Gauche");
				ball.dir_x *= -1;
				ball.dir_y *= -1;
			}
		}
		else if (ball.y < paddles.right.y && (ball.y + ball.radius) >= paddles.right.y) // Juste au dessus du paddle droit
		{
			if ((ball.x - ball.radius) <= (paddles.right.x + paddles.width) && (ball.x + ball.radius) >= paddles.right.x) // Dans la surface
			{
				console.log("Top - Droite");
				ball.dir_x *= -1;
				ball.dir_y *= -1;
			}
		}
	}
	else if (ball.dir_y < 0) // FROM BOTTOM
	{
		if (ball.y > (paddles.left.y + paddles.height) && (ball.y - ball.radius) <= (paddles.left.y + paddles.height)) // Juste en dessous du paddle gauche
		{
			if ((ball.x + ball.radius) >= paddles.left.x && (ball.x - ball.radius) <= paddles.left.x + paddles.width) // Dans la surface
			{
				console.log("From Bot - Gauche");
				ball.dir_x *= -1;
				ball.dir_y *= -1;
			}
		}
		else if (ball.y > (paddles.right.y + paddles.height) && (ball.y - ball.radius) <= (paddles.right.y + paddles.height)) // Juste en dessous du paddle droit
		{
			if ((ball.x + ball.radius) >= paddles.right.x && (ball.x - ball.radius) <= paddles.right.x + paddles.width) // Dans la surface
			{
				console.log("From Bot - Droit");
				ball.dir_x *= -1;
				ball.dir_y *= -1;
			}
		}
	}
}

function moveBall(canvas, paddles, ball)
{
	if (ball.x <= -100 || ball.x >= (canvas.width + 100)) // Out
		resetBall(canvas, ball);
	else if (ball.y <= ball.radius || ball.y >= (canvas.height - ball.radius)) // Walls
		ball.dir_y *= -1;
	collision(paddles, ball);
	ball.x += ball.speed * ball.dir_x;
	ball.y += ball.speed * ball.dir_y;
}

function loop(canvas, ctx, paddles, ball)
{
	movePaddles(canvas, paddles);
	moveBall(canvas, paddles, ball);
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "white";
	ctx.fillRect(paddles.left.x, paddles.left.y, paddles.width, paddles.height);
	ctx.fillRect(paddles.right.x, paddles.right.y, paddles.width, paddles.height);
	ctx.beginPath();
	ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
	ctx.fill();
	requestAnimationFrame(() => loop(canvas, ctx, paddles, ball));
}

function startPong()
{
	const canvas = getCanevas();
	const ctx = canvas.getContext("2d");
	const paddles = getPaddles(canvas);
	const ball = getBall(canvas);
	canvas.addEventListener("keydown", function(event) {
		enableMove(event, paddles);
	});
	canvas.addEventListener("keyup", function(event) {
		disableMove(event, paddles);
	});
	// canvas.addEventListener("click", function() {
	// 	loop(canvas, ctx, paddles, ball);
	// 	console.log(ball);
	// 	console.log(paddles);
	// });
	loop(canvas, ctx, paddles, ball);
}

startPong();
