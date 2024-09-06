"use strict";



function checkPos(positions, newpos, map)
{
    let error = false;
    for (let i = 0; i < positions.length; i++)
    {
        for (let j = 0; j < positions[i].length; j++)
        {
            if (positions[i][j] != "#FFFFFF" && (newpos.y + i > 19 || newpos.x + j > 10 || newpos.x + j < 0 || map[newpos.y + i][newpos.x + j] != "#FFFFFF"))
                error = true;
        }
    }
    return (error);
}

function fctDrop(piece, shaddow, t)
{
    let newy;
    let error = false;
    let newpos = {x: piece.start.x, y: piece.start.y + 1};
    error = checkPos(piece.positions, newpos, t.map);
    if (error)
    {
        if (!shaddow)
        {
            addInMap(t.map, piece);
            t.currentPiece = t.nextPiece;
            t.nextPiece = getNextPiece();
        }
        return (false);
    }
    else
    piece.start = newpos;
    return (true);
}

function drawCanevas(canvas, map, t){
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            canvas.fillStyle = map[y][x];
            canvas.fillRect(x * t.sizeSquare, y * t.sizeSquare, t.sizeSquare, t.sizeSquare);
            canvas.strokeStyle = "#F0F0F2";
            canvas.strokeRect(x * t.sizeSquare, y * t.sizeSquare, t.sizeSquare, t.sizeSquare);
        }
    }
}

function drawPiece(canvas, piece, t){
    for (let y = 0; y < piece.width; y++) {
        for (let x = 0; x < piece.width; x++) {
            let color = piece.positions[y][x];
            canvas.fillStyle = color;
            if (color != "#FFFFFF")
                canvas.fillRect((piece.start.x + x) * t.sizeSquare, (piece.start.y + y) * t.sizeSquare, t.sizeSquare, t.sizeSquare);
        }
    }
}

function drawShadow(canvas, piece, t){
    let newpiece = JSON.parse(JSON.stringify(piece));
    while (fctDrop(newpiece, 1, t));
    let color = piece.color;
    for (let y = 0; y < piece.width; y++) {
        for (let x = 0; x < piece.width; x++) {
            if (newpiece.positions[y][x] != "#FFFFFF")
            {
                canvas.fillStyle = color + "3F";
                canvas.fillRect((newpiece.start.x + x) * t.sizeSquare, (newpiece.start.y + y) * t.sizeSquare, t.sizeSquare, t.sizeSquare);
            }             
        }
    }

}

function switchPiece()
{
    let tmp = currentPiece;
    if (typeof keepPiece != "undefined" /*&& checkPos(keepPiece, keepPiece.start)*/)
    {
        currentPiece = keepPiece;
        keepPiece = tmp;
    }
    else
    {
        keepPiece = currentPiece;
        currentPiece = nextPiece;
        nextPiece = getNextPiece();
    }
}

function lateralMove(dir, map)
{
    let newx;
    let newpos = {x: currentPiece.start.x + dir , y: currentPiece.start.y};
    let error = checkPos(currentPiece.positions, newpos, map);
    if (!error)
        currentPiece.start = newpos;
}

function initMap() {
    const numRows = 20;
    const numCols = 10;

    const tab = new Array(numRows).fill().map(() => new Array(numCols).fill("#FFFFFF"));

    return tab;
}

function addInMap(map, piece){
    for (let i = 0; i < piece.positions.length; i++)
    {
        for (let j = 0; j < piece.positions[i].length; j++)
        {
            if (piece.start.y + i < 20 && piece.start.x + j < 10 && piece.start.x + j >= 0  && piece.positions[i][j] != "#FFFFFF")
                map[piece.start.y + i][piece.start.x + j] = piece.color;
        }
    }
}

function removeLine(t)
{
    let j = 0;
    for (let i = 0; i < t.map.length; i++)
    {
        for (j = 0; j < t.map[i].length; j++)
        {
            if (t.map[i][j] == "#FFFFFF")
                break;
        }
        if (j == t.map[i].length)
        {
            t.map.splice(i, 1);
            let newLine = new Array(10).fill("#FFFFFF");
            t.map.unshift(newLine);
            t.lines++;
        }
    }
}



function checkPos(positions, newpos, map)
{
    let error = false;
    for (let i = 0; i < positions.length; i++)
    {
        for (let j = 0; j < positions[i].length; j++)
        {
            if (positions[i][j] != "#FFFFFF" && (newpos.y + i > 19 || newpos.x + j > 10 || newpos.x + j < 0 || map[newpos.y + i][newpos.x + j] != "#FFFFFF"))
                error = true;
        }
    }
    return (error);
}

