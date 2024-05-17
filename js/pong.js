function getCanevas()
{
	const canvas = document.getElementById("canvas");
	return (canvas);
}

function createPaddle(width, height, position)
{
	let paddle = {
		height: height / 5,
		width: width / 50,
		start_x: 0,
		start_y: 0,
	}
	if (position == "left")
	{
		paddle.start_x = (3 * width) / 100;
		paddle.start_y = (3 * height) / 100;
	}
	else if (position == "right")
	{
		paddle.start_x = width;
		paddle.start_y = height / (height - 1);
	}
	return (paddle);
}

function getPaddles(width, height)
{
	let paddles = {
		paddle_left: createPaddle(width, height, "left"),
		paddle_right: createPaddle(width, height, "right")
	}
	return (paddles);
}

function getLeftCoordinates(canvas, paddles)
{
	let tab = [canvas.width / 20, (canvas.height / 2) - (paddles.paddle_left.height / 2)];
	return (tab);
}

function getRightCoordinates(canvas, paddles)
{
	let tab = [canvas.width - (canvas.width / 20) - paddles.paddle_right.width,
		(canvas.height / 2) - (paddles.paddle_right.height / 2)];
	return (tab);
}

function display()
{
}

function startPong()
{
	const canvas = getCanevas();
	const ctx = canvas.getContext("2d");
	const width = canvas.width;
	const height = canvas.height;
	const paddles = getPaddles(width, height);
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "white";
	ctx.fillRect(...getLeftCoordinates(canvas, paddles), paddles.paddle_left.width, paddles.paddle_left.height);
	ctx.fillRect(...getRightCoordinates(canvas, paddles), paddles.paddle_right.width, paddles.paddle_right.height);
}

startPong();
