"use strict";
/////////////////////////
// Script
/////////////////////////
function	getPongStruct()
{
	const struct = {
		name: "PONG",
		canvas: undefined,
		ctx: undefined,
		paddles: undefined,
		scores: [0, 0],
		ball: undefined,
		run: startPong,
		online: false,
		socket: undefined,
		running: 0
	};
	return (struct);
}

async function	startPong(struct)
{
	initPongStruct(struct, struct.screen.game, struct.screen.wrapperCanvas);
	setupPongEventListeners(struct, struct.screen.game, struct.wrapperCanvas);
	struct.screen.game.canvas.focus();
	if (struct.screen.game.online === false)
		loop(struct, struct.screen.game);
}

function	initPongStruct(struct, game, wrapperCanvas)
{
	game.canvas = getCanvas(wrapperCanvas);
	game.ctx = game.canvas.getContext("2d");
	game.paddles = getPaddles(game.canvas);
	game.ball = getBall(game.canvas);
	game.running = 1;
	if (game.online === true)
	{
		let start = true;
		game.socket = new WebSocket("wss://" + window.location.hostname + ":4433/ws/pong/");

		game.socket.addEventListener("error", function(event) {
			game.running = 0;
			rejectCoin(struct.gameForm);
			struct.gameForm.inputs[2].disabled = true;
			console.error("Critical error on Pong's websocket");
		});
		game.socket.addEventListener("message", function(event) {
			const data = JSON.parse(event.data);

			if (data.type === "game_update")
			{
				const paddleLeft = getPixels(game.canvas, parseFloat(data.game_state.x_paddleLeft), parseFloat(data.game_state.y_paddleLeft));
				const paddleRight = getPixels(game.canvas, parseFloat(data.game_state.x_paddleRight), parseFloat(data.game_state.y_paddleRight));
				const ball = getPixels(game.canvas, parseFloat(data.game_state.ball.x), parseFloat(data.game_state.ball.y));
				const obj = { key: undefined };

				console.log(ball);
				if (start === true)
				{
					const span1 = document.createElement("span");
					const span2 = document.createElement("span");
					span1.classList.add("canvas-user-1");
					span2.classList.add("canvas-user-2");
					span1.innerHTML = data.nameLeft;
					span2.innerHTML = data.nameRight;
					struct.screen.wrapperCanvas.appendChild(span1);
					struct.screen.wrapperCanvas.appendChild(span2);
					struct.screen.playerOnControls[0].innerHTML = data.nameLeft;
					struct.screen.playerOnControls[1].innerHTML = data.nameRight;
				}
				start = false;
				game.paddles.left.x = paddleLeft[0];
				game.paddles.left.y = paddleLeft[1];
				game.paddles.right.x = paddleRight[0];
				game.paddles.right.y = paddleRight[1];
				game.ball.x = ball[0];
				game.ball.y = ball[1];
				game.scores = [parseInt(data.game_state.ball.game_score_paddleLeft, 10), parseInt(data.game_state.ball.game_score_paddleRight, 10)];
				game.ctx.fillStyle = "#2F2F2F";
				game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
				render(game);

				if ((game.paddles.left.move_top === 1 && game.paddles.left.move_bot === 1)
					|| (game.paddles.right.move_top === 1 && game.paddles.right.move_bot === 1)
					|| (game.paddles.left.move_top === 1 && game.paddles.right.move_bot === 1)
					|| (game.paddles.left.move_bot === 1 && game.paddles.right.move_top === 1))
					;
				else if (game.paddles.right.move_top === 1 || game.paddles.left.move_top === 1)
					obj.key = "top";
				else if (game.paddles.right.move_bot === 1 || game.paddles.left.move_bot === 1)
					obj.key = "bot";
				if (obj.key !== undefined)
					game.socket.send(JSON.stringify(obj));
			}
			else if (data.type === "game_over")
			{
				game.running = 0;
				if (game.socket !== undefined)
					game.socket.close(1000);
				game.ctx.fillStyle = "#2F2F2F";
				game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
				game.scores = [parseInt(data.game_score_paddleLeft, 10), parseInt(data.game_score_paddleRight, 10)];
				renderFinalScore(game);
				document.getElementsByClassName("game")[0].removeEventListener("mouseup", mouseUpEvent(struct.screen.game.paddles));
				endGame(struct);
			}
		});
	}
}

