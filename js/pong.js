/////////////////////////
// Script
/////////////////////////
startPong();

function	startPong()
{
	let end = 0;
	const canvas = getCanvas();
	const ctx = canvas.getContext("2d");
	const paddles = getPaddles(canvas);
	const ball = getBall(canvas);
	canvas.addEventListener("keydown", function(event) {
		enableMove(event, paddles);
	});
	canvas.addEventListener("keyup", function(event) {
		disableMove(event, paddles);
	});
	loop(canvas, ctx, paddles, ball, end);
}

function	loop(canvas, ctx, paddles, ball, end)
{
	ctx.fillStyle = "#2F2F2F";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	if (end == 0)
	{
		movePaddles(canvas, paddles);
		moveBall(canvas, ctx, paddles, ball);
	}
	render(canvas, ctx, paddles, ball, end);
	requestAnimationFrame(() => loop(canvas, ctx, paddles, ball, end));
}

/////////////////////////
// Render
/////////////////////////
function	render(canvas, ctx, paddles, ball, end)
{
	ctx.fillStyle = "#FDFDFD";
	ctx.beginPath();
	ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
	ctx.fill();
	ctx.stroke();
	ctx.fillRect(paddles.left.x, paddles.left.y, paddles.width, paddles.height);
	ctx.fillRect(paddles.right.x, paddles.right.y, paddles.width, paddles.height);
	renderScore(canvas, ctx, paddles);
}

function	renderScore(canvas, ctx, paddles)
{
	const pictures = getPictures(paddles);
	if (pictures[0] != 0)
		ctx.drawImage(pictures[0], ((((canvas.width / 2) / 2) - pictures[1].width) - 5), 20);
	ctx.drawImage(pictures[1], ((canvas.width / 2) / 2) + 3, 20);
	if (pictures[2] != 0)
		ctx.drawImage(pictures[2], (canvas.width / 2) + ((((canvas.width / 2) / 2) - pictures[3].width) - 5), 20);
	ctx.drawImage(pictures[3], (canvas.width / 2) + ((canvas.width / 2) / 2) - 3, 20);
}

/////////////////////////
// Animation
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

function	moveBall(canvas, ctx, paddles, ball)
{
	if (ball.x <= -100 || ball.x >= (canvas.width + 100)) // OUT
		point(canvas, paddles, ball);
	else
		collision(paddles, ball);
	movePXbyPX(ctx, ball);
}

function	movePXbyPX(ctx, ball)
{
	let i = 0;
	while (i < ball.speed)
	{
		ctx.fillStyle = "#2E2E2E";
		ctx.beginPath();
		ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
		ctx.stroke();
		ball.x += ball.dir_x;
		ball.y += ball.dir_y;
		ctx.fillStyle = "#FDFDFD";
		ctx.beginPath();
		ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
		i++;
	}
}

/////////////////////////
// Point
/////////////////////////
function	point(canvas, paddles, ball)
{
	updateScore(canvas, paddles, ball);
	resetBall(canvas, ball);
}

function	updateScore(canvas, paddles, ball)
{
	if (ball.x <= -100 && paddles.right.score < 99)
		paddles.right.score++;
	else if (ball.x >= (canvas.width + 100) && paddles.left.score < 99)
		paddles.left.score++;
}

function	resetBall(canvas, ball)
{
	ball.x = canvas.width / 2;
	ball.y = canvas.height / 2;
	ball.dir_x = (Math.round(Math.random() * 100) % 2 != 1) ? -1 : 1;
	ball.dir_y = generateDirY();
}

/////////////////////////
// Collision
/////////////////////////
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

function angle(paddleStartY, height, ball)
{
	const len  = height / 3;
	const edge = len / 3;
	const fromTop = ball.y - paddleStartY;
	const fromBot = ball.y - (paddleStartY + height);
	if (fromTop >= 0 && fromTop <= len) // UPPER PART
	{
		if (fromTop >= 0 && fromTop <= edge) // TOP
			ball.dir_y += fromBot / 100;
		else
			ball.dir_y -= fromTop / 100;
	}
	else if (fromTop >= (len * 2) + 1 && fromTop <= height) // LOWER PART
	{
		if (fromTop > ((len * 2) + edge)) // BOTTOM
			ball.dir_y += fromTop / 100;
		else
			ball.dir_y -= fromBot / 100;
	}
	ball.dir_x *= -1;
}

function	collisionCorner(paddles, ball)
{
	if (ball.dir_x < 0) // GOING LEFT
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
	else if (ball.dir_x > 0) // GOING RIGHT
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

/////////////////////////
// Getters
/////////////////////////
function	getCanvas()
{
	const canvas = document.getElementById("canvas");
	return (canvas);
}

function	getPaddles(canvas)
{
	const height = canvas.height / 5;
	const width = canvas.width / 50;
	let paddles = {
		height: height,
		width: width,
		speed: 10,
		left: createPaddle(canvas, height, width, "l"),
		right: createPaddle(canvas, height, width, "r")
	}
	return (paddles);
}

function	createPaddle(canvas, height, width, position)
{
	let paddle = {
		x: 0,
		y: 0,
		move_top: 0,
		move_bot: 0,
		score: 0
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

function	getBall(canvas)
{
	let ball = {
		radius: 15,
		x: canvas.width / 2,
		y: canvas.height / 2,
		dir_x: (Math.round(Math.random() * 100) % 2 != 1) ? -1 : 1,
		dir_y: generateDirY(),
		speed: 10
	}
	return (ball);
}

function	generateDirY()
{
	const sign = (Math.round(Math.random() * 100) % 2 != 1) ? -1 : 1;
	return (Math.random() * sign);
}

function	getPictures(paddles)
{
	const numbers = getNumbers(paddles);
	let pictures = [0, 0, 0, 0];
	if (numbers[0] != 0)
	{
		pictures[0] = new Image();
		pictures[0].src = "../svg/" + numbers[0] + ".svg";
	}
	pictures[1] = new Image();
	pictures[1].src = "../svg/" + numbers[1] + ".svg";
	if (numbers[2] != 0)
	{
		pictures[2] = new Image();
		pictures[2].src = "../svg/" + numbers[2] + ".svg";
	}
	pictures[3] = new Image();
	pictures[3].src = "../svg/" + numbers[3] + ".svg";
	return (pictures);
}

function	getNumbers(paddles)
{
	let numbers = [
		Math.floor(paddles.left.score / 10),
		Math.floor(paddles.left.score % 10),
		Math.floor(paddles.right.score / 10),
		Math.floor(paddles.right.score % 10)
	];
	return (numbers);
}
