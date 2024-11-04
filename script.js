let overallScore = 0;
let record = 0;
let average = 0;
let games = 0;
let mseconds = 2500; // set gameSpeed in milliseconds

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateMatrix() {
  let matrix = [];
  for (let i = 0; i < 11; i++) {
    let row = [];
    for (let j = 0; j < 11; j++) {
      row.push(Math.floor(Math.random() * 4) + 1); // 0-4
    }
    matrix.push(row);
  }
  return matrix;
}

function renderMatrix(matrix) {
  const grid = document.getElementById("gameGrid");
  grid.innerHTML = ""; // goleste gridul
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      let cell = document.createElement("div");
      cell.classList.add("cell");
      if (matrix[i][j] !== 0) {
        cell.classList.add("candy-" + matrix[i][j]);
      }
      grid.appendChild(cell);
    }
  }
}

async function checkLineMatch(matrix) {
  let score = 0;

  // Orizontal
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length - 2; j++) {
      if (matrix[i][j] !== 0) {
        let matchLength = 1;
        while (
          j + matchLength < matrix[i].length &&
          matrix[i][j + matchLength] === matrix[i][j]
        ) {
          matchLength++;
        }

        if (matchLength >= 3) {
          for (let k = 0; k < matchLength; k++) {
            matrix[i][j + k] = -1; // markign
          }
          score += matchLength === 3 ? 5 : matchLength === 4 ? 10 : 50; // punctaj
          renderMatrix(matrix);
          await sleep(mseconds);
          for (let k = 0; k < matchLength; k++) {
            matrix[i][j + k] = 0; // eliminare
          }
          dropCandies(matrix);
          renderMatrix(matrix);
        }
        j += matchLength - 1;
      }
    }
  }

  // Vertical
  for (let j = 0; j < matrix[0].length; j++) {
    for (let i = 0; i < matrix.length - 2; i++) {
      if (matrix[i][j] !== 0) {
        let matchLength = 1;
        while (
          i + matchLength < matrix.length &&
          matrix[i + matchLength][j] === matrix[i][j]
        ) {
          matchLength++;
        }

        if (matchLength >= 3) {
          for (let k = 0; k < matchLength; k++) {
            matrix[i + k][j] = -1; // marking
          }
          score += matchLength === 3 ? 5 : matchLength === 4 ? 10 : 50;
          renderMatrix(matrix);
          await sleep(mseconds);
          for (let k = 0; k < matchLength; k++) {
            matrix[i + k][j] = 0; // eliminare
          }
          dropCandies(matrix);
          renderMatrix(matrix);
        }
        i += matchLength - 1;
      }
    }
  }
  return score;
}

async function checkSpecialShapes(matrix) {
  let score = 0;
  for (let i = 0; i < matrix.length - 2; i++) {
    for (let j = 0; j < matrix[i].length - 2; j++) {
      let center = matrix[i + 1][j + 1];
      if (center !== 0) {
        let isL =
          (matrix[i][j + 1] === center &&
            matrix[i + 1][j] === center &&
            matrix[i + 2][j + 1] === center) ||
          (matrix[i + 1][j + 2] === center &&
            matrix[i][j + 1] === center &&
            matrix[i + 2][j + 1] === center);

        let isT =
          matrix[i][j + 1] === center &&
          matrix[i + 2][j + 1] === center &&
          matrix[i + 1][j] === center &&
          matrix[i + 1][j + 2] === center;

        if (isL || isT) {
          matrix[i][j + 1] =
            matrix[i + 1][j] =
            matrix[i + 1][j + 1] =
            matrix[i + 1][j + 2] =
            matrix[i + 2][j + 1] =
              -1; // marking
          score += isL ? 20 : 30; // punctaj
          renderMatrix(matrix);
          await sleep(mseconds);
          matrix[i][j + 1] =
            matrix[i + 1][j] =
            matrix[i + 1][j + 1] =
            matrix[i + 1][j + 2] =
            matrix[i + 2][j + 1] =
              0; // eliminare
          dropCandies(matrix);
          renderMatrix(matrix);
        }
      }
    }
  }

  return score;
}

function dropCandies(matrix) {
  for (let j = 0; j < matrix[0].length; j++) {
    // pe verticala parcurg
    let emptySpots = [];
    for (let i = matrix.length - 1; i >= 0; i--) {
      // de la ultima la prima
      if (matrix[i][j] === 0) {
        emptySpots.push(i); // pozitiile libere
      } else if (emptySpots.length > 0) {
        let emptyIndex = emptySpots.shift(); // eliminam pozitia libera
        matrix[emptyIndex][j] = matrix[i][j]; // coboram bomboana
        matrix[i][j] = 0; // eliberam cea veche
        emptySpots.push(i); // vechea pozitie in pozitie libera
      }
    }
  }
}

async function findAndSwapForMatch(matrix) {
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length - 1; j++) {
      // Horizontal swap
      [matrix[i][j], matrix[i][j + 1]] = [matrix[i][j + 1], matrix[i][j]];
      if (
        (await checkLineMatch(matrix)) ||
        (await checkSpecialShapes(matrix))
      ) {
        return true; // Keep swap if it forms a match
      }
      [matrix[i][j], matrix[i][j + 1]] = [matrix[i][j + 1], matrix[i][j]]; // Undo swap

      // Vertical swap
      if (i < matrix.length - 1) {
        [matrix[i][j], matrix[i + 1][j]] = [matrix[i + 1][j], matrix[i][j]];
        if (
          (await checkLineMatch(matrix)) ||
          (await checkSpecialShapes(matrix))
        ) {
          return true; // Keep swap if it forms a match
        }
        [matrix[i][j], matrix[i + 1][j]] = [matrix[i + 1][j], matrix[i][j]]; // Undo swap
      }
    }
  }
  return false; // No matches found through swapping
}

async function playGameNew(matrix) {
  let score = 0;
  let steps = 0;
  const maxSteps = 10000;

  while (steps < maxSteps) {
    let newScore = await checkSpecialShapes(matrix); // incep cu shapes
    newScore += await checkLineMatch(matrix);
    score += newScore;
    if (newScore === 0) break; // Ieșim dacă nu mai există formațiuni
    dropCandies(matrix);
    steps++;
    console.log(steps);
  }

  return score;
}

async function playGame() {
  let matrix = generateMatrix();
  dropCandies(matrix); // matricea genereaza elemente si unde nu trebe
  renderMatrix(matrix);
  for (let i = 0; i < 1; i++) {
    let score = await playGameNew(matrix);
    games++;
    overallScore += score;
    average = Math.round((average * (games - 1) + score) / games);
    if (score > record) record = score;
    document.getElementById("score").textContent = "Scor: " + score;
    document.getElementById("overall").textContent = "Overall: " + overallScore;
    document.getElementById("record").textContent = "Record: " + record;
    document.getElementById("average").textContent = "Average: " + average;
    document.getElementById("games").textContent = "Games: " + games;
    matrix = generateMatrix(); // Resetarea matricei pentru un nou joc
    dropCandies(matrix); // matricea genereaza elemente si unde nu trebe
  }
}
