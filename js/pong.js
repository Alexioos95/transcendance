/////////////////////////
// Getters
/////////////////////////
function	getCanevas()
{
	const canvas = document.getElementById("canvas");
	return (canvas);
}

/////////////////////////
// Paddles
/////////////////////////
function	createPaddle(canvas, height, width, position)
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
		paddle.y = (canvas.height / 2) - (height / 2);
	}
	else if (position == "r")
	{
		paddle.x = canvas.width - (canvas.width / 20) - width;
		paddle.y = (canvas.height / 2) - (height / 2);
	}
	return (paddle);
}

function	getPaddles(canvas)
{
	const height = canvas.height / 5;
	const width = canvas.width / 50;
	let paddles = {
		height: height,
		width: width,
		speed: 7,
		left: createPaddle(canvas, height, width, "l"),
		right: createPaddle(canvas, height, width, "r")
	}
	return (paddles);
}

/////////////////////////
// Paddles - Movements
/////////////////////////
function	enableMove(event, paddles)
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

function	disableMove(event, paddles)
{
	if (event.key == "w" || event.key == "W")
		paddles.left.move_top = 0;
	else if (event.key == "s" || event.key == "S")
		paddles.left.move_bot = 0;
	else if (event.key == "ArrowUp")
		paddles.right.move_top = 0;
	else if (event.key == "ArrowDown")
		paddles.right.move_bot = 0;
}

function	movePaddles(canvas, paddles)
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

/////////////////////////
// Ball
/////////////////////////
function	getBall(canvas)
{
	let ball = {
		radius: 15,
		x: canvas.width / 2,
		y: canvas.height / 2,
		dir_x: (Math.round(Math.random() * 100) % 2 != 1) ? -1 : 1,
		dir_y: generateDirY(),
		speed: 10,
	}
	return (ball);
}

function	generateDirY()
{
	const sign = (Math.round(Math.random() * 100) % 2 != 1) ? -1 : 1;
	return (Math.random() * sign);
}

function	resetBall(canvas, ball)
{
	console.log("Point!");
	ball.x = canvas.width / 2;
	ball.y = canvas.height / 2;
	ball.dir_x = (Math.round(Math.random() * 100) % 2 != 1) ? -1 : 1;
	ball.dir_y = generateDirY();
}

function	movePXbyPX(ctx, ball)
{
	let i = 0;
	while (i < ball.speed)
	{
		ctx.fillStyle = "#2E2E2E";
		ctx.beginPath();
		ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
		ctx.fill();
		ctx.stroke();
		ball.x += 1 * ball.dir_x;
		ball.y += 1 * ball.dir_y;
		ctx.fillStyle = "#FDFDFD";
		ctx.beginPath();
		ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
		ctx.fill();
		i += 1;
	}
}

function	moveBall(canvas, ctx, paddles, ball)
{
	if (ball.x <= -100 || ball.x >= (canvas.width + 100)) // OUT
		resetBall(canvas, ball);
	collision(paddles, ball);
	movePXbyPX(ctx, ball);
}

/////////////////////////
// Collisions
/////////////////////////
function	collisionCorner(paddles, ball)
{
	if (ball.dir_x > 0)
	{
		if ((ball.y - ball.radius) <= (paddles.right.y + paddles.height) && ball.y >= (paddles.right.y + paddles.height)
			&& (ball.x + ball.radius) >= paddles.right.x && ball.x <= paddles.right.x) // BOTTOM LEFT CORNER OF RIGHT PADDLE
		{
			ball.dir_x *= -1;
			if (ball.dir_y < 0)
				ball.dir_y *= -1;
		}
		else if ((ball.y + ball.radius) >= paddles.right.y && ball.y <= paddles.right.y
			&& (ball.x + ball.radius) >= paddles.right.x && ball.x <= paddles.right.x) // TOP LEFT CORNER OF RIGHT PADDLED
		{
			ball.dir_x *= -1;
			if (ball.dir_y > 0)
				ball.dir_y *= -1;
		}
	}
	else if (ball.dir_x < 0)
	{
		if ((ball.y - ball.radius) <= (paddles.left.y + paddles.height) && ball.y >= (paddles.left.y + paddles.height)
			&& (ball.x - ball.radius) <= (paddles.left.x + paddles.width) && ball.x >= (paddles.left.x + paddles.width)) // BOTTOM RIGHT CORNER OF LEFT PADDLE
		{
			ball.dir_x *= -1;
			if (ball.dir_y < 0)
				ball.dir_y *= -1;
		}
		else if ((ball.y + ball.radius) >= paddles.left.y && ball.y <= paddles.left.y
			&& (ball.x - ball.radius) <= (paddles.left.x + paddles.width) && ball.x >= (paddles.left.x + paddles.width)) // TOP RIGHT CORNER OF LEFT PADDLE
		{
			ball.dir_x *= -1;
			if (ball.dir_y > 0)
				ball.dir_y *= -1;
		}
	}
}

