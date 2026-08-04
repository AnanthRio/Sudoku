
let mistakes = 0;
let solutionBoard = [];
let puzzleBoard = [];
let selectedCell = null;
let isPaused = false;


// ==========================================
// GAME ELEMENTS
// ==========================================

const maxMistakes = 3;
const gameSection = document.getElementById("gameSection");
const sudokuBoard = document.getElementById("sudokuBoard");
const gameMode = document.getElementById("gameMode");
const numberPad = document.getElementById("numberPad");
const eraseBtn = document.getElementById("eraseBtn");
const mistakeDisplay = document.getElementById("mistakeDisplay");
const gameOverModal = document.getElementById("gameOverModal");
const gameOverTime = document.getElementById("gameOverTime");
const winModal = document.getElementById("winModal");
const winTime = document.getElementById("winTime");
const winMistakes = document.getElementById("winMistakes");
const pauseBtn = document.getElementById("pauseBtn");
const pauseOverlay = document.getElementById("pauseOverlay");
const newBestMessage = document.getElementById("newBestMessage");
const winBestTime = document.getElementById("winBestTime");


function createBoard(size, difficulty) {

    size = Number(size);

    sudokuBoard.innerHTML = "";
    sudokuBoard.style.gridTemplateColumns =
        `repeat(${size}, 1fr)`;
    sudokuBoard.style.gridTemplateRows =
        `repeat(${size}, 1fr)`;

    // Complete answer
    solutionBoard = generateSolvedBoard(size);

    // Puzzle shown to player
    puzzleBoard = createPuzzle(
        solutionBoard,
        size,
        difficulty
    );


    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const cell = document.createElement("div");
            cell.classList.add("sudoku-cell");
            // Save cell position
            cell.dataset.row = row;
            cell.dataset.col = col;

            let boxRows;
            let boxCols;

            if (size === 6) {
                boxRows = 2;
                boxCols = 3;
            } else {
                boxRows = 3;
                boxCols = 3;
            }

            // Thick border after each box column
            if ((col + 1) % boxCols === 0 && col !== size - 1) {
                cell.classList.add("box-border-right");
            }

            // Thick border after each box row
            if ((row + 1) % boxRows === 0 && row !== size - 1) {
                cell.classList.add("box-border-bottom");
            }

            if (puzzleBoard[row][col] !== 0) {
                // Given number
                cell.textContent = puzzleBoard[row][col];
                cell.classList.add("given-cell");
            } else {
                // Empty playable cell
                cell.textContent = "";
                cell.classList.add("empty-cell");
                cell.addEventListener("click", function () {
                    selectCell(this);
                });
            }

            sudokuBoard.appendChild(cell);
        }
    }
    createNumberPad(size);
}


function startGame(size, difficulty) {

    selectedCell = null;

    // Reset pause
    isPaused = false;
    sudokuBoard.classList.remove("paused");
    pauseOverlay.style.display = "none";
    numberPad.style.visibility = "visible";
    eraseBtn.style.visibility = "visible";
    pauseBtn.textContent = "⏸";

    gameMode.textContent =
        size + "×" + size + " • " + difficulty.toUpperCase();

    createBoard(size, difficulty);

    mistakes = 0;
    updateMistakeDisplay();

    elapsedSeconds = 0;
    updateTimerDisplay();
    startTimer();
}


function updateMistakeDisplay() {
    mistakeDisplay.textContent =
        `Mistakes: ${mistakes}/${maxMistakes}`;
}


function createNumberPad(size) {
    numberPad.innerHTML = "";
    for (let number = 1; number <= size; number++) {
        const button = document.createElement("button");
        button.classList.add("number-btn");
        button.textContent = number;
        button.addEventListener("click", function () {
            enterNumber(number);
        });
        numberPad.appendChild(button);
    }
}

