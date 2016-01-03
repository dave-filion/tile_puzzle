import _ from 'lodash';
import {
  countInversions,
  rowWithBlankFromBottom,
  isSolved,
  blankNeighbors,
  createBoardV2,
  inverseDirection,
  applySlide,
  shuffleBoard,
  translateCoords
} from './helper';

import {
  test
} from './test';

const DEFAULT_IMG = "http://www.capture-the-moment.co.uk/tp/images/382.jpg";
const DEFAULT_N = 3;
const MAX_SHUFFLES = 100;

let n;
let img;
const canvas = document.getElementById("canvas");
let imageHeight;
let imageWidth;
let tileHeight;
let tileWidth;
let board;
let ctx;

let solving = {
  active: false
};

let animation = {
  active: false,
  move: null
};

function calcSX(tileId, n, tileWidth) {
  return (tileId % n) * tileWidth;
}

function calcSY(tileId, n, tileHeight) {
  return Math.floor(tileId / n) * tileHeight;
}

function drawTile(tileId, x, y, img, n) {
  const sliceX = calcSX(tileId, n, tileWidth);
  const sliceY =  calcSY(tileId, n, tileHeight);
  const sliceWidth = tileWidth;
  const sliceHeight = tileHeight;
  const dx = x * tileWidth;
  const dy = y * tileHeight;

  if (tileId != 0) {
    ctx.drawImage(img, sliceX, sliceY, sliceWidth, sliceHeight, dx, dy, tileWidth, tileHeight);
  } else {
    ctx.fillStyle = "#F2F2F2";
    ctx.fillRect(dx, dy, tileWidth, tileHeight);
    // ctx.lineWidth = 3;
    // ctx.strokeStyle = "#5C5C5C";
    // ctx.strokeRect(dx, dy, tileWidth, tileHeight);
  }
}

function arrayToMatrix(arr, n) {
  let matrix = [];
  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    for (let j = 0; j < n; j++) {
      const tile = _.first(arr);
      matrix[i].push(tile);
      arr = _.rest(arr);
    }
  }
  return matrix;
}

function matrixToArray(matrix, n) {
  let arr = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      arr.push(matrix[i][j]);
    }
  }
  return arr;
}

function startSlideAnimation() {
  const move = board.latestMove();

  // update global animation object
  // TODO: make this a collection to handle mutliple animations at a time
  // init final bounds
  const startX = move.coords.x * tileWidth;
  const startY = move.coords.y * tileHeight;

  animation = {
    active: true,
    move: move,
    latestCoords: {
      x: startX,
      y: startY
    }
  };

  if (move.dir === "UP") {
    animation.finalCoords = {
      x: startX,
      y: (move.coords.y - 1) * tileHeight
    }
  } else if (move.dir === "DOWN") {
    animation.finalCoords = {
      x: startX,
      y: (move.coords.y + 1) * tileHeight
    }
  } else if (move.dir === "LEFT") {
    animation.finalCoords = {
      x: (move.coords.x - 1) * tileWidth,
      y: startY
    }
  } else if (move.dir === "RIGHT") {
    animation.finalCoords = {
      x: (move.coords.x + 1) * tileWidth,
      y: startY
    }
  }

  window.requestAnimationFrame(draw);
}

function stopAnimation() {
  console.log("stopping animation");
  animation = {
    active: false
  };

  window.requestAnimationFrame(draw);
}

function animateMove() {
  const move = animation.move;

  // draw blank space in starting position
  ctx.fillRect(move.coords.x * tileWidth, move.coords.y * tileHeight, tileWidth, tileHeight);

  // draw tile in proper position
  let newX = animation.latestCoords.x;
  let newY = animation.latestCoords.y;
  let finished;
  const delta = 10;

  if (move.dir === "UP") {
    newY = animation.latestCoords.y - delta;
    if (newY <= animation.finalCoords.y) {
      finished = true;
    }
  } else if (move.dir === "DOWN") {
    newY = animation.latestCoords.y + delta;
    if (newY >= animation.finalCoords.y) {
      finished = true;
    }
  } else if (move.dir === "LEFT") {
    newX = animation.latestCoords.x - delta;
    if (newX <= animation.finalCoords.x) {
      finished = true;
    }
  } else if (move.dir === "RIGHT") {
    newX = animation.latestCoords.x + delta;
    if (newX >= animation.finalCoords.x) {
      finished = true;
    }
  } else {
    throw "Unknown move direction: " + move.dir;
  }

  const tileId = move.tileId;
  const sliceX = calcSX(tileId, n, tileWidth);
  const sliceY = calcSY(tileId, n, tileHeight);

  ctx.drawImage(img, sliceX, sliceY, tileWidth, tileHeight, newX, newY, tileWidth, tileHeight);

  // Update latest coordinates
  if (finished == true) {
    animation = {
      active: false
    }
  } else {
    animation.latestCoords = {
      x: newX,
      y: newY
    };
  }

  window.requestAnimationFrame(draw);
}

