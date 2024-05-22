function getCanevas()
{
	const canvas = document.getElementById("canvas");
	return (canvas);
}

function createPaddle(canvas, position)
{
	let paddle = {
		height: canvas.height / 5,
		width: canvas.width / 50,
		x: 0,
		y: 0,
		speed: 7,
		move_top: 0,
		move_bot: 0,
	}
	if (position == "l")
	{
		paddle.x = canvas.width / 20;
		paddle.y = (canvas.height / 2) - (paddle.height / 2)
	}
	else if (position == "r")
	{
		paddle.x = canvas.width - (canvas.width / 20) - paddle.width;
		paddle.y = (canvas.height / 2) - (paddle.height / 2);
	}
	return (paddle);
}

function getPaddles(canvas)
{
	let paddles = {
		left: createPaddle(canvas, "l"),
		right: createPaddle(canvas, "r")
	}
	return (paddles);
}

function getBall(canvas)
{
	const ball = {
		radius: 20,
		x: canvas.width / 2,
		y: canvas.height / 2,
		dir_y: (Math.round(Math.random() * 100) % 2 != 1) ? -1 : 1,
		dir_x: (Math.round(Math.random() * 100) % 2 != 1) ? -1 : 1,
		speed: 8,
		out: 0
	}
	return (ball);
}

function actualizeBall(canvas, ball)
{
	console.log("Point!");
	ball.x = canvas.width / 2;
	ball.y = canvas.height / 2;
	ball.dir_y = (Math.round(Math.random() * 100) % 2 != 1) ? -1 : 1;
	ball.dir_x = (Math.round(Math.random() * 100) % 2 != 1) ? -1 : 1;
	ball.out = 0;
}

function enableMove(event, paddles)
{
	if (event.key == "w")
		paddles.left.move_top = 1;
	else if (event.key == "s")
		paddles.left.move_bot = 1;
	else if (event.key == "ArrowUp")
		paddles.right.move_top = 1;
	else if (event.key == "ArrowDown")
		paddles.right.move_bot = 1;
}

function disableMove(event, paddles)
{
	if (event.key == "w")
		paddles.left.move_top = 0;
	else if (event.key == "s")
		paddles.left.move_bot = 0;
	else if (event.key == "ArrowUp")
		paddles.right.move_top = 0;
	else if (event.key == "ArrowDown")
		paddles.right.move_bot = 0;
}

function movePaddles(canvas, paddles)
{
	if (paddles.left.move_top == 1 && paddles.left.y > 0)
		paddles.left.y -= paddles.left.speed;
	if (paddles.left.move_bot == 1 && paddles.left.y < (canvas.height - paddles.left.height))
		paddles.left.y += paddles.left.speed;
	if (paddles.right.move_top == 1 && paddles.right.y > 0)
		paddles.right.y -= paddles.right.speed;
	if (paddles.right.move_bot == 1 && paddles.right.y < (canvas.height - paddles.right.height))
		paddles.right.y += paddles.right.speed;
}

// si la balle est inferieur ou egale a x paddle gauche et superieur ou egale a padle top y et  einferieur ou egale a paddle top - height paddle ou balle est morte laisser la balle FAIRE LE REBOND sinon AVANCER
// si balle de x - radius <= paddle de x + width paddle
// {
// 	si inoaddle()
// 		REBOND
// 	ELSE
// 		MORT
// }

function moveBall(canvas, paddles, ball)
{
	if (ball.out == 1 || (ball.x - ball.radius) <= paddles.left.x || ball.x >= (paddles.right.x + paddles.right.width))
	{
		ball.out = 1;
		if (ball.x + (ball.radius * 2) <= 0 || (ball.x - (ball.radius * 2)) >= canvas.width)
			actualizeBall(canvas, ball);
	}
	if (ball.out == 0)
	{
		if (ball.y <= ball.radius || ball.y >= (canvas.height - ball.radius))
			ball.dir_y *= -1;
		if ((ball.x - ball.radius) <= (paddles.left.x + paddles.left.width) && (ball.y + ball.radius) >= paddles.left.y && (ball.y - ball.radius) <= (paddles.left.y + paddles.left.height))
		{
			ball.dir_x *= -1;
			ball.dir_y *= -1;
			ball.x += ball.speed * ball.dir_x;
			ball.y += ball.speed * ball.dir_y;
		}
		else if ((ball.x + ball.radius) >= paddles.right.x && (ball.y + ball.radius) >= paddles.right.y && (ball.y + ball.radius) <= (paddles.right.y + paddles.right.height))
		{
			ball.dir_x *= -1;
			ball.dir_y *= -1;
			ball.x += ball.speed * ball.dir_x;
			ball.y += ball.speed * ball.dir_y;
		}
		// if (ball.x <= (paddles.left.x + paddles.left.width + ball.radius))
		// {
		// 	if (ball.dir_y < 0 && (ball.y + ball.radius) >= paddles.left.y && ball.y <= (paddles.left.y + paddles.left.height)
		// 		|| ball.dir_y > 0 && (ball.y - ball.radius) >= paddles.left.y && ball.y <= (paddles.left.y + paddles.left.height))
		// 	{
		// 		ball.dir_x *= -1;
		// 		ball.dir_y *= -1;
		// 	}
		// }
		// if (ball.x >= (paddles.right.x - ball.radius))
		// {
		// 	if (ball.dir_y < 0 && (ball.y + ball.radius) >= paddles.right.y && ball.y <= (paddles.right.y + paddles.right.height)
		// 		|| ball.dir_y > 0 && (ball.y - ball.radius) >= paddles.right.y && ball.y <= (paddles.right.y + paddles.right.height))
		// 	{
		// 		ball.dir_x *= -1;
		// 		ball.dir_y *= -1;
		// 	}
		// }
	}
	ball.x += ball.speed * ball.dir_x;
	ball.y += ball.speed * ball.dir_y;
}

function display(canvas, ctx, paddles, ball)
{
	movePaddles(canvas, paddles);
	moveBall(canvas, paddles, ball);
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "white";
	ctx.fillRect(paddles.left.x, paddles.left.y, paddles.left.width, paddles.left.height);
	ctx.fillRect(paddles.right.x, paddles.right.y, paddles.right.width, paddles.right.height);
	ctx.beginPath();
	ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
	ctx.fill();
	requestAnimationFrame(() => display(canvas, ctx, paddles, ball));
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
	display(canvas, ctx, paddles, ball);
}

startPong();
