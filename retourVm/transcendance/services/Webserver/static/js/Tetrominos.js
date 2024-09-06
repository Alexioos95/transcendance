function tetriminoI(){
    const piece = {
        width: 4,
        color: "#0000FF",
        start: {x: 3, y: 0},
        positions: []
    };
    piece.positions = new Array(piece.width).fill().map(() => new Array(piece.width).fill("#FFFFFF"))
    piece.positions[0][1] = piece.color;
    piece.positions[1][1] = piece.color;
    piece.positions[2][1] = piece.color;
    piece.positions[3][1] = piece.color;
    return (piece);
}

function tetriminoO(){
    const piece = {
        width: 4,
        color: "#FFD700",
        start: {x: 4, y: 0},
        positions: []
    };
    piece.positions = new Array(piece.width).fill().map(() => new Array(piece.width).fill("#FFFFFF"))
    piece.positions[1][1] = piece.color;
    piece.positions[2][1] = piece.color;
    piece.positions[1][2] = piece.color;
    piece.positions[2][2] = piece.color;
    return (piece);
}

function tetriminoT(){
    const piece = {
        width: 3,
        color: "#FF0000",
        start: {x: 4, y: 0},
        positions: []
    };
    piece.positions = new Array(piece.width).fill().map(() => new Array(piece.width).fill("#FFFFFF"))
    piece.positions[0][1] = piece.color;
    piece.positions[1][0] = piece.color;
    piece.positions[1][1] = piece.color;
    piece.positions[1][2] = piece.color;
    return (piece);
}

// function tetriminoT(){
//     const piece = {
//         width: 4,
//         color: "#FF0000",
//         start: {x: 3, y: 0},
//         positions: []
//     };
//     piece.positions = new Array(piece.width).fill().map(() => new Array(piece.width).fill("#FFFFFF"))
//     piece.positions[0][1] = piece.color;
//     piece.positions[1][0] = piece.color;
//     piece.positions[1][1] = piece.color;
//     piece.positions[1][2] = piece.color;
//     return (piece);
// }


function tetriminoL(){
    const piece = {
        width: 3,
        color: "#7F00FF",
        start: {x: 4, y: 0},
        positions: []
    };
    piece.positions = new Array(piece.width).fill().map(() => new Array(piece.width).fill("#FFFFFF"))
    piece.positions[0][0] = piece.color;
    piece.positions[0][1] = piece.color;
    piece.positions[1][1] = piece.color;
    piece.positions[2][1] = piece.color;
    return (piece);
}

function tetriminoJ(){
    const piece = {
        width: 3,
        color: "#00FF00",
        start: {x: 4, y: 0},
        positions: []
    };
    piece.positions = new Array(piece.width).fill().map(() => new Array(piece.width).fill("#FFFFFF"))
    piece.positions[0][1] = piece.color;
    piece.positions[0][2] = piece.color;
    piece.positions[1][1] = piece.color;
    piece.positions[2][1] = piece.color;
    return (piece);
}


// function tetriminoL(){
//     const piece = {
//         width: 4,
//         color: "#7F00FF",
//         start: {x: 3, y: 0},
//         positions: []
//     };
//     piece.positions = new Array(piece.width).fill().map(() => new Array(piece.width).fill("#FFFFFF"))
//     piece.positions[0][0] = piece.color;
//     piece.positions[0][1] = piece.color;
//     piece.positions[1][1] = piece.color;
//     piece.positions[2][1] = piece.color;
//     return (piece);
// }

// function tetriminoJ(){
//     const piece = {
//         width: 4,
//         color: "#00FF00",
//         start: {x: 3, y: 0},
//         positions: []
//     };
//     piece.positions = new Array(piece.width).fill().map(() => new Array(piece.width).fill("#FFFFFF"))
//     piece.positions[0][1] = piece.color;
//     piece.positions[0][2] = piece.color;
//     piece.positions[1][1] = piece.color;
//     piece.positions[2][1] = piece.color;
//     return (piece);
// }


function tetriminoS(){
    const piece = {
        width: 3,
        color: "#ED7F10",
        start: {x: 4, y: 0},
        positions: []
    };
    piece.positions = new Array(piece.width).fill().map(() => new Array(piece.width).fill("#FFFFFF"))
    piece.positions[0][1] = piece.color;
    piece.positions[1][0] = piece.color;
    piece.positions[1][1] = piece.color;
    piece.positions[2][0] = piece.color;
    return (piece);
}

function tetriminoZ(){
    const piece = {
        width: 3,
        color: "#808080",
        start: {x: 4, y: 0},
        positions: []
    };
    piece.positions = new Array(piece.width).fill().map(() => new Array(piece.width).fill("#FFFFFF"))
    piece.positions[0][0] = piece.color;
    piece.positions[1][0] = piece.color;
    piece.positions[1][1] = piece.color;
    piece.positions[2][1] = piece.color;
    return (piece);
}

// function tetriminoS(){
//     const piece = {
//         width: 4,
//         color: "#ED7F10",
//         start: {x: 3, y: 0},
//         positions: []
//     };
//     piece.positions = new Array(piece.width).fill().map(() => new Array(piece.width).fill("#FFFFFF"))
//     piece.positions[0][1] = piece.color;
//     piece.positions[1][0] = piece.color;
//     piece.positions[1][1] = piece.color;
//     piece.positions[2][0] = piece.color;
//     return (piece);
// }

// function tetriminoZ(){
//     const piece = {
//         width: 4,
//         color: "#808080",
//         start: {x: 3, y: 0},
//         positions: []
//     };
//     piece.positions = new Array(piece.width).fill().map(() => new Array(piece.width).fill("#FFFFFF"))
//     piece.positions[0][0] = piece.color;
//     piece.positions[1][0] = piece.color;
//     piece.positions[1][1] = piece.color;
//     piece.positions[2][1] = piece.color;
//     return (piece);
// }

function getNextPiece(){
    const fctPiece = [tetriminoI, tetriminoO, tetriminoT, tetriminoL, tetriminoJ, tetriminoS, tetriminoZ]
    return (fctPiece[Math.round(Math.random()*10)%7]());
}

function getNextPiece2(){
    const fctPiece = [tetriminoI, tetriminoO, tetriminoT, tetriminoL, tetriminoJ, tetriminoS, tetriminoZ]
    return (fctPiece[Math.round(Math.random()*10)%7]());
}

