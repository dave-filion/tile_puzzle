import _ from 'lodash';
import $ from 'jquery';
import {
  isSolved,
  createBoardV2,
  inverseDirection,
  applySlide,
  shuffleBoard,
  translateCoords
} from './helper';

const DEFAULT_IMG = "http://www.capture-the-moment.co.uk/tp/images/382.jpg";
const DEFAULT_N = 3; // ROWS
const DEFAULT_M = 3; // COLS

const initialAnimationState = {
  active: false,
  move: null
};
const initialSolvingState = {
  active: false
};
const initialHintState = {
  active: false
};

let canvas;

// Global state object
let state = {
  board: null,
  animation: initialAnimationState,
  solving: initialSolvingState,
  hint: initialHintState,
  img: null,
  n: null,
  m: null,
  tileHeight: null,
  tileWidth: null
};

// Calculates start x value for image slice based on tileId
function calcSX(tileId, m, tileWidth) {
  return (tileId % m) * tileWidth;
}

// Calculates start y value for image slice based on tileId
function calcSY(tileId, m, tileHeight) {
  return Math.floor(tileId / m) * tileHeight;
}

// Renders a tile to the canvas context
function renderTile(tileId, x, y, state) {
  const {
    tileWidth,
    tileHeight,
    img,
    m
  } = state;

  const sliceX = calcSX(tileId, m, tileWidth);
  const sliceY =  calcSY(tileId, m, tileHeight);
  const sliceWidth = tileWidth;
  const sliceHeight = tileHeight;

  const dx = x * tileWidth;
  const dy = y * tileHeight;

  if (tileId != 0) {
    state.ctx.drawImage(img, sliceX, sliceY, sliceWidth, sliceHeight, dx, dy, tileWidth, tileHeight);
  } else {
    state.ctx.fillStyle = "#F2F2F2";
    state.ctx.fillRect(dx, dy, tileWidth, tileHeight);
  }
}

// Initializes and starts playing a slide animation
function startSlideAnimation(slide, state) {
  const {
    tileWidth,
    tileHeight
  } = state;

  const startX = slide.coords.x * tileWidth;
  const startY = slide.coords.y * tileHeight;

  // update animation in state
  state.animation = {
    active: true,
    move: slide,
    latestCoords: {
      x: startX,
      y: startY
    }
  };

  // set final bounds
  if (slide.dir === "UP") {
    state.animation.finalCoords = {
      x: startX,
      y: (slide.coords.y - 1) * tileHeight
    };
  } else if (slide.dir === "DOWN") {
    state.animation.finalCoords = {
      x: startX,
      y: (slide.coords.y + 1) * tileHeight
    };
  } else if (slide.dir === "LEFT") {
    state.animation.finalCoords = {
      x: (slide.coords.x - 1) * tileWidth,
      y: startY
    };
  } else if (slide.dir === "RIGHT") {
    state.animation.finalCoords = {
      x: (slide.coords.x + 1) * tileWidth,
      y: startY
    };
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
    };

    // Update board
    state.board = applySlide(board, slide, {
      addToHistory: true,
      incMoves: true
    });

    startSlideAnimation(slide, state);
  }
}

