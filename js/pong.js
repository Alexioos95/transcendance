/////////////////////////
// Script
/////////////////////////
// startPong();

function	startPong()
{
	let game = {
		canvas: getCanvas(),
		ctx: canvas.getContext("2d"),
		paddles: getPaddles(canvas, undefined),
		ball: getBall(canvas)
	}
	game.canvas.focus();
	game.canvas.addEventListener("keydown", function(event) { enableMove(event, game.paddles); });
	game.canvas.addEventListener("keyup", function(event) { disableMove(event, game.paddles); });
	// document.defaultView.addEventListener("resize", function() {
	// 	console.log("CALL");
	// 	const canvas = document.getElementById("canvas");
	// 	if (canvas !== undefined)
	// 		canvas.remove();
	// 	game.canvas = getCanvas();
	// 	game.ctx = game.canvas.getContext("2d");
	// 	game.paddles = actualizePaddles(game.canvas, game.paddles);
	// 	game.canvas.addEventListener("keydown", function(event) { enableMove(event, game.paddles); });
	// 	game.canvas.addEventListener("keyup", function(event) { disableMove(event, game.paddles); });
	// });
	loop(game);
}

function	loop(game)
{
	game.ctx.fillStyle = "#2F2F2F";
	game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
	if (game.paddles.left.score < 11 && game.paddles.right.score < 11)
	{
		movePaddles(game.canvas, game.paddles)
		moveBall(game);
		render(game);
		requestAnimationFrame(() => loop(game));
	}
	else
		renderFinalScore(game.ctx, game.paddles);
}

function	renderFinalScore(ctx, paddles)
{
	const pictures = getPictures(paddles);
	const dim = getDimensions(canvas, pictures, paddles);
	if (pictures[0] != 0)
		ctx.drawImage(pictures[0], dim.leftWidth[0], dim.leftHeight, dim.leftDimensions, dim.leftDimensions);
	ctx.drawImage(pictures[1], dim.leftWidth[1], dim.leftHeight, dim.leftDimensions, dim.leftDimensions);
	if (pictures[2] != 0)
		ctx.drawImage(pictures[2], dim.rightWidth[0], dim.rightHeight, dim.rightDimensions, dim.rightDimensions);
	ctx.drawImage(pictures[3], dim.rightWidth[1], dim.rightHeight, dim.rightDimensions, dim.rightDimensions);
}

/////////////////////////
// Render
/////////////////////////
function	render(game)
{
	game.ctx.fillStyle = "#FDFDFD";
	renderPaddles(game.ctx, game.paddles);
	renderBall(game.ctx, game.ball);
	renderScore(game);
}

function	renderPaddles(ctx, paddles)
{
	ctx.fillRect(paddles.left.x, paddles.left.y, paddles.width, paddles.height);
	ctx.fillRect(paddles.right.x, paddles.right.y, paddles.width, paddles.height);
}

function	renderBall(ctx, ball)
{
	ctx.beginPath();
	ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
	ctx.fill();
	ctx.stroke();
}