function	setupPongEventListeners(struct, game, wrapperCanvas)
{
	// Keyboard
	game.canvas.addEventListener("keydown", function(event) { enableMove(event, game.canvas, game.paddles); });
	game.canvas.addEventListener("keyup", function(event) { disableMove(event, game.paddles); });
	// Mouse
	game.canvas.addEventListener("mousedown", function(event) { enableMove(event, game.canvas, game.paddles); });
	game.canvas.addEventListener("mousemove", function(event) { enableMove(event, game.canvas, game.paddles); });
	game.canvas.addEventListener("mouseup", function(event) { disableMove(event, game.paddles); });
	window.addEventListener("mouseup", function() { mouseUpEvent(game) });
	// Touchscreen
	game.canvas.addEventListener("touchstart", function(event) { enableMove(event, game.canvas, game.paddles); });
	game.canvas.addEventListener("touchmove", function(event) { enableMove(event, game.canvas, game.paddles); });
	game.canvas.addEventListener("touchend", function(event) { disableMove(event, game.paddles); });
	game.canvas.addEventListener("touchcancel", function(event) { disableMove(event, game.paddles); });
	// Resizing
	document.defaultView.addEventListener("resize", function() { resize(game, wrapperCanvas); });
	// Focus
	game.canvas.addEventListener("focus", function() { struct.screen.wrapperScreen.classList.add("active"); });
	game.canvas.addEventListener("blur", function() { struct.screen.wrapperScreen.classList.remove("active"); });
}

async function	loop(struct, game)
{
	game.ctx.fillStyle = "#2F2F2F";
	game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
	if (game.running === 1 && game.scores[0] < 11 && game.scores[1] < 11)
	{
		movePaddles(game.canvas, game.paddles);
		moveBall(game);
		render(game);
		requestAnimationFrame(() => loop(struct, game));
	}
	else
	{
		game.running = 0;
		renderFinalScore(game);
		document.getElementsByClassName("game")[0].removeEventListener("mouseup", mouseUpEvent(struct.screen.game.paddles));
		await endGame(struct);
	}
}

function	renderFinalScore(game)
{
	const pictures = getPictures(game.scores);
	const dim = getDimensions(game, pictures);

	if (pictures[0] !== 0)
		game.ctx.drawImage(pictures[0], dim.leftWidth[0], dim.leftHeight, dim.leftDimensions, dim.leftDimensions);
	game.ctx.drawImage(pictures[1], dim.leftWidth[1], dim.leftHeight, dim.leftDimensions, dim.leftDimensions);
	if (pictures[2] !== 0)
		game.ctx.drawImage(pictures[2], dim.rightWidth[0], dim.rightHeight, dim.rightDimensions, dim.rightDimensions);
	game.ctx.drawImage(pictures[3], dim.rightWidth[1], dim.rightHeight, dim.rightDimensions, dim.rightDimensions);
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
	const pictures = getPictures(game.scores);

	if (pictures[0] !== 0)
		game.ctx.drawImage(pictures[0], ((game.canvas.width / 2) / 2) - pictures[1].width - 4, 20);
	game.ctx.drawImage(pictures[1], ((game.canvas.width / 2) / 2) + 2, 20);
	if (pictures[2] !== 0)
		game.ctx.drawImage(pictures[2], (game.canvas.width) - ((game.canvas.width / 2) / 2) - (pictures[3].width) - 2, 20);
	game.ctx.drawImage(pictures[3], (game.canvas.width) - ((game.canvas.width / 2) / 2) + 4, 20);
}

function	resize(game, wrapper)
{
	if (game.canvas === undefined)
		return ;
	const oldValues = {
		width: game.canvas.width,
		height: game.canvas.height
	};
	setCanvasDimensions(game.canvas, wrapper);
	resizePaddles(oldValues, game.canvas, game.paddles);
	resizeBall(oldValues, game.canvas, game.ball);
	if (game.scores[0] > 10 || game.scores[1] > 10)
	{
		game.ctx.fillStyle = "#2F2F2F";
		game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
		renderFinalScore(game);
	}
}

function	resizePaddles(oldValues, canvas, paddles)
{
	const percentOldLeft = paddles.left.y / oldValues.height * 100;
	const percentOldRight = paddles.right.y / oldValues.height * 100;

	paddles.height = canvas.height / 5;
	paddles.width = canvas.width / 50;
	paddles.left.x = canvas.width / 20;
	paddles.left.y = canvas.height / 100 * percentOldLeft;
	paddles.left.mouse = 0;
	paddles.right.x = canvas.width - (canvas.width / 20) - paddles.width;
	paddles.right.y = canvas.height / 100 * percentOldRight;
	paddles.right.mouse = 0;
}

