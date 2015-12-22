export function countInversions(array) {
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
export function rowWithBlankFromBottom(matrix) {
  const lastRow = matrix.length;
  for (let i = lastRow - 1; i >= 0; i--) {
    // look for 0 in this row
    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j] == 0) {
        return matrix.length - i;
      }
    }
  }
}

// Takes board array and determines if in solved state
export function isSolved(boardArray, totalTiles) {
  for (var i = 0; i < totalTiles; i++) {
    if (boardArray[i] != i) {
      return false;
    }
  }
  return true;
}

export function blankNeighbors(board) {
  const blankLoc = board.blankLoc;
  const neighbors = [];
  const maxY = board.board.length - 1;
  const maxX = board.board[0].length - 1; // assume all rows are equal
  if (blankLoc.x > 0) {
    // left is available
    neighbors.push({
      coords: {
        x: blankLoc.x - 1,
        y: blankLoc.y
      },
      relative: "LEFT"
    })
  }

  if (blankLoc.x < maxX) {
    // right is available
    neighbors.push({
      coords: {
        x: blankLoc.x + 1,
        y: blankLoc.y
      },
      relative: "RIGHT"
    })
  }

  if (blankLoc.y > 0) {
    // up is available
    neighbors.push({
      coords: {
        x: blankLoc.x,
        y: blankLoc.y - 1
      },
      relative: "UP"
    })
  }

  if (blankLoc.y < maxY) {
    // down is available
    neighbors.push({
      coords: {
        x: blankLoc.x,
        y: blankLoc.y + 1
      },
      relative: "DOWN"
    })
  }
  return neighbors;
}


export function createBoardV2(n) {
  // create matrix
  const matrix = [];
  let id = 0;
  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    for (let j = 0; j < n; j++) {
      matrix[i][j] = id;
      id += 1;
    }
  }

  return {
    board: matrix,
    blankLoc: {
      x: 0,
      y: 0
    },
    playerHistory: [],
    shuffleHistory: [],
    latestMove: function(){
      if (_.isEmpty(this.playerHistory)) {
        if (!_.isEmpty(this.shuffleHistory)) {
          return this.shuffleHistory[this.shuffleHistory.length - 1];
        } else {
          return null;
        }
      } else {
        return this.playerHistory[this.playerHistory.length - 1];
      }
    }
  }
}

// if shuffle is true, apply slide to shuffle history
export function applySlide(board, slide, shuffle) {
  const coords = slide.coords;
  const fromX = coords.x;
  const fromY = coords.y;

  let toX;
  let toY;
  if (slide.dir === "UP") {
    toX = fromX;
    toY = fromY - 1;
  } else if (slide.dir === "DOWN") {
    toX = fromX;
    toY = fromY + 1;
  } else if (slide.dir === "LEFT") {
    toX = fromX - 1;
    toY = fromY;
  } else if (slide.dir === "RIGHT") {
    toX = fromX + 1;
    toY = fromY;
  } else {
    throw "Unkown slide direction: " + slide.dir;
  }

  if (board.board[toY][toX] !== 0)  {
    throw "Trying to move piece to non blank piece";
  }

  board.board[toY][toX] = board.board[fromY][fromX];
  board.board[fromY][fromX] = 0;

  board.blankLoc = {
    x: fromX,
    y: fromY
  }

  if (shuffle === true) {
    board.shuffleHistory.push(slide);
  } else {
    board.playerHistory.push(slide);
  }

  return board;
}

export function inverseDirection(dir) {
  if (dir === "UP") {
    return "DOWN";
  } else if (dir === "DOWN") {
    return "UP";
  } else if (dir === "LEFT") {
    return "RIGHT";
  } else if (dir === "RIGHT") {
    return "LEFT";
  } else {
    throw "UNKNOWN DIRECTION: " + dir;
  }
}

// Shuffles input board, and returns object containing history of shuffles and shuffled board
export function shuffleBoard(board, maxShuffles) {
  for (let currentShuffle = 0; currentShuffle < maxShuffles; currentShuffle++) {
    // find neighbors of blank space
    let neighbors = blankNeighbors(board);
    const latestMove = board.latestMove();
    debugger
    if (latestMove !== null) {
      // remove negating moves (i.e. where direction equals )
      neighbors = _.remove(neighbors, n => n.relative !== latestMove.dir);
    }
    const neighborToMove = _.sample(neighbors);
    console.log("moving ", neighborToMove);
    const dir = inverseDirection(neighborToMove.relative); // reverse relative direction to get movement direction
    const slide = {
      coords: neighborToMove.coords,
      dir: dir
    };
    board = applySlide(board, slide, true); // true flag to append to shuffle history
  }

  return board;
}