function draw() {
  if (animation.active === true) {
    // perform movement animation
    animateMove();
  } else if (solving.active === true) {

    // redraw board
    if (animation.active === false) {
      drawBoard(board, img, n);
    }

    if (!_.isEmpty(solving.moves)) {
      const move = solving.moves.pop();
      const slide = {
        tileId: move.tileId,
        coords: translateCoords(move.coords, move.dir),
        dir: inverseDirection(move.dir)
      };
      board = applySlide(board, slide);
      startSlideAnimation();
    } else {
      solving.active = false;
    }

  } else {
    drawBoard(board, img, n);
  }
}

// Updates high score DOM element. Expects map of userId -> score
function setHighScoreDisplay(highScores) {
  // progmatically generate table
  const tbl = document.createElement('table');
  const body = document.createElement('tbody');
  _.each(highScores, (score, userId) => {
    const tr = document.createElement('td');
    const userIdTd = document.createElement('td');
    userIdTd.appendChild(document.createTextNode(userId));
    const scoreTd = document.createElement('td');
    scoreTd.appendChild(document.createTextNode(score));
    tr.appendChild(userIdTd);
    tr.appendChild(scoreTd);
    body.appendChild(tr);
  });
  tbl.appendChild(body);
  document.getElementById('highScoreContainer').appendChild(tbl);
}

function drawBoard(board, img, n) {
  // update move counter
  document.getElementById("moveCounter").innerHTML = board.moves;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const tile = board.board[i][j];
      drawTile(tile, j, i, img, n);
    }
  }

  if (isSolved(board, n)) {
    document.getElementById("solvedIndicator").innerHTML = "You Solved It!";
    // Unbind action handler
    canvas.onclick = (e) => console.log("you already solved it");

    // post high score to backend
    fetch("/api/highScore", {
      method: "post",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: 'dave',
        score: board.moves
      })
    }).then(response => {
      setHighScoreDisplay(response);
    });

    return;
  }

  canvas.onclick = (e) => {
    // dont allow click if animation is happening
    if (animation.active === true) { return; }

    const x = Math.floor((e.clientX - canvas.getBoundingClientRect().left) / tileWidth);
    const y = Math.floor((e.clientY - canvas.getBoundingClientRect().top) / tileHeight);

    let newX = null;
    let newY = null;
    let dir = null;

    let physicalBoard = board.board;

    if (x - 1 >= 0 && x - 1 < n && physicalBoard[y][x - 1] === 0) {
      newX = x - 1;
      newY = y;
      dir = "LEFT";
    } else if (x + 1 < n && physicalBoard[y][x + 1] === 0) {
      newX = x + 1;
      newY = y;
      dir = "RIGHT";
    } else if (y - 1 >= 0 && physicalBoard[y - 1][x] === 0) {
      newX = x;
      newY = y - 1;
      dir = "UP";
    } else if (y + 1 < n && physicalBoard[y + 1][x] === 0) {
      newX = x;
      newY = y + 1;
      dir = "DOWN";
    } else {
      console.log("no valid move");
    }

    // valid move occured
    if (newY != null || newX != null) {
      const tile = physicalBoard[y][x];
      const slide = {
        tileId: tile,
        coords: {x, y},
        dir: dir
      }

      board = applySlide(board, slide);
      startSlideAnimation();
    }
  }
}

function solve(board) {
  solving.active = true;
  solving.moves = _.clone(board.history);
  window.requestAnimationFrame(draw);
}

// Onload
document.getElementById("generateButton").onclick = (e) => {
  e.preventDefault();
  const userN = document.getElementById("nInput").value;
  const userImg = document.getElementById("imgInput").value;

  // fetch high scores
  fetch("/api/highScore").then(response => setHighScoreDisplay(response));

  if (_.isEmpty(userN)) {
    n = DEFAULT_N;
  } else {
    n = parseInt(userN);
  }

  img = new Image();
  if (_.isEmpty(userImg)) {
    img.src = DEFAULT_IMG;
  } else {
    img.src = userImg;
  }

  img.onload = (e) => {
    test();
    const image = e.target;
    imageHeight = image.height;
    imageWidth = image.width;
    canvas.width = imageWidth;
    canvas.height = imageHeight;
    tileHeight = imageHeight / n;
    tileWidth = imageWidth / n;
    ctx = canvas.getContext("2d");

    board = createBoardV2(n);
    board = shuffleBoard(board, n * 20);

    window.requestAnimationFrame(draw);

    // bind solve button
    document.getElementById("solveButton").onclick = () => {
      console.log("solving!");
      solve(board);
    };
  }
}

