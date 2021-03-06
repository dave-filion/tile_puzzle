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

// Takes game state and returns if board is solved
export function isSolved(state) {
  const {board, n, m} = state;
  let id = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j ++) {
      if (board.board[i][j] !== id) {
        return false;
      }
      id += 1;
    }
  }
  return true;
}

// returns {
//  coords,
//  relative // neighbor relative location 
// }
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
    });
  }

  if (blankLoc.x < maxX) {
    // right is available
    neighbors.push({
      coords: {
        x: blankLoc.x + 1,
        y: blankLoc.y
      },
      relative: "RIGHT"
    });
  }

  if (blankLoc.y > 0) {
    // up is available
    neighbors.push({
      coords: {
        x: blankLoc.x,
        y: blankLoc.y - 1
      },
      relative: "UP"
    });
  }

  if (blankLoc.y < maxY) {
    // down is available
    neighbors.push({
      coords: {
        x: blankLoc.x,
        y: blankLoc.y + 1
      },
      relative: "DOWN"
    });
  }
  return neighbors;
}

export function createBoard(n, m) {
  // create matrix
  const matrix = [];
  let id = 0;
  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    for (let j = 0; j < m; j++) {
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
    history: [],
    moves: 0,
    latestMove: function(){
      if (!_.isEmpty(this.history)) {
        return this.history[this.history.length - 1];
      } else {
        return null;
      }
    }
  };
}

export function translateCoords(initCoords, direction) {
  if (direction === "UP") {
    return {
      x: initCoords.x,
      y: initCoords.y - 1
    };
  } else if (direction === "DOWN") {
    return {
      x: initCoords.x,
      y: initCoords.y + 1
    };
  } else if (direction === "LEFT") {
    return {
      x: initCoords.x - 1,
      y: initCoords.y
    };
  } else if (direction === "RIGHT") {
    return {
      x: initCoords.x + 1,
      y: initCoords.y
    };
  } else {
    throw "Unkown slide direction: " + direction;
  }
}

export function isBlankSpace(board, coords) {
  return board.board[coords.y][coords.x] === 0;
}

// if shuffle is true, apply slide to shuffle history
export function applySlide(board, slide, opts = {}) {
  const fromCoords = slide.coords;
  const toCoords = translateCoords(fromCoords, slide.dir);

  if (!isBlankSpace(board, toCoords)) {
    throw "Trying to move piece to non blank piece!";
  }

  // Mutate board
  board.board[toCoords.y][toCoords.x] = slide.tileId;
  board.board[fromCoords.y][fromCoords.x] = 0;

  board.blankLoc = {
    x: fromCoords.x,
    y: fromCoords.y
  };

  if (opts.addToHistory && opts.addToHistory === true) {
    board.history.push(slide);
  }

  if (opts.incMoves && opts.incMoves === true) {
    board.moves = board.moves + 1;
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

export function getTileId(board, coords) {
  // board is [][] matrix
  return board.board[coords.y][coords.x];
}

// Shuffles input board, and returns object containing history of shuffles and shuffled board
export function shuffleBoard(board, maxShuffles) {
  for (let currentShuffle = 0; currentShuffle < maxShuffles; currentShuffle++) {
    // find neighbors of blank space
    let neighbors = blankNeighbors(board);
    const latestMove = board.latestMove();

    if (latestMove !== null) {
      // filter out negating moves (i.e. where latestmove->dir === neighbor->relativeposition
      neighbors = _.filter(neighbors, n => n.relative !== latestMove.dir);
    }

    const neighborToMove = _.sample(neighbors);
    console.log("moving ", neighborToMove);
    const dir = inverseDirection(neighborToMove.relative); // reverse relative direction to get movement direction
    const neighborCoords = neighborToMove.coords;
    const slide = {
      tileId: getTileId(board, neighborCoords),
      coords: neighborCoords,
      dir: dir
    };

    board = applySlide(board, slide, {
      addToHistory: true,
      incMoves: false
    });
  }

  return board;
}