function enterNumber(number) {
    // Player hasn't selected a cell
    if (selectedCell === null) {
        return;
    }

    if (selectedCell.classList.contains("given-cell")) {
        return;
    }

    const row = Number(selectedCell.dataset.row);
    const col = Number(selectedCell.dataset.col);
    // Show entered number
    selectedCell.textContent = number;
    // Remove previous result color
    selectedCell.classList.remove(
        "correct-cell",
        "wrong-cell"
    );

    // Compare against hidden solution
    if (number === solutionBoard[row][col]) {
        selectedCell.classList.add("correct-cell");
        // Check whether this was the final answer
        if (checkGameComplete()) {
            gameWon();
        }

    } else {
        selectedCell.classList.add("wrong-cell");
        mistakes++;
        updateMistakeDisplay();
        if (mistakes >= maxMistakes) {
            gameOver();
        }
    }
    saveGame();
}


function saveGame() {

    const size = solutionBoard.length;
    // No active game
    if (size === 0) {
        return;
    }

    const playerAnswers = [];

    for (let row = 0; row < size; row++) {
        playerAnswers[row] = [];
        for (let col = 0; col < size; col++) {
            const cell = document.querySelector(
                `.sudoku-cell[data-row="${row}"][data-col="${col}"]`
            );

            if (cell.classList.contains("given-cell")) {
                playerAnswers[row][col] = null;
            } else {
                playerAnswers[row][col] =
                    cell.textContent === ""
                        ? 0
                        : Number(cell.textContent);
            }
        }
    }

    const gameData = {
        size: size,
        difficulty: selectedDifficulty,
        solutionBoard: solutionBoard,
        puzzleBoard: puzzleBoard,
        playerAnswers: playerAnswers,
        mistakes: mistakes,
        elapsedSeconds: elapsedSeconds
    };

    localStorage.setItem(
        "sudokuSavedGame",
        JSON.stringify(gameData)
    );
}

function savePersonalBest() {

    const size = solutionBoard.length;

    const key =
        `${size}x${size}-${selectedDifficulty}`;

    const bestTimes =
        JSON.parse(
            localStorage.getItem("sudokuBestTimes")
        ) || {};

    const oldBest = bestTimes[key];

    if (
        oldBest === undefined ||
        elapsedSeconds < oldBest
    ) {
        bestTimes[key] = elapsedSeconds;

        localStorage.setItem(
            "sudokuBestTimes",
            JSON.stringify(bestTimes)
        );
        return true;
    }
    return false;
}

function getPersonalBest() {

    const size = solutionBoard.length;

    const key =
        `${size}x${size}-${selectedDifficulty}`;

    const bestTimes =
        JSON.parse(
            localStorage.getItem("sudokuBestTimes")
        ) || {};

    return bestTimes[key];
}

function getStats() {

    return JSON.parse(
        localStorage.getItem("sudokuStats")
    ) || {
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        bestStreak: 0
    };
}

function saveStats(stats) {

    localStorage.setItem(
        "sudokuStats",
        JSON.stringify(stats)
    );
}

function recordWin() {

    const stats = getStats();

    stats.gamesPlayed++;
    stats.gamesWon++;
    stats.currentStreak++;

    if (stats.currentStreak > stats.bestStreak) {
        stats.bestStreak = stats.currentStreak;
    }

    saveStats(stats);
}

function recordLoss() {

    const stats = getStats();

    stats.gamesPlayed++;
    stats.currentStreak = 0;

    saveStats(stats);
}


// ==========================================
// PAUSE / RESUME
// ==========================================

pauseBtn.addEventListener("click", function () {
    if (!isPaused) {
        // PAUSE
        pauseTimer();

        isPaused = true;
        saveGame();

        sudokuBoard.classList.add("paused");
        pauseOverlay.style.display = "flex";
        numberPad.style.visibility = "hidden";
        eraseBtn.style.visibility = "hidden";
        pauseBtn.textContent = "▶";

    } else {

        // RESUME
        startTimer();
        isPaused = false;

        sudokuBoard.classList.remove("paused");
        pauseOverlay.style.display = "none";
        numberPad.style.visibility = "visible";
        eraseBtn.style.visibility = "visible";
        pauseBtn.textContent = "⏸";
    }
});