function	resizeBall(oldValues, canvas, ball)
{
	const percentOldX = ball.x / oldValues.width * 100;
	const percentOldY = ball.y / oldValues.height * 100;

	ball.x = canvas.width / 100 * percentOldX;
	ball.y = canvas.height / 100 * percentOldY;
	ball.radius = canvas.width / 66;
	ball.speed = canvas.width / 100;
}

/////////////////////////
// Animation
/////////////////////////
function	enableMove(event, canvas, paddles)
{
	if (event.type !== "mousedown" && event.type !== "mousemove")
		event.preventDefault();
	if (event.type === "keydown")
	{
		if (event.key === "w" || event.key === "W")
			paddles.left.move_top = 1;
		else if (event.key === "s" || event.key === "S")
			paddles.left.move_bot = 1;
		else if (event.key === "ArrowUp")
			paddles.right.move_top = 1;
		else if (event.key === "ArrowDown")
			paddles.right.move_bot = 1;
	}
	else if (event.type === "mousedown")
	{
		if (event.offsetX < canvas.width / 2)
			paddles.left.mouse = 1;
		else
			paddles.right.mouse = 1;
	}
	else if (event.type === "mousemove")
	{
		if (paddles.left.mouse === 1)
		{
			paddles.left.event = event;
			paddles.left.move_top = 0;
			paddles.left.move_bot = 0;
			if (event.movementY < 0 && event.layerY < (paddles.left.y + paddles.height / 2))
				paddles.left.move_top = 1;
			else if (event.movementY > 0 && event.layerY > (paddles.left.y + paddles.height / 2))
				paddles.left.move_bot = 1;
		}
		else if (paddles.right.mouse === 1)
		{
			paddles.right.event = event;
			paddles.right.move_top = 0;
			paddles.right.move_bot = 0;
			if (event.movementY < 0 && event.layerY < (paddles.right.y + paddles.height / 2))
				paddles.right.move_top = 1;
			else if (event.movementY > 0 && event.layerY > (paddles.right.y + paddles.height / 2))
				paddles.right.move_bot = 1;
		}
	}
	else if (event.type === "touchstart")
	{
		if (event.changedTouches[0].clientX < canvas.width / 2 && paddles.left.touchID === -1)
		{
			paddles.left.touchID = event.changedTouches[0].identifier;
			paddles.left.event = event.changedTouches[0];
		}
		else if (event.changedTouches[0].clientX > canvas.width / 2 && paddles.right.touchID === -1)
		{
			paddles.right.touchID = event.changedTouches[0].identifier;
			paddles.right.event = event.changedTouches[0];
		}
	}
	else if (event.type === "touchmove")
	{
		for (let i = 0; i < event.changedTouches.length; i++)
		{
			if (event.changedTouches[i].identifier === paddles.left.touchID)
			{
				paddles.left.move_top = 0;
				paddles.left.move_bot = 0;
				paddles.left.event = event.changedTouches[i];
				if (event.changedTouches[i].clientY + paddles.speed < (paddles.left.y + paddles.height / 2))
					paddles.left.move_top = 1;
				else if (event.changedTouches[i].clientY - paddles.speed > (paddles.left.y + paddles.height / 2))
					paddles.left.move_bot = 1;
			}
			else if (event.changedTouches[i].identifier === paddles.right.touchID)
			{
				paddles.right.move_top = 0;
				paddles.right.move_bot = 0;
				paddles.right.event = event.changedTouches[i];
				if (event.changedTouches[i].clientY + paddles.speed < (paddles.right.y + paddles.height / 2))
					paddles.right.move_top = 1;
				else if (event.changedTouches[i].clientY - paddles.speed > (paddles.right.y + paddles.height / 2))
					paddles.right.move_bot = 1;
			}
		}
	}
}

function	mouseUpEvent(game)
{
	if (game !== undefined && game.name === "PONG" && game.paddles !== undefined)
	{
		if (game.paddles.left !== undefined && game.paddles.left.mouse === 1)
		{
			game.paddles.left.mouse = 0;
			game.paddles.left.move_top = 0;
			game.paddles.left.move_bot = 0;
		}
		if (game.paddles.right !== undefined && game.paddles.right.mouse === 1)
		{
			game.paddles.right.mouse = 0;
			game.paddles.right.move_top = 0;
			game.paddles.right.move_bot = 0;
		}
	}
}