// draws individual frames during animation mode
function animateMove(state) {
  const {
    animation,
    tileHeight,
    tileWidth,
    ctx,
    img,
    m
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
  const sliceX = calcSX(tileId, m, tileWidth);
  const sliceY = calcSY(tileId, m, tileHeight);

  ctx.drawImage(img, sliceX, sliceY, tileWidth, tileHeight, newX, newY, tileWidth, tileHeight);

  if (finished == true) {
    // Disable animation mode
    state.animation = {
      active: false
    };
  } else {
    // Update latest coordinates
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
  } else if (state.hint.active === true) {
    // perform hint move.
    // TODO: this is performed very naively right now, by simply moving one step backwards in history
    // towards the solved state.
    const move = state.board.history.pop();

    // create oppisite move
    const slide = {
      tileId: move.tileId,
      coords: translateCoords(move.coords, move.dir),
      dir: inverseDirection(move.dir)
    };

    state.board = applySlide(state.board, slide, {
      addToHistory: false,
      incMoves: true
    });

    // turn off hint mode
    state.hint.active = false;

    startSlideAnimation(slide, state);

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

      state.board = applySlide(state.board, slide, {
        addToHistory: false,
        incMoves: false
      });

      startSlideAnimation(slide, state);
    } else {
      // Done solving
      state.solving.active = false;

      // unbind canvas click
      canvas.onclick = () => {};
      $(canvas).unbind("click");
      $("#solveButton").unbind("click");
    }

  } else {
    if (isSolved(state)) {
      // Unbind action handler
      $(canvas).unbind("click");

      renderSuccess(true);

      // post high score to backend
      postScore("dave", state.board.moves)
      .then(response => response.json()
        .then(json => renderTopScores(json)));
    } else {
      renderGame(state);
      renderSuccess(false);
      canvas.onclick = e => boardClickCallback(e, state);
    }
  }
}

// Updates high score DOM element
function renderTopScores(highScores) {
  // progmatically generate table. Not ideal, a view library such as React
  // would be preferable here.
  document.getElementById("highScoreContainer").innerHTML = "";
  const tbl = document.createElement('table');
  tbl.className = 'pure-table pure-table-bordered';

  const body = document.createElement('tbody');
  _.each(highScores, (scoreObj) => {
    const score = scoreObj.score;
    const userId = scoreObj.userId;
    const tr = document.createElement('tr');
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
  const {n, m, board} = state;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      const tile = board.board[i][j];
      renderTile(tile, j, i, state);
    }
  }
}

function renderSuccess(solved) {
  if (solved === true) {
    document.getElementById("solvedIndicator").innerHTML = "You Solved It!";
  } else {
    document.getElementById("solvedIndicator").innerHTML = "";
  }
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

// Update board with 1 move "hint"
function hint(state) {
  state.hint.active = true;
  window.requestAnimationFrame(draw);
}

// Entry point after page has loaded
function main() {
  console.log("Tile puzzle loaded!");

  // fetch high scores
  fetch("/api/highScore")
  .then(response => response.json()
    .then(json => renderTopScores(json)));

  // bind generate button
  $("#generateButton").click((e) => {
    $("#loading").html("Fetching image!");

    e.preventDefault();
    const userN = document.getElementById("nInput").value;
    const userM = document.getElementById("mInput").value;
    const userImg = document.getElementById("imgInput").value;

    let n;
    if (_.isEmpty(userN)) {
      n = DEFAULT_N;
    } else {
      n = parseInt(userN);
    }

    let m;
    if (_.isEmpty(userM)) {
      m = DEFAULT_M;
    } else {
      m = parseInt(userM);
    }

    state.img = new Image();

    if (_.isEmpty(userImg)) {
      state.img.src = DEFAULT_IMG;
    } else {
      state.img.src = userImg;
    }

    state.img.onload = (e) => {
      $("#puzzle-container").removeAttr("hidden");
      $("#loading").empty();
      const image = e.target;

      let imageHeight = image.height;
      let imageWidth = image.width;

      canvas = document.getElementById("canvas");
      canvas.width = imageWidth;
      canvas.height = imageHeight;
      state.tileHeight = imageHeight / n;
      state.tileWidth = imageWidth / m;
      state.n = n;
      state.m = m;

      state.ctx = canvas.getContext("2d");

      let board = createBoardV2(state.n, state.m);

      // number of shuffles determined by n. This assumes n and
      // m are close (as is the default). More sophisticated logic
      // should probably be used here to arrive at the optimium number
      // of shuffles
      state.board = shuffleBoard(board, state.n * 10);

      // bind solve button
      $("#solveButton").click((e) => {
        e.preventDefault();
        solve(state);
      });

      // bind hint button
      $("#hintButton").click((e) => {
        e.preventDefault();
        hint(state);
      });

      // begin drawing
      window.requestAnimationFrame(draw);
    };
  });
}

$(() => {
  main();
});