window.addEventListener("beforeunload", function () {

    if (solutionBoard.length > 0) {
        saveGame();
    }

});


function checkGameComplete() {

    const emptyCells =
        document.querySelectorAll(".empty-cell");

    for (let cell of emptyCells) {
        const row = Number(cell.dataset.row);
        const col = Number(cell.dataset.col);
        const enteredNumber =
            Number(cell.textContent);

        // One cell is empty or wrong
        if (enteredNumber !== solutionBoard[row][col]) {
            return false;
        }
    }
    return true;
}

function gameWon() {

    pauseTimer();

    const isNewBest = savePersonalBest();
    recordWin();
    const bestTime = getPersonalBest();

    localStorage.removeItem("sudokuSavedGame");

    winTime.textContent = gameTimer.textContent;

    winMistakes.textContent =
        `${mistakes}/${maxMistakes}`;

    const bestMinutes =
        Math.floor(bestTime / 60);

    const bestSeconds =
        bestTime % 60;

    winBestTime.textContent =
        String(bestMinutes).padStart(2, "0") +
        ":" +
        String(bestSeconds).padStart(2, "0");

    if (isNewBest) {
        newBestMessage.style.display = "block";
    } else {
        newBestMessage.style.display = "none";
    }

    winModal.style.display = "flex";
}


function gameOver() {

    pauseTimer();
    recordLoss();

    localStorage.removeItem("sudokuSavedGame");
    // Show final time
    gameOverTime.textContent = gameTimer.textContent;
    // Show modal
    gameOverModal.style.display = "flex";
}

function eraseSelectedCell() {
    if (selectedCell === null) {
        return;
    }
    if (selectedCell.classList.contains("given-cell")) {
        return;
    }
    selectedCell.textContent = "";
    selectedCell.classList.remove(
        "correct-cell",
        "wrong-cell"
    );
    saveGame();
}

function hasSavedGame() {
    return localStorage.getItem("sudokuSavedGame") !== null;
}

eraseBtn.addEventListener("click", function () {
    eraseSelectedCell();
});

document.addEventListener("keydown", function (event) {
    // No active selected cell

    if (isPaused) {
        return;
    }

    if (selectedCell === null) {
        return;
    }
    const key = event.key;

    // Number keys
    if (key >= "1" && key <= "9") {
        const number = Number(key);
        // Find current board size
        const size = solutionBoard.length;
        // Prevent 7,8,9 on a 6×6 board
        if (number <= size) {
            enterNumber(number);
        }
        return;
    }


    if (key === "Backspace" || key === "Delete") {
        event.preventDefault();
        eraseSelectedCell();
        return;
    }

    if (
        key === "ArrowUp" ||
        key === "ArrowDown" ||
        key === "ArrowLeft" ||
        key === "ArrowRight"
    ) {

        event.preventDefault();
        moveSelectedCell(key);
    }
});


function selectCell(cell) {

    // Remove old selected cell
    if (selectedCell !== null) {
        selectedCell.classList.remove("selected-cell");
    }

    selectedCell = cell;
    selectedCell.classList.add("selected-cell");

    highlightRelatedCells(
        Number(selectedCell.dataset.row),
        Number(selectedCell.dataset.col)
    );
}

function loadSavedGame() {

    const savedData =
        localStorage.getItem("sudokuSavedGame");

    if (savedData === null) {
        return;
    }

    const savedGame = JSON.parse(savedData);

    // Restore game state
    solutionBoard = savedGame.solutionBoard;
    puzzleBoard = savedGame.puzzleBoard;
    mistakes = savedGame.mistakes;
    elapsedSeconds = savedGame.elapsedSeconds;
    selectedDifficulty = savedGame.difficulty;
    selectedCell = null;

    const size = savedGame.size;

    // Update game information
    gameMode.textContent =
        size + "×" + size + " • " +
        savedGame.difficulty.toUpperCase();

    updateMistakeDisplay();
    updateTimerDisplay();

    // Rebuild board using SAVED puzzle
    restoreBoard(
        size,
        savedGame.playerAnswers
    );

    createNumberPad(size);
}