function	disableMove(event, paddles)
{
	if (event.type === "keyup")
	{
		if (event.key === "w" || event.key === "W")
			paddles.left.move_top = 0;
		else if (event.key === "s" || event.key === "S")
			paddles.left.move_bot = 0;
		else if (event.key === "ArrowUp")
			paddles.right.move_top = 0;
		else if (event.key === "ArrowDown")
			paddles.right.move_bot = 0;
	}
	else if (event.type === "mouseup")
	{
		paddles.left.mouse = 0;
		paddles.left.move_top = 0;
		paddles.left.move_bot = 0;
		paddles.right.mouse = 0;
		paddles.right.move_top = 0;
		paddles.right.move_bot = 0;
	}
	else if (event.type === "touchend" || event.type === "touchcancel")
	{
		if (event.changedTouches[0].identifier === paddles.left.touchID)
		{
			paddles.left.touchID = -1;
			paddles.left.move_top = 0;
			paddles.left.move_bot = 0;
		}
		else if (event.changedTouches[0].identifier === paddles.right.touchID)
		{
			paddles.right.touchID = -1;
			paddles.right.move_top = 0;
			paddles.right.move_bot = 0;
		}
	}
}

function	movePaddles(canvas, paddles)
{
	if (paddles.left.mouse === 1 && paddles.left.event !== undefined)
	{
		if (paddles.left.move_top === 1 && paddles.left.y + (paddles.height / 2) < paddles.left.event.layerY)
			paddles.left.move_top = 0;
		else if (paddles.left.move_bot === 1 && paddles.left.y + (paddles.height / 2) > paddles.left.event.layerY)
			paddles.left.move_bot = 0;
	}
	else if (paddles.left.touchID !== -1 && paddles.right.event !== undefined)
	{
		if (paddles.left.move_top === 1 && paddles.left.y + (paddles.height / 2) < paddles.left.event.clientY)
			paddles.left.move_top = 0;
		else if (paddles.left.move_bot === 1 && paddles.left.y + (paddles.height / 2) > paddles.left.event.clientY)
			paddles.left.move_bot = 0;
	}
	if (paddles.right.mouse === 1 && paddles.right.event !== undefined)
	{
		if (paddles.right.move_top === 1 && paddles.right.y + (paddles.height / 2) < paddles.right.event.layerY)
			paddles.right.move_top = 0;
		else if (paddles.right.move_bot === 1 && paddles.right.y + (paddles.height / 2) > paddles.right.event.layerY)
			paddles.right.move_bot = 0;
	}
	else if (paddles.right.touchID !== -1 && paddles.right.event !== undefined)
	{
		if (paddles.right.move_top === 1 && paddles.right.y + (paddles.height / 2) < paddles.right.event.clientY)
			paddles.right.move_top = 0;
		else if (paddles.right.move_bot === 1 && paddles.right.y + (paddles.height / 2) > paddles.right.event.clientY)
			paddles.right.move_bot = 0;
	}
	if (paddles.left.move_top === 1 && paddles.left.y > 0)
		paddles.left.y -= paddles.speed;
	if (paddles.left.move_bot === 1 && paddles.left.y < (canvas.height - paddles.height))
		paddles.left.y += paddles.speed;
	if (paddles.right.move_top === 1 && paddles.right.y > 0)
		paddles.right.y -= paddles.speed;
	if (paddles.right.move_bot === 1 && paddles.right.y < (canvas.height - paddles.height))
		paddles.right.y += paddles.speed;
}

function	moveBall(game)
{
	if (game.ball.x <= -200 || game.ball.x >= (game.canvas.width + 200))
		point(game);
	else
		collision(game.canvas, game.paddles, game.ball);
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
	if (game.ball.x <= -100 && game.scores[1] < 11)
		game.scores[1]++;
	else if (game.ball.x >= (canvas.width + 100) && game.scores[0] < 11)
		game.scores[0]++;
}

function	resetBall(game)
{
	if (game.scores[0] < 11 && game.scores[1] < 11)
	{
		game.ball.x = game.canvas.width / 2;
		game.ball.y = game.canvas.height / 2;
	}
	else
	{
		game.ball.x = 0 - game.ball.radius;
		game.ball.y = 0 - game.ball.radius;
	}
	game.ball.dir_x = (Math.round(Math.random() * 100) % 2 !== 1) ? -1 : 1;
	game.ball.dir_y = generateDirY();
}