function fctDrop(piece, shaddow, t)
{
    let newy;
    let error = false;
    let newpos = {x: piece.start.x, y: piece.start.y + 1};
    error = checkPos(piece.positions, newpos, t.map);
    if (error)
    {
        if (!shaddow)
        {
            addInMap(map, piece);
            t.currentPiece = t.nextPiece;
            t.nextPiece = getNextPiece();
        }
        return (false);
    }
    else
    piece.start = newpos;
    return (true);
}

function switchPiece()
{
    let tmp = currentPiece;
    if (typeof keepPiece != "undefined" /*&& checkPos(keepPiece, keepPiece.start)*/)
    {
        currentPiece = keepPiece;
        keepPiece = tmp;
    }
    else
    {
        keepPiece = currentPiece;
        currentPiece = nextPiece;
        nextPiece = getNextPiece();
    }
}

function lateralMove(dir, t)
{
    let newx;
    let newpos = {x: currentPiece.start.x + dir , y: currentPiece.start.y};
    let error = checkPos(currentPiece.positions, newpos, t);
    if (!error)
        currentPiece.start = newpos;
}



function draw(t){
    drawCanevas(t.canvas, t.map, t);
    drawPiece(t.canvas, t.currentPiece, t);
    drawShadow(t.canvas, t.currentPiece, t);
   // drawPreview(preview, nextPiece);
    // if (typeof keepPiece !== "undefined")
    //     drawPreview(keep, keepPiece);

}


function fallPiece(t)
{
    t.forEach((e) => {
        setInterval(() => {
        if (e.indexInterval == 10)
        {
            e.events.push("drop");
            e.indexInterval = 0;
        }
        e.indexInterval++;
        }, 60);     
    });
}

function myEvent(t) {
    document.body.addEventListener("keydown", function(event) {
        t.forEach((e) => {
            const listen = e.listen;
            if (listen.find((key) => key === event.key) !== undefined) {
                e.events.push(event.key);
            }
        });
    });
}

// function fallPiece(t)
// {
//     t.forEach((e) => {
//         setInterval(() => {
//         if (e.indexInterval == 8)
//         {
//             e.events.push("drop");
//             e.indexInterval = 0;
//         }
//         e.indexInterval++;
//         if (e.pressedKey.length > 0)
//         {
//             e.events.push(e.pressedKey.shift())
//         }
//         }, 100);     
//     });
// }

// function myPressEvent(t) {
//     document.body.addEventListener("keydown", function(event) {
//         t.forEach((e) => {
//             const listen = e.listen;
//             if (listen.find((key) => key === event.key) !== undefined) {
//                 e.pressedKey.push(event.key);
//                 console.log("pressed: ", event.key);
//                 // console.log(e.pressedKey);
//             }
//         });
//     });
// }


// function myReleaseEvent(t) {
//     document.body.addEventListener("keyup", function(event) {
//         t.forEach((e) => {
//             console.log("realesed: ", event.key);
//             const index = e.pressedKey.indexOf(event.key);
//             if (index != -1) {
//                 e.pressedKey.splice(index, 1);
//             }
//         });
//     });
// }

    function fctDrop(piece, shaddow, t)
    {
        let newy;
        let error = false;
        let newpos = {x: piece.start.x, y: piece.start.y + 1};
        error = checkPos(piece.positions, newpos, t.map);
        if (error)
        {
            if (!shaddow)
            {
                addInMap(t.map, piece);
                t.currentPiece = t.nextPiece;
                t.nextPiece = getNextPiece();
            }
            return (false);
        }
        else
        piece.start = newpos;
        return (true);
    }
    
    function switchPiece()
    {
        let tmp = currentPiece;
        if (typeof keepPiece != "undefined" /*&& checkPos(keepPiece, keepPiece.start)*/)
        {
            currentPiece = keepPiece;
            keepPiece = tmp;
        }
        else
        {
            keepPiece = currentPiece;
            currentPiece = nextPiece;
            nextPiece = getNextPiece();
        }
    }
    
function checkPos(positions, newpos, map)
{
    let error = false;
    for (let i = 0; i < positions.length; i++)
    {
        for (let j = 0; j < positions[i].length; j++)
        {
            if (positions[i][j] != "#FFFFFF" && (newpos.y + i > 19 || newpos.x + j > 10 || newpos.x + j < 0 || map[newpos.y + i][newpos.x + j] != "#FFFFFF"))
                error = true;
        }
    }
    return (error);
}