function restoreBoard(size, playerAnswers) {

    sudokuBoard.innerHTML = "";
    sudokuBoard.style.gridTemplateColumns =
        `repeat(${size}, 1fr)`;
    sudokuBoard.style.gridTemplateRows =
        `repeat(${size}, 1fr)`;


    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {

            const cell = document.createElement("div");

            cell.classList.add("sudoku-cell");

            cell.dataset.row = row;
            cell.dataset.col = col;

            // -------------------------
            // BOX BORDERS
            // -------------------------
            let boxRows;
            let boxCols;

            if (size === 6) {
                boxRows = 2;
                boxCols = 3;
            } else {
                boxRows = 3;
                boxCols = 3;
            }

            if (
                (col + 1) % boxCols === 0 &&
                col !== size - 1
            ) {
                cell.classList.add("box-border-right");
            }

            if (
                (row + 1) % boxRows === 0 &&
                row !== size - 1
            ) {
                cell.classList.add("box-border-bottom");
            }

            // -------------------------
            // GIVEN CELL
            // -------------------------

            if (puzzleBoard[row][col] !== 0) {
                cell.textContent =
                    puzzleBoard[row][col];

                cell.classList.add("given-cell");

            } else {

                // -------------------------
                // PLAYER CELL
                // -------------------------

                cell.classList.add("empty-cell");

                const answer =
                    playerAnswers[row][col];

                if (answer !== 0) {
                    cell.textContent = answer;
                    if (
                        answer ===
                        solutionBoard[row][col]
                    ) {
                        cell.classList.add(
                            "correct-cell"
                        );
                    } else {
                        cell.classList.add(
                            "wrong-cell"
                        );
                    }

                } else {
                    cell.textContent = "";
                }

                cell.addEventListener("click", function () {
                    selectCell(this);
                }
                );
            }
            sudokuBoard.appendChild(cell);
        }
    }
}

function highlightRelatedCells(selectedRow, selectedCol) {

    const size = solutionBoard.length;
    const cells = document.querySelectorAll(".sudoku-cell");

    // Remove previous highlights
    cells.forEach(function (cell) {
        cell.classList.remove("related-cell");
    });

    let boxRows;
    let boxCols;

    if (size === 6) {
        boxRows = 2;
        boxCols = 3;
    } else {
        boxRows = 3;
        boxCols = 3;
    }

    const selectedBoxRow =
        Math.floor(selectedRow / boxRows);

    const selectedBoxCol =
        Math.floor(selectedCol / boxCols);

    cells.forEach(function (cell) {

        const row = Number(cell.dataset.row);
        const col = Number(cell.dataset.col);

        const sameRow = row === selectedRow;
        const sameColumn = col === selectedCol;

        const sameBox =
            Math.floor(row / boxRows) === selectedBoxRow &&
            Math.floor(col / boxCols) === selectedBoxCol;

        if (sameRow || sameColumn || sameBox) {
            cell.classList.add("related-cell");
        }
    });
}


function moveSelectedCell(direction) {

    if (selectedCell === null) {
        return;
    }

    const size = solutionBoard.length;
    let row = Number(selectedCell.dataset.row);
    let col = Number(selectedCell.dataset.col);

    switch (direction) {
        case "ArrowUp":
            row--;
            break;
        case "ArrowDown":
            row++;
            break;
        case "ArrowLeft":
            col--;
            break;
        case "ArrowRight":
            col++;
            break;
    }

    // Don't move outside board
    if (
        row < 0 ||
        row >= size ||
        col < 0 ||
        col >= size
    ) {
        return;
    }

    const nextCell = document.querySelector(
        `.sudoku-cell[data-row="${row}"][data-col="${col}"]`
    );

    selectCell(nextCell);
}