function	renderScore(game)
{
	const pictures = getPictures(game.paddles);
	if (pictures[0] != 0)
		game.ctx.drawImage(pictures[0], ((((game.canvas.width / 2) / 2) - pictures[1].width) - 5), 20);
	game.ctx.drawImage(pictures[1], ((game.canvas.width / 2) / 2) + 3, 20);
	if (pictures[2] != 0)
		game.ctx.drawImage(pictures[2], (game.canvas.width / 2) + ((((game.canvas.width / 2) / 2) - pictures[3].width) - 5), 20);
	game.ctx.drawImage(pictures[3], (game.canvas.width / 2) + ((game.canvas.width / 2) / 2) - 3, 20);
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

function	moveBall(game)
{
	if (game.ball.x <= -100 || game.ball.x >= (canvas.width + 100))
		point(game);
	else
		collision(game.paddles, game.ball);
	movePXbyPX(game);
}

function	movePXbyPX(game)
{
	let i = 0;
	while (i < game.ball.speed)
	{
		game.ctx.fillStyle = "#2E2E2E";
		game.ctx.beginPath();
		game.ctx.arc(game.ball.x, game.ball.y, game.ball.radius, 0, 2 * Math.PI);
		game.ctx.stroke();
		game.ball.x += game.ball.dir_x;
		game.ball.y += game.ball.dir_y;
		game.ctx.fillStyle = "#FDFDFD";
		game.ctx.beginPath();
		game.ctx.arc(game.ball.x, game.ball.y, game.ball.radius, 0, 2 * Math.PI);
		i++;
	}
}

/////////////////////////
// Point
/////////////////////////
function	point(game)
{
	updateScore(game);
	resetBall(game);
}

function	updateScore(game)
{
	if (game.ball.x <= -100 && game.paddles.right.score < 99)
		game.paddles.right.score++;
	else if (game.ball.x >= (canvas.width + 100) && game.paddles.left.score < 99)
		game.paddles.left.score++;
}

function	resetBall(game)
{
	game.ball.x = game.canvas.width / 2;
	game.ball.y = game.canvas.height / 2;
	game.ball.dir_x = (Math.round(Math.random() * 100) % 2 != 1) ? -1 : 1;
	game.ball.dir_y = generateDirY();
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
	const wrapper = document.getElementById("canvas");
	// const wrapper = document.getElementsByClassName("wrapper-canvas")[0];
	// const width = wrapper.offsetWidth;
	// const height = wrapper.offsetHeight;
	// const canvas = document.createElement("canvas");
	// canvas.setAttribute("id", "canvas");
	// canvas.setAttribute("width", width);
	// canvas.setAttribute("height", height);
	// canvas.setAttribute("tabindex", "0");
	// wrapper.appendChild(canvas);
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
		right: createPaddle(canvas, height, width, "r"),
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

function	actualizePaddles(canvas, previousIteration)
{
	let paddles = {
		height: canvas.height / 5,
		width: canvas.width / 50,
		speed: 10,
		left: previousIteration.left,
		right: previousIteration.right,
	}
	paddles.left.x = canvas.width / 20;
	paddles.right.x = canvas.width - (canvas.width / 20) - paddles.width;
	return (paddles);
}

function	getBall(canvas)
{
	let ball = {
		radius: 15,
		x: canvas.width / 2,
		y: canvas.height / 2,
		dir_x: (Math.round(Math.random() * 100) % 2 != 1) ? -1 : 1,
		dir_y: generateDirY(),
		speed: canvas.width / 100
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
	const path = "../svg/number/";
	const extension = ".svg";

	if (numbers[0] != 0)
	{
		pictures[0] = new Image();
		pictures[0].src = path + numbers[0] + extension;
	}
	pictures[1] = new Image();
	pictures[1].src = path + numbers[1] + extension;
	if (numbers[2] != 0)
	{
		pictures[2] = new Image();
		pictures[2].src = path + numbers[2] + extension;
	}
	pictures[3] = new Image();
	pictures[3].src = path + numbers[3] + extension;
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

function	getDimensions(canvas, pictures, paddles)
{
	let dimensions = {
		leftDimensions: canvas.height / 5,
		leftHeight: (canvas.height / 2) - ((canvas.height / 5) / 2),
		rightDimensions: pictures[1].height,
		rightHeight: (canvas.height / 2) - (pictures[3].height / 2),
		leftWidth: [0, 0],
		rightWidth: [0, 0]
	};
	if (paddles.right.score > paddles.left.score)
	{
		dimensions.leftDimensions = pictures[1].height;
		dimensions.rightDimensions = canvas.height / 5;
		dimensions.leftHeight = (canvas.height / 2) - (pictures[3].height / 2);
		dimensions.rightHeight = (canvas.height / 2) - ((canvas.height / 5) / 2);
	}
	dimensions.leftWidth[0] = ((canvas.width / 2) / 2) - (dimensions.leftDimensions + 20);
	dimensions.leftWidth[1] = ((canvas.width / 2) / 2);
	dimensions.rightWidth[0] = (canvas.width / 2) + ((canvas.width / 2) / 2) - (dimensions.rightDimensions + 20);
	dimensions.rightWidth[1] = (canvas.width / 2) + ((canvas.width / 2) / 2);
	return (dimensions);
}
