import {
  countInversions,
  rowWithBlankFromBottom,
  isSolved,
  blankNeighbors,
  createBoardV2,
  shuffleBoard
} from './helper';

function testRowWithBlankFromBottom() {
  console.log("TEST - row with blank from botom");
  const matrix1 = [[0,1], [2, 3]];
  const r1 = rowWithBlankFromBottom(matrix1);
  const matrix2 = [[1,2], [0,5]];
  const r2 = rowWithBlankFromBottom(matrix2);

  const matrix3 = [[1, 0], [2, 3]];
  const r3 = rowWithBlankFromBottom(matrix3);
  console.log("r1 -> ", r1); // should be 2
  console.log("r2 -> ", r2); // should be 1
  console.log("r3 -> ", r3); // should be 2
}


function inversionsTest() {
  console.log("TEST - countInversions");
  const one = [2,3,0,1];
  const r1 = countInversions(one);
  if (r1 !== 2) {
    throw "Should be 2!";
  }
  const two = [0, 1, 2, 3];
  const r2 = countInversions(two);
  if (r2 !== 0) {
    throw "should be 0!";
  }

  const three = [12, 1, 10, 2, 7, 11, 4, 14, 5, 0, 9, 15, 8, 13, 6, 3];
  const r3 = countInversions(three);
  if (r3 !== 49) {
    throw "should be 49!";
  }
}

function isSolvedTest() {
  console.log("TEST - isSolved");
  const t1 = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const r1 = isSolved(t1, 9);
  if (r1 !== true) {
    throw "Should be true";
  }
  const t2 = [2, 1, 0, 3, 4, 5, 6, 7, 8];
  const r2 = isSolved(t2, 9);
  if (r2 === true) {
    throw "Should be false";
  }

  const t3 = [0, 1, 2, 3];
  const r3 = isSolved(t3, 4);
  if (r3 !== true) {
    throw "Should be true";
  }
}

function blankNeighborsTest() {
  console.log("TEST - blankNeighbors");
  const b1 = createBoardV2(3); // creates basic board
  const r1 = blankNeighbors(b1);
  console.log("r1 -> ", r1); // RIGHT and DOWN should be available
  const b2 = {
    board: [[1, 2, 3],
            [4, 0, 5],
            [6, 7, 8]],
    blankLoc: {
      x: 1,
      y: 1
    }
  };
  const r2 = blankNeighbors(b2);
  console.log("r2 -> ", r2);
}

function testShuffleAndReset() {
  console.log("TEST - shuffle and reset");
  const b1 = createBoardV2(3);
  const shuffle = shuffleBoard(b1, 10); // 10 shuffles
  if (shuffle.shuffleHistory.length !== 10) {
    throw "Should have 10 shuffles!"
  }
}


export function test() {
  inversionsTest();
  testRowWithBlankFromBottom();
  isSolvedTest();
  blankNeighborsTest();
  testShuffleAndReset();
}