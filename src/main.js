import _ from 'lodash';

const IMAGE_SRC = "https://farm4.staticflickr.com/3822/14295903724_630f4653cc_b.jpg";
const N = 2;

function countInversions(array) {
  let totalInversions = 0;
  for (let i = 0; i < array.length; i++) {
    const num = array[i];
    let inversions = 0;

    if (num != 0) {
      for (let j = i + 1; j < array.length; j++) {
        if (num > array[j] && array[j] != 0) {
          inversions += 1;
        }
      }
    }
    totalInversions = totalInversions + inversions;
  }
  return totalInversions;
}

// Returns row number of blank space (starting with 1)
function rowWithBlankFromBottom(matrix) {
  const lastRow = matrix.length;
  for (let i = lastRow - 1; i >= 0; i--) {
    // look for 0 in this row
    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j] == 0) {
        return i + 1; // +1 because we don't want 0 based indicies
      }
    }
  }
}

function createBoard(n) {
  // 0 is blank space
  const numPieces = n * n;
  let pieces = [];
  for (let i = 0; i < numPieces; i++) {
    pieces.push(i);
  }

  console.log(pieces);
  let shuffle = _.shuffle(pieces);
  let inversions = countInversions(shuffle);
  let matrix = arrayToMatrix(shuffle, n);
  console.log(shuffle);
  console.log(inversions);

  if (n % 2 == 0) {
    // If the grid width is even, and the blank is on an even row counting from the bottom 
    // (second-last, fourth-last etc), then the number of inversions in a solvable situation is odd.
    // If the grid width is even, and the blank is on an odd row counting from the bottom 
    // (last, third-last, fifth-last etc) then the number of inversions in a solvable situation is even.
    let acceptable = false;
    while (acceptable == false) {
      const rowWithBlank = rowWithBlankFromBottom(matrix);
      if (rowWithBlank % 2 == 0) {
        // even row
        if (inversions % 2 != 0) {
          // if inversions is odd
          acceptable = true
        } else {
          shuffle = _.shuffle(pieces);
          inversions = countInversions(shuffle);
        }
      } else {
        // odd row
        if (inversions % 2 == 0) {
          // if inversions is even
          acceptable = true;
        } else {
          shuffle = _.shuffle(pieces);
          inversions = countInversions(shuffle);
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

function isSolved() {
  // Optimize this
  const numPieces = n * n;
  let pieces = [];
  for (let i = 0; i < numPieces; i++) {
    pieces.push(i);
  }

  for (var i = 0; i < board.length; ++i) {
    if (board[i] !== pieces[i]) return false;
  }
  return true;
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
  drawBoard(img, imageHeight, imageWidth, n);
}

function drawBoard(img, totalHeight, totalWidth, n) {
  const ctx = canvas.getContext("2d");
  const tileHeight = totalHeight / n;
  const tileWidth = totalWidth / n;

  if(isSolved(board)) {
    console.log("SOLVED");
  }

  const matrix = arrayToMatrix(board, n);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const tile = matrix[i][j];
      drawTile(tile, j, i, ctx, img, tileWidth, tileHeight, n);
    }
  }

  canvas.onclick = (e) => {
    const x = Math.floor((e.clientX - canvas.getBoundingClientRect().left) / tileWidth);
    const y = Math.floor((e.clientY - canvas.getBoundingClientRect().top) / tileHeight);
    console.log(x, ":", y);
    console.log(matrix[y][x]);
    // move piece to 0 space

    let newX = null;
    let newY = null;
    let moved = false;

    // LEFT
    if (x - 1 >= 0 && x - 1 < n && matrix[y][x - 1] == 0) {
      console.log("moving left");
      newX = x - 1;
      newY = y;
      moved = true;
    }

    // RIGHT
    if (x + 1 < n && matrix[y][x + 1] == 0) {
      console.log("moving right");
      newX = x + 1;
      newY = y;
      moved = true;
    }

    // UP
    if (y - 1 >= 0 && matrix[y - 1][x] == 0) {
      console.log("moving up");
      newX = x;
      newY = y - 1;
      moved = true;
    }

    // DOWN
    if (y + 1 < n && matrix[y+1][x] == 0) {
      console.log("moving down");
      newX = x;
      newY = y + 1;
      moved = true;
    }

    // valid move occured
    if (newY != null || newX != null) {
      matrix[newY][newX] = matrix[y][x];
      matrix[y][x] = 0;
      board = matrixToArray(matrix, n);
      incTotalMoves();
    }

    window.requestAnimationFrame(draw);
  }
}

img.onload = (e) => {
  const image = e.target;
  imageHeight = image.height;
  imageWidth = image.width;
  canvas.width = imageWidth;
  canvas.height = imageHeight;
  board = createBoard(n);
  window.requestAnimationFrame(draw);
}
