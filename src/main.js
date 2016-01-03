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
const initialAnimationState = {
  active: false,
  move: null
};
const initialSolvingState = {
  active: false
};

const canvas = document.getElementById("canvas");

// Global state object
let state = {
  board: null,
  animation: initialAnimationState,
  solving: initialSolvingState,
  img: null,
  n: null,
  m: null,
  tileHeight: null,
  tileWidth: null,
};

function calcSX(tileId, n, tileWidth) {
  return (tileId % n) * tileWidth;
}

function calcSY(tileId, n, tileHeight) {
  return Math.floor(tileId / n) * tileHeight;
}

function renderTile(tileId, x, y, state) {
  const {
    tileWidth,
    tileHeight,
    img,
    n
  } = state;

  const sliceX = calcSX(tileId, n, tileWidth);
  const sliceY =  calcSY(tileId, n, tileHeight);
  const sliceWidth = tileWidth;
  const sliceHeight = tileHeight;
  const dx = x * tileWidth;
  const dy = y * tileHeight;

  if (tileId != 0) {
    state.ctx.drawImage(img, sliceX, sliceY, sliceWidth, sliceHeight, dx, dy, tileWidth, tileHeight);
  } else {
    state.ctx.fillStyle = "#F2F2F2";
    state.ctx.fillRect(dx, dy, tileWidth, tileHeight);
    // ctx.lineWidth = 3;
    // ctx.strokeStyle = "#5C5C5C";
    // ctx.strokeRect(dx, dy, tileWidth, tileHeight);
  }
}

function startSlideAnimation(state) {
  const {
    board,
    tileWidth,
    tileHeight
  } = state;

  const move = board.latestMove();

  const startX = move.coords.x * tileWidth;
  const startY = move.coords.y * tileHeight;

  // update animation in state
  state.animation = {
    active: true,
    move: move,
    latestCoords: {
      x: startX,
      y: startY
    }
  };

  // set final bounds
  if (move.dir === "UP") {
    state.animation.finalCoords = {
      x: startX,
      y: (move.coords.y - 1) * tileHeight
    }
  } else if (move.dir === "DOWN") {
    state.animation.finalCoords = {
      x: startX,
      y: (move.coords.y + 1) * tileHeight
    }
  } else if (move.dir === "LEFT") {
    state.animation.finalCoords = {
      x: (move.coords.x - 1) * tileWidth,
      y: startY
    }
  } else if (move.dir === "RIGHT") {
    state.animation.finalCoords = {
      x: (move.coords.x + 1) * tileWidth,
      y: startY
    }
  }

  window.requestAnimationFrame(draw);
}

// Handles tile clicks
function boardClickCallback(e, state) {
  const {
    animation,
    tileWidth,
    tileHeight,
    board,
    n
  } = state;

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

    // Update board
    state.board = applySlide(board, slide);
    startSlideAnimation(state);
  }
}

function stopAnimation(state) {
  console.log("stopping animation");
  state.animation = {
    active: false
  };
  window.requestAnimationFrame(draw);
}

function animateMove(state) {
  const {
    animation,
    tileHeight,
    tileWidth,
    ctx,
    img,
    n
  } = state;

  const move = animation.move;

  // draw blank space in starting position
  ctx.fillRect(move.coords.x * tileWidth, move.coords.y * tileHeight, tileWidth, tileHeight);

  // draw tile in proper position
  let newX = animation.latestCoords.x;
  let newY = animation.latestCoords.y;
  let finished;
  const delta = 15;

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
    state.animation = {
      active: false
    }
  } else {
    state.animation.latestCoords = {
      x: newX,
      y: newY
    };
  }

  window.requestAnimationFrame(draw);
}

// Main drawing function. Examines game state to determine what
// render function to call.
function draw() {
  if (state.animation.active === true) {
    animateMove(state);
  } else if (state.solving.active === true) {
    if (state.animation.active === false) {
      renderGame(state);
    }

    if (!_.isEmpty(state.solving.moves)) {
      const move = state.solving.moves.pop();
      const slide = {
        tileId: move.tileId,
        coords: translateCoords(move.coords, move.dir),
        dir: inverseDirection(move.dir)
      };
      state.board = applySlide(state.board, slide);
      startSlideAnimation(state);
    } else {
      state.solving.active = false;
    }

  } else {
    if (isSolved(state)) {
      // Unbind action handler
      canvas.onclick = (e) => {};

      // post high score to backend
      postScore("dave", state.board.moves)
      .then(response => {
        setHighScoreDisplay(response);
      });
    } else {
      renderGame(state);
      canvas.onclick = e => boardClickCallback(e, state);
    }
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

function postScore(userId, score) {
  // Using github's fetch polyfill rather than jQuery, due
  // to size of library and (in my opinion) a better API.
  // Returns a Promise
  return fetch("/api/highScore", {
    method: "post",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId: userId,
      score: score
    })
  });
}

function renderCurrentScore(currentScore) {
  document.getElementById("moveCounter").innerHTML = currentScore;
}

function renderBoard(state) {
  const n = state.n;
  const board = state.board;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const tile = board.board[i][j];
      renderTile(tile, j, i, state);
    }
  }
}

function renderSuccess() {
  document.getElementById("solvedIndicator").innerHTML = "You Solved It!";
}

function renderGame(state) {
  // rerender current score display
  renderCurrentScore(state.board.moves);

  // render game board
  renderBoard(state);
}

function solve(state) {
  state.solving.active = true;
  state.solving.moves = _.clone(state.board.history);
  window.requestAnimationFrame(draw);
}

// Entry point after page has loaded
function main() {
  console.log("Tile puzzle loaded!");

  // bind generate button
  document.getElementById("generateButton").onclick = (e) => {
    e.preventDefault();
    const userN = document.getElementById("nInput").value;
    const userImg = document.getElementById("imgInput").value;

    // fetch high scores
    fetch("/api/highScore").then(response => setHighScoreDisplay(response));

    let n;
    if (_.isEmpty(userN)) {
      n = DEFAULT_N;
    } else {
      n = parseInt(userN);
    }

    state.img = new Image();
    if (_.isEmpty(userImg)) {
      state.img.src = DEFAULT_IMG;
    } else {
      state.img.src = userImg;
    }

    state.img.onload = (e) => {
      const image = e.target;

      let imageHeight = image.height;
      let imageWidth = image.width;
      canvas.width = imageWidth;
      canvas.height = imageHeight;
      state.tileHeight = imageHeight / n;
      state.tileWidth = imageWidth / n;
      state.n = n;
      state.ctx = canvas.getContext("2d");

      let board = createBoardV2(state.n);
      state.board = shuffleBoard(board, state.n * 10);

      // bind solve button
      document.getElementById("solveButton").onclick = () => {
        solve(state);
      };

      // begin drawing
      window.requestAnimationFrame(draw);
    }
  }
}

// non jquery document on ready (does not work in IE8)
document.addEventListener("DOMContentLoaded", function(event) {
  main();
});