function	collisionSide(paddles, ball)
{
	if (ball.dir_x < 0 && (ball.x - ball.radius) <= (paddles.left.x + paddles.width)
	&& ball.y >= paddles.left.y && ball.y <= (paddles.left.y + paddles.height)) // TOUCH SURFACE LEFT PADDLE
		angle(paddles.left.y, paddles.height, ball);
	else if (ball.dir_x > 0 && (ball.x + ball.radius) >= paddles.right.x
	&& ball.y >= paddles.right.y && ball.y <= (paddles.right.y + paddles.height)) // TOUCH SURFACE RIGHT PADDLE
		angle(paddles.right.y, paddles.height, ball);
	else
		collisionCorner(paddles, ball);
}

function	collisionTop(paddles, ball)
{
	if (ball.dir_x < 0 && ball.y < paddles.left.y && (ball.y + ball.radius) >= paddles.left.y) // ABOVE LEFT PADDLE
	{
		if ((ball.x + ball.radius) >= paddles.left.x && (ball.x - ball.radius) <= (paddles.left.x + paddles.width)) // IN SURFACE
			ball.dir_y *= -1;
	}
	else if (ball.dir_x > 0 && ball.y < paddles.right.y && (ball.y + ball.radius) >= paddles.right.y) // ABOVE RIGHT PADDLE
	{
		if ((ball.x - ball.radius) <= (paddles.right.x + paddles.width) && (ball.x + ball.radius) >= paddles.right.x) // IN SURFACE
			ball.dir_y *= -1;
	}
}

function	collisionBot(paddles, ball)
{
	if (ball.dir_x < 0 && ball.y > (paddles.left.y + paddles.height) && (ball.y - ball.radius) <= (paddles.left.y + paddles.height)) // UNDER LEFT PADDLE
	{
		if ((ball.x + ball.radius) >= paddles.left.x && (ball.x - ball.radius) <= (paddles.left.x + paddles.width)) // IN SURFACE
			ball.dir_y *= -1;
	}
	else if (ball.dir_x > 0 && (ball.y > (paddles.right.y + paddles.height) && (ball.y - ball.radius) <= (paddles.right.y + paddles.height))) // UNDER RIGHT PADDLE
	{
		if ((ball.x + ball.radius) >= paddles.right.x && (ball.x - ball.radius) <= (paddles.right.x + paddles.width)) // IN SURFACE
				ball.dir_y *= -1;
	}
}

function	collision(paddles, ball)
{
	if (ball.y <= ball.radius || ball.y >= (canvas.height - ball.radius)) // WALL
		ball.dir_y *= -1;
	else if (ball.x >= (paddles.left.x + paddles.width) && ball.x <= paddles.right.x) // FROM SIDE
		collisionSide(paddles, ball);
	else if (ball.dir_y > 0) // FROM TOP
		collisionTop(paddles, ball);
	else if (ball.dir_y < 0) // FROM BOTTOM
		collisionBot(paddles, ball);
}

function angle(paddleStartY, height, ball)
{
	const len  = height / 3;
	const ballY = ball.y - paddleStartY;
	if (ballY >= 0 && ballY <= len)
		ball.dir_y -= (ball.y + (height - paddleStartY)) / 100;
	else if (ballY >= (len * 2) + 1 && ballY <= height)
		ball.dir_y += ballY / 100;
	ball.dir_x *= -1;
}

/////////////////////////
// Script
/////////////////////////
function	render(ctx, paddles, ball)
{
	ctx.fillStyle = "#FDFDFD";
	ctx.beginPath();
	ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
	ctx.fill();
	ctx.stroke();
	ctx.fillRect(paddles.left.x, paddles.left.y, paddles.width, paddles.height);
	ctx.fillRect(paddles.right.x, paddles.right.y, paddles.width, paddles.height);
}

function	loop(canvas, ctx, paddles, ball)
{
	ctx.fillStyle = "#2F2F2F";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	movePaddles(canvas, paddles);
	moveBall(canvas, ctx, paddles, ball);
	render(ctx, paddles, ball);
	requestAnimationFrame(() => loop(canvas, ctx, paddles, ball));
}

function	startPong()
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