function fctDrop(piece, shaddow, t)
{
    let newy;
    let error = false;
    let newpos = {x: piece.start.x, y: piece.start.y + 1};
    error = checkPos(piece.positions, newpos, t.map);
    if (error)
    {
        if (!shaddow)
        {
            addInMap(t.map, piece);
            t.currentPiece = t.nextPiece;
            t.nextPiece = getNextPiece();
        }
        return (false);
    }
    else
    piece.start = newpos;
    return (true);
}

function drawCanevas(canvas, map, t){
	console.log(canvas)
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            canvas.fillStyle = map[y][x];
            canvas.fillRect(x * t.sizeSquare, y * t.sizeSquare, t.sizeSquare, t.sizeSquare);
            canvas.strokeStyle = "#F0F0F2";
            canvas.strokeRect(x * t.sizeSquare, y * t.sizeSquare, t.sizeSquare, t.sizeSquare);
        }
    }
}

function drawPiece(canvas, piece, t){
    for (let y = 0; y < piece.width; y++) {
        for (let x = 0; x < piece.width; x++) {
            let color = piece.positions[y][x];
            canvas.fillStyle = color;
            if (color != "#FFFFFF")
                canvas.fillRect((piece.start.x + x) * t.sizeSquare, (piece.start.y + y) * t.sizeSquare, t.sizeSquare, t.sizeSquare);
        }
    }
}

function drawShadow(canvas, piece, t){
    let newpiece = JSON.parse(JSON.stringify(piece));
    while (fctDrop(newpiece, 1, t));
    let color = piece.color;
    for (let y = 0; y < piece.width; y++) {
        for (let x = 0; x < piece.width; x++) {
            if (newpiece.positions[y][x] != "#FFFFFF")
            {
                canvas.fillStyle = color + "3F";
                canvas.fillRect((newpiece.start.x + x) * t.sizeSquare, (newpiece.start.y + y) * t.sizeSquare, t.sizeSquare, t.sizeSquare);
            }             
        }
    }

}

function switchPiece()
{
    let tmp = currentPiece;
    if (typeof keepPiece != "undefined" /*&& checkPos(keepPiece, keepPiece.start)*/)
    {
        currentPiece = keepPiece;
        keepPiece = tmp;
    }
    else
    {
        keepPiece = currentPiece;
        currentPiece = nextPiece;
        nextPiece = getNextPiece();
    }
}

function lateralMove(dir, map)
{
    let newx;
    let newpos = {x: currentPiece.start.x + dir , y: currentPiece.start.y};
    let error = checkPos(currentPiece.positions, newpos, map);
    if (!error)
        currentPiece.start = newpos;
}

function initMap() {
    const numRows = 20;
    const numCols = 10;

    const tab = new Array(numRows).fill().map(() => new Array(numCols).fill("#FFFFFF"));

    return tab;
}

function addInMap(map, piece){
    for (let i = 0; i < piece.positions.length; i++)
    {
        for (let j = 0; j < piece.positions[i].length; j++)
        {
            if (piece.start.y + i < 20 && piece.start.x + j < 10 && piece.start.x + j >= 0  && piece.positions[i][j] != "#FFFFFF")
                map[piece.start.y + i][piece.start.x + j] = piece.color;
        }
    }
}

function removeLine(t)
{
    let j = 0;
    for (let i = 0; i < t.map.length; i++)
    {
        for (j = 0; j < t.map[i].length; j++)
        {
            if (t.map[i][j] == "#FFFFFF")
                break;
        }
        if (j == t.map[i].length)
        {
            t.map.splice(i, 1);
            let newLine = new Array(10).fill("#FFFFFF");
            t.map.unshift(newLine);
            t.lines++;
        }
    }
}



function checkPos(positions, newpos, map)
{
    let error = false;
    for (let i = 0; i < positions.length; i++)
    {
        for (let j = 0; j < positions[i].length; j++)
        {
            if (positions[i][j] != "#FFFFFF" && (newpos.y + i > 19 || newpos.x + j > 10 || newpos.x + j < 0 || map[newpos.y + i][newpos.x + j] != "#FFFFFF"))
                error = true;
        }
    }
    return (error);
}

function fctDrop(piece, shaddow, t)
{
    let newy;
    let error = false;
    let newpos = {x: piece.start.x, y: piece.start.y + 1};
    error = checkPos(piece.positions, newpos, t.map);
    if (error)
    {
        if (!shaddow)
        {
            addInMap(map, piece);
            t.currentPiece = t.nextPiece;
            t.nextPiece = getNextPiece();
        }
        return (false);
    }
    else
    piece.start = newpos;
    return (true);
}