/////////////////////////
// Collision
/////////////////////////
function	collision(canvas, paddles, ball)
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
function	getCanvas(wrapper)
{
	const canvas = document.createElement("canvas");

	canvas.classList.add("pong");
	canvas.setAttribute("id", "canvas");
	canvas.setAttribute("tabindex", "0");
	setCanvasDimensions(canvas, wrapper);
	wrapper.appendChild(canvas);
	return (canvas);
}

function	setCanvasDimensions(canvas, wrapper)
{
	if (wrapper === undefined)
		return ;
	const width = wrapper.clientWidth;
	const height = wrapper.clientHeight;

	canvas.setAttribute("width", width);
	canvas.setAttribute("height", height);
}

function	getPaddles(canvas)
{
	const height = canvas.height / 5;
	const width = canvas.width / 50;
	const paddles =
	{
		height: height,
		width: width,
		speed: canvas.width / 100,
		left: createPaddle(canvas, height, width, "l"),
		right: createPaddle(canvas, height, width, "r"),
	};
	return (paddles);
}

function	createPaddle(canvas, height, width, position)
{
	const paddle = {
		x: 0,
		y: 0,
		move_top: 0,
		move_bot: 0,
		mouse: 0,
		event: undefined,
		touchID: -1
	};

	if (position === "l")
	{
		paddle.x = canvas.width / 20;
		paddle.y = (canvas.height / 2) - (height / 2);
	}
	else if (position === "r")
	{
		paddle.x = canvas.width - (canvas.width / 20) - width;
		paddle.y = (canvas.height / 2) - (height / 2);
	}
	return (paddle);
}

function	getBall(canvas)
{
	const ball = {
		radius: canvas.width / 66,
		x: canvas.width / 2,
		y: canvas.height / 2,
		dir_x: (Math.round(Math.random() * 100) % 2 !== 1) ? -1 : 1,
		dir_y: generateDirY(),
		speed: canvas.width / 100
	}
	return (ball);
}

function	generateDirY()
{
	const sign = (Math.round(Math.random() * 100) % 2 !== 1) ? -1 : 1;
	return (Math.random() * sign);
}

function	getPictures(score)
{
	const numbers = getNumbers(score);
	const pictures = [0, 0, 0, 0];
	const path = "/svg/number/";
	const extension = ".svg";

	if (numbers[0] !== 0)
	{
		pictures[0] = new Image();
		pictures[0].src = path + numbers[0] + extension;
	}
	pictures[1] = new Image();
	pictures[1].src = path + numbers[1] + extension;
	if (numbers[2] !== 0)
	{
		pictures[2] = new Image();
		pictures[2].src = path + numbers[2] + extension;
	}
	pictures[3] = new Image();
	pictures[3].src = path + numbers[3] + extension;
	return (pictures);
}

function	getNumbers(score)
{
	let numbers = [
		Math.floor(score[0] / 10),
		Math.floor(score[0] % 10),
		Math.floor(score[1] / 10),
		Math.floor(score[1] % 10)
	];
	return (numbers);
}

function	getDimensions(game, pictures)
{
	let dimensions = {
		leftDimensions: game.canvas.height / 5,
		leftHeight: (game.canvas.height / 2) - ((game.canvas.height / 5) / 2),
		rightDimensions: pictures[1].height,
		rightHeight: (game.canvas.height / 2) - (pictures[3].height / 2),
		leftWidth: [0, 0],
		rightWidth: [0, 0]
	};

	if (game.scores[1] > game.scores[0])
	{
		dimensions.leftDimensions = pictures[1].height;
		dimensions.rightDimensions = game.canvas.height / 5;
		dimensions.leftHeight = (game.canvas.height / 2) - (pictures[3].height / 2);
		dimensions.rightHeight = (game.canvas.height / 2) - ((game.canvas.height / 5) / 2);
	}
	dimensions.leftWidth[0] = ((game.canvas.width / 2) / 2) - (dimensions.leftDimensions + 20);
	dimensions.leftWidth[1] = ((game.canvas.width / 2) / 2);
	dimensions.rightWidth[0] = (game.canvas.width / 2) + ((game.canvas.width / 2) / 2) - (dimensions.rightDimensions + 20);
	dimensions.rightWidth[1] = (game.canvas.width / 2) + ((game.canvas.width / 2) / 2);
	return (dimensions);
}

function getPixels(canvas, xPercent, yPercent)
{
	const struct = [((xPercent / 100) * canvas.width), ((yPercent / 100) * canvas.height)];
	return (struct);
}
