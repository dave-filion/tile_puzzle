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