function switchPiece()
{
    let tmp = currentPiece;
    if (typeof keepPiece != "undefined" /*&& checkPos(keepPiece, keepPiece.start)*/)
    {
        currentPiece = keepPiece;
        keepPiece = tmp;
    }
    else
    {
        keepPiece = currentPiece;
        currentPiece = nextPiece;
        nextPiece = getNextPiece();
    }
}

function lateralMove(dir, t)
{
    let newx;
    let newpos = {x: currentPiece.start.x + dir , y: currentPiece.start.y};
    let error = checkPos(currentPiece.positions, newpos, t);
    if (!error)
        currentPiece.start = newpos;
}



function draw(t){
	console.log(t)
    drawCanevas(t.canvas, t.map, t);
    drawPiece(t.canvas, t.currentPiece, t);
    drawShadow(t.canvas, t.currentPiece, t);
   // drawPreview(preview, nextPiece);
    // if (typeof keepPiece !== "undefined")
    //     drawPreview(keep, keepPiece);

}


function fallPiece(t)
{
    setInterval(() => {
        if (t.indexInterval == 10)
        {
            t.events.push("drop");
            t.indexInterval = 0;
        }
        t.indexInterval++;
        }, 60);     
}

function myEvent(tetris) {
    document.body.addEventListener("keydown", function(event) {
            const listen = tetris.listen;
            if (listen.find((key) => key === event.key) !== undefined) {
                tetris.events.push(event.key);
            }
        });
}

// function fallPiece(t)
// {
//     t.forEach((e) => {
//         setInterval(() => {
//         if (e.indexInterval == 8)
//         {
//             e.events.push("drop");
//             e.indexInterval = 0;
//         }
//         e.indexInterval++;
//         if (e.pressedKey.length > 0)
//         {
//             e.events.push(e.pressedKey.shift())
//         }
//         }, 100);     
//     });
// }

// function myPressEvent(t) {
//     document.body.addEventListener("keydown", function(event) {
//         t.forEach((e) => {
//             const listen = e.listen;
//             if (listen.find((key) => key === event.key) !== undefined) {
//                 e.pressedKey.push(event.key);
//                 console.log("pressed: ", event.key);
//                 // console.log(e.pressedKey);
//             }
//         });
//     });
// }


// function myReleaseEvent(t) {
//     document.body.addEventListener("keyup", function(event) {
//         t.forEach((e) => {
//             console.log("realesed: ", event.key);
//             const index = e.pressedKey.indexOf(event.key);
//             if (index != -1) {
//                 e.pressedKey.splice(index, 1);
//             }
//         });
//     });
// }

    function fctDrop(piece, shaddow, t)
    {
        let newy;
        let error = false;
        let newpos = {x: piece.start.x, y: piece.start.y + 1};
        error = checkPos(piece.positions, newpos, t.map);
        if (error)
        {
            if (!shaddow)
            {
                addInMap(t.map, piece);
                t.currentPiece = t.nextPiece;
                t.nextPiece = getNextPiece();
            }
            return (false);
        }
        else
        piece.start = newpos;
        return (true);
    }
    
    function switchPiece()
    {
        let tmp = currentPiece;
        if (typeof keepPiece != "undefined" /*&& checkPos(keepPiece, keepPiece.start)*/)
        {
            currentPiece = keepPiece;
            keepPiece = tmp;
        }
        else
        {
            keepPiece = currentPiece;
            currentPiece = nextPiece;
            nextPiece = getNextPiece();
        }
    }
    
    function lateralMove(dir, t)
    {
        let newx;
        let newpos = {x: t.currentPiece.start.x + dir , y: t.currentPiece.start.y};
        let error = checkPos(t.currentPiece.positions, newpos, t.map);
        if (!error)
            t.currentPiece.start = newpos;
    }
    
   
function checkPos(positions, newpos, map)
{
    let error = false;
    for (let i = 0; i < positions.length; i++)
    {
        for (let j = 0; j < positions[i].length; j++)
        {
            if (positions[i][j] != "#FFFFFF" && (newpos.y + i > 19 || newpos.x + j > 10 || newpos.x + j < 0 || map[newpos.y + i][newpos.x + j] != "#FFFFFF"))
                error = true;
        }
    }
    return (error);
}
 


