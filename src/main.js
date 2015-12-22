import _ from 'lodash';
import {
  countInversions,
  rowWithBlankFromBottom,
  isSolved,
  blankNeighbors,
  createBoardV2,
  inverseDirection,
  applySlide,
  shuffleBoard
} from './helper';

import {
  test
} from './test';

const IMAGE_SRC = "http://www.capture-the-moment.co.uk/tp/images/382.jpg";
const N = 3;
const MAX_SHUFFLES = 10;

function createBoard(n) {
  // 0 is blank space
  const numPieces = n * n;
  let pieces = [];
  for (let i = 0; i < numPieces; i++) {
    pieces.push(i);
  }

  let shuffle = _.shuffle(pieces);
  let inversions = countInversions(shuffle);

  // don't allow puzzles with no inversions
  while (inversions === 0) {
    shuffle = _.shuffle(pieces);
    inversions = countInversions(shuffle);
  }

  let matrix = arrayToMatrix(shuffle, n);

  if (n % 2 === 0) {
    // If the grid width is even, and the blank is on an even row counting from the bottom 
    // (second-last, fourth-last etc), then the number of inversions in a solvable situation is odd.
    // If the grid width is even, and the blank is on an odd row counting from the bottom 
    // (last, third-last, fifth-last etc) then the number of inversions in a solvable situation is even.
    let acceptable = false;
    while (acceptable == false) {
      console.log("shuffle:", shuffle);
      console.log("inversions:", inversions);

      const rowWithBlank = rowWithBlankFromBottom(matrix);
      console.log("rowWithBlank", rowWithBlank);
      if (rowWithBlank % 2 == 0) {
        // even row
        if (inversions % 2 != 0) {
          // if inversions is odd
          acceptable = true
        } else {
          shuffle = _.shuffle(pieces);
          inversions = countInversions(shuffle);
          console.log("resuffling")
        }
      } else {
        // odd row
        if (inversions % 2 == 0) {
          // if inversions is even
          acceptable = true;
        } else {
          shuffle = _.shuffle(pieces);
          inversions = countInversions(shuffle);
          console.log("resuffling")
        }
      }
    }
  } else {
    // If the grid width is odd, then the number of inversions in a solvable situation is even.
    while (inversions % 2 != 0) {
      shuffle = _.shuffle(pieces);
      inversions = countInversions(shuffle);
    }
  }

  console.log("final puzzle: ", shuffle);
  return shuffle;
}

let img = new Image();
let n = N;
img.src = IMAGE_SRC;
const canvas = document.getElementById("canvas");
let imageHeight;
let imageWidth;
let board;
let totalMoves = 0;

function calcSX(tileId, n, tileWidth) {
  return (tileId % n) * tileWidth;
}

function calcSY(tileId, n, tileHeight) {
  return Math.floor(tileId / n) * tileHeight;
}

function incTotalMoves() {
  totalMoves = totalMoves + 1;
  console.log(totalMoves);
}


function drawTile(tileId, x, y, ctx, img, tileWidth, tileHeight, n) {
  const sliceX = calcSX(tileId, n, tileWidth);
  const sliceY =  calcSY(tileId, n, tileHeight);
  const sliceWidth = tileWidth;
  const sliceHeight = tileHeight;
  const dx = x * tileWidth;
  const dy = y * tileHeight;
  const dWidth = tileWidth;
  const dHeight = tileHeight;
  if (tileId != 0) {
    ctx.drawImage(img, sliceX, sliceY, sliceWidth, sliceHeight, dx, dy, dWidth, dHeight);
  } else {
    ctx.fillRect(dx, dy, dWidth, dHeight);
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

function draw() {
  drawBoard(board, img, imageHeight, imageWidth, n);
}

function drawBoard(board, img, totalHeight, totalWidth, n) {
  const ctx = canvas.getContext("2d");
  const tileHeight = totalHeight / n;
  const tileWidth = totalWidth / n;

  // if(isSolved(board, n * n)) {
  //   console.log("SOLVED");
  // }
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const tile = board.board[i][j];
      drawTile(tile, j, i, ctx, img, tileWidth, tileHeight, n);
    }
  }

  canvas.onclick = (e) => {
    const x = Math.floor((e.clientX - canvas.getBoundingClientRect().left) / tileWidth);
    const y = Math.floor((e.clientY - canvas.getBoundingClientRect().top) / tileHeight);
    console.log(x, ":", y);
    // move piece to 0 space

    let newX = null;
    let newY = null;
    let dir = null;

    let physicalBoard = board.board;
    // LEFT
    if (x - 1 >= 0 && x - 1 < n && physicalBoard[y][x - 1] == 0) {
      console.log("moving left");
      newX = x - 1;
      newY = y;
      dir = "LEFT";
    } else if (x + 1 < n && physicalBoard[y][x + 1] == 0) {
      console.log("moving right");
      newX = x + 1;
      newY = y;
      dir = "RIGHT";
    } else if (y - 1 >= 0 && physicalBoard[y - 1][x] == 0) {
      console.log("moving up");
      newX = x;
      newY = y - 1;
      dir = "UP";
    } else if (y + 1 < n && physicalBoard[y+1][x] == 0) {
      console.log("moving down");
      newX = x;
      newY = y + 1;
      dir = "DOWN";
    } else {
      console.log("no valid move");
    }

    // valid move occured
    if (newY != null || newX != null) {
      const slide = {
        coords: {x, y},
        dir: dir
      }

      board = applySlide(board, slide);
      console.log("Shuffle history: ",  board.shuffleHistory);
      console.log("Player history: ", board.playerHistory);
    }

    window.requestAnimationFrame(draw);
  }
}

function solve(board) {
  
}

img.onload = (e) => {
  test();
  const image = e.target;
  imageHeight = image.height;
  imageWidth = image.width;
  canvas.width = imageWidth;
  canvas.height = imageHeight;
  board = createBoardV2(n);
  board = shuffleBoard(board, MAX_SHUFFLES);
  window.requestAnimationFrame(draw);
}
