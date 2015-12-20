import _ from 'lodash';

const IMAGE_SRC = "https://farm4.staticflickr.com/3822/14295903724_630f4653cc_b.jpg";
const N = 3;

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

function createBoard(n) {
  let matrix = [];
  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    for (let j = 0; j < n; j++) {
      matrix[i][j] = undefined;
    }
  }

  // 0 is blank space
  const numPieces = n * n;
  let pieces = [];
  for (let i = 0; i < numPieces; i++) {
    pieces.push(i);
  }

  console.log(pieces);

  if (n % 2 == 0) {
    // If the grid width is even, and the blank is on an even row counting from the bottom 
    // (second-last, fourth-last etc), then the number of inversions in a solvable situation is odd.
    // If the grid width is even, and the blank is on an odd row counting from the bottom 
    // (last, third-last, fifth-last etc) then the number of inversions in a solvable situation is even.

  } else {
    // If the grid width is odd, then the number of inversions in a solvable situation is even.
    let shuffle = _.shuffle(pieces);
    let inversions = countInversions(shuffle);
    console.log(shuffle);
    console.log(inversions);
    while (inversions % 2 != 0) {
      shuffle = _.shuffle(pieces);
      inversions = countInversions(shuffle);
    }
    console.log("final puzzle: ", shuffle);
    return shuffle;

    // fill pieces in matrix
    let i = 0;
    let j = 0;
    while(!_.isEmpty(shuffle)) {
      const piece = _.first(shuffle);

      matrix[i][j] = piece;

      if (j == n - 1) {
        j = 0;
        i += 1;
      } else {
        j += 1;
      }

      shuffle = _.rest(shuffle);
    }
    console.log(matrix);
  }
}

let img = new Image();
let n = N;
img.src = IMAGE_SRC;
const canvas = document.getElementById("canvas");
let imageHeight;
let imageWidth;
let board;

let animate = {
  performing: false
};

function calcSX(tileId, n, tileWidth) {
  return (tileId % n) * tileWidth;
}

function calcSY(tileId, n, tileHeight) {
  return Math.floor(tileId / n) * tileHeight;
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
  if (animate.performing == true) {
    console.log("animating")
    animateMove(animate);
    window.requestAnimationFrame(draw);
  } else {
    drawBoard(img, imageHeight, imageWidth, n);
  }
}

function animateMove(animate) {

}

function drawBoard(img, totalHeight, totalWidth, n) {
  console.log("drawing");
  const ctx = canvas.getContext("2d");
  const tileHeight = totalHeight / n;
  const tileWidth = totalWidth / n;
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

    // LEFT
    if (x - 1 >= 0 && x - 1 < n && matrix[y][x - 1] == 0) {
      console.log("moving left");
      newX = x - 1;
      newY = y;
    }

    // RIGHT
    if (x + 1 < n && matrix[y][x + 1] == 0) {
      console.log("moving right");
      newX = x + 1;
      newY = y;
    }

    // UP
    if (y - 1 >= 0 && matrix[y - 1][x] == 0) {
      console.log("moving up");
      newX = x;
      newY = y - 1;
    }

    // DOWN
    if (y + 1 < n && matrix[y+1][x] == 0) {
      console.log("moving down");
      newX = x;
      newY = y + 1;
    }

    matrix[newY][newX] = matrix[y][x];
    matrix[y][x] = 0;
    board = matrixToArray(matrix, n);
    animate = {
      performing: true,
      x: x,
      y: y,
      toX: newX,
      toY: newY
    };

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