function lateralMove(dir, t)
{
    let newx;
    let newpos = {x: t.currentPiece.start.x + dir , y: t.currentPiece.start.y};
    let error = checkPos(t.currentPiece.positions, newpos, t.map);
    if (!error)
        t.currentPiece.start = newpos;
}
    
   
function checkPos(positions, newpos, map)
{
    let error = false;
    for (let i = 0; i < positions.length; i++)
    {
        for (let j = 0; j < positions[i].length; j++)
        {
            if (positions[i][j] != "#FFFFFF" && (newpos.y + i > 19 || newpos.x + j > 10 || newpos.x + j < 0 || map[newpos.y + i][newpos.x + j] != "#FFFFFF"))
                error = true;
        }
    }
    return (error);
}
 


function fctRotate(dir, t) {
    let newpos =  new Array(t.currentPiece.width);
    let col;
    if (dir == 'a' || "ArrowUp")
    {
        col = t.currentPiece.width - 1;
        for (let i = 0; i < t.currentPiece.positions.length; i++)
        {
            newpos[i] = [];
            for (let j = 0; j < t.currentPiece.positions[i].length; j++)
                newpos[i].push(t.currentPiece.positions[j][col]);
            col--
        }
    }
    else
    {
        for (let i = 0; i < t.currentPiece.positions.length; i++)
        {
            newpos[i] = [];
            for (let j = 0; j < t.currentPiece.positions[i].length; j++)
                newpos[i].push(t.currentPiece.positions[j][i]);
        }
    }
    if (!checkPos(newpos, t.currentPiece.start, t.map))
        t.currentPiece.positions = newpos;
}

function tetrisLoop(tetris)
{
    console.log(typeof tetris);
    console.log(tetris);
    
	// console.log(tetris);
    // let size = events.length;
    // lastSize = size
    // console.log("i : ", i);
    // console.log(events);
    let move = tetris.events.shift();
    if (move == "drop")
        fctDrop(tetris.currentPiece, 0, tetris);
    if (move == "ArrowDown" || move == "s")
        fctDrop(tetris.currentPiece, 0, tetris);
    if (move == "ArrowRight" || move == "d")
        lateralMove(+1, tetris);
    if (move == "ArrowLeft" || move == "a")
        lateralMove(-1, tetris);
    if (move == "w" || move == "ArrowUp")
        fctRotate(move, tetris);
    // if (move == " ")
    //     switchPiece();
    removeLine(tetris);
    //document.getElementById("lines").innerText = lines;
    draw(tetris);
    requestAnimationFrame(() => {
        tetrisLoop(tetris);
    });
}

/////////////////////////
// Script
/////////////////////////
function	getTetrisStruct()
{
	const struct = {
		name: "TETRIS",
		canvas: undefined,
		ctx: undefined,
		run: startTetris,
		online: false,
		running: 0
	};
	return (struct);
}

function initCanvas(element, nbPalyer)
{
    // canvasContainer.classList.add("canvas-container");
    // const parentHeight = element.clientHeight - 100;
    // const canvasHeight = Math.floor((parentHeight) / 20) * 20;
    // const canvasWidth = canvasHeight / 2;
    // const canvases = [];
	const canvas = document.createElement("canvas");
	const parentHeight = element.clientHeight - 100;
    const canvasHeight = (parentHeight / 20) * 20;
    const canvasWidth = canvasHeight / 2;
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;
    element.appendChild(canvas);
    return (canvas);
}

async function	startTetris(struct)
{
	console.log("coucou")
	const canvas = initCanvas(struct.screen.wrapperCanvas, 1);
	console.log(canvas);
	console.log(canvas.ctx);
	const tetris = {
		currentPiece: getNextPiece(),
		nextPiece: getNextPiece(),
		savedPiece:"undefined",
		map: initMap(),
		canvas: canvas.getContext('2d'),
		sizeSquare: canvas.width / 10,
		line: 0,
		events: [],
		//pressedKey: [],
		indexInterval:0,
		activeKey:{up:0, down:0, left:0, right:0},
		listen: ["ArrowLeft", "ArrowDown", "ArrowUp","ArrowRight"],
	};
    fallPiece(tetris);
    myEvent(tetris);
    // myReleaseEvent(tetris);
    // myPressEvent(tetris);
    //console.log(tetris[0].map);
    tetrisLoop(tetris);
	//contaimer div == struct.screen.wrapperCanvas
	// struct.screen.wrapperCanvas.style.background="red";
	// Init game
	// Init EventListener
	// canvas.focus();
	// Loop game;

	// at the end of the game:
	//	game.running = 0;
	//	endGame(struct);
}
