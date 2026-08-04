// ==========================================
// SUDOKU GENERATOR
// ==========================================

function generateSolvedBoard(size) {
    const board = Array.from(
        { length: size },
        () => Array(size).fill(0)
    );

    const success = fillBoard(board, size);
    return board;
}

// ==========================================
// BACKTRACKING
// ==========================================

function fillBoard(board, size) {

    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            // Find empty cell
            if (board[row][col] === 0) {
                // Numbers 1 → size
                let numbers = [];
                for (let num = 1; num <= size; num++) {
                    numbers.push(num);
                }
                // Randomize numbers
                shuffle(numbers);

                for (let number of numbers) {
                    if (isValid(board, row, col, number, size)) {
                        // Try number
                        board[row][col] = number;

                        // Continue solving
                        if (fillBoard(board, size)) {
                            return true;
                        }
                        // Didn't work → undo
                        board[row][col] = 0;
                    }
                }
                // No number worked
                return false;
            }
        }
    }
    // No empty cells remain
    return true;
}


// ==========================================
// CHECK WHETHER NUMBER IS VALID
// ==========================================

function isValid(board, row, col, number, size) {

    // Check row
    for (let i = 0; i < size; i++) {
        if (board[row][i] === number) {
            return false;
        }
    }

    // Check column
    for (let i = 0; i < size; i++) {
        if (board[i][col] === number) {
            return false;
        }
    }

    // Box dimensions
    let boxRows;
    let boxCols;

    if (size === 6) {
        boxRows = 2;
        boxCols = 3;
    } else {
        boxRows = 3;
        boxCols = 3;
    }


    // Find starting position of box
    const startRow = Math.floor(row / boxRows) * boxRows;
    const startCol = Math.floor(col / boxCols) * boxCols;

    // Check box
    for (let r = 0; r < boxRows; r++) {
        for (let c = 0; c < boxCols; c++) {
            if (
                board[startRow + r][startCol + c] === number
            ) {
                return false;
            }
        }
    }
    return true;
}


// ==========================================
// SHUFFLE ARRAY
// ==========================================

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j =
            Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] =
            [array[j], array[i]];
    }
    return array;
}


function countSolutions(board, size, limit = 2) {
    let emptyRow = -1;
    let emptyCol = -1;
    // Find first empty cell
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (board[row][col] === 0) {
                emptyRow = row;
                emptyCol = col;
                break;
            }
        }
        if (emptyRow !== -1) {
            break;
        }
    }

    // No empty cells = one valid solution found
    if (emptyRow === -1) {
        return 1;
    }

    let solutionCount = 0;

    for (let number = 1; number <= size; number++) {
        if (
            isValid(
                board,
                emptyRow,
                emptyCol,
                number,
                size
            )
        ) {

            board[emptyRow][emptyCol] = number;
            solutionCount += countSolutions(
                board,
                size,
                limit
            );

            // Undo
            board[emptyRow][emptyCol] = 0;

            // We only care whether there is MORE than 1
            if (solutionCount >= limit) {
                return solutionCount;
            }
        }
    }
    return solutionCount;
}


function createPuzzle(solutionBoard, size, difficulty) {

    // Copy solved board
    const puzzle = solutionBoard.map(function (row) {
        return [...row];
    });

    // =========================
    // DIFFICULTY
    // =========================

    let removePercent;
    switch (difficulty) {
        case "easy":
            removePercent = 0.40;
            break;
        case "medium":
            removePercent = 0.50;
            break;
        case "hard":
            removePercent = 0.60;
            break;
        case "expert":
            removePercent = 0.70;
            break;
        default:
            removePercent = 0.50;
    }

    const totalCells = size * size;
    const targetRemovals = Math.floor(totalCells * removePercent);


    // =========================
    // CELL POSITIONS
    // =========================

    const positions = [];
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            positions.push({
                row: row,
                col: col
            });
        }
    }

    shuffle(positions);

    // =========================
    // REMOVE NUMBERS
    // =========================

    let removed = 0;

    for (let position of positions) {
        // Already reached target
        if (removed >= targetRemovals) {
            break;
        }

        const row = position.row;
        const col = position.col;
        // Save original number
        const backup = puzzle[row][col];
        // Temporarily remove
        puzzle[row][col] = 0;

        // Copy board for solver
        const testBoard = puzzle.map(function (row) {
            return [...row];
        });

        const solutions = countSolutions(testBoard, size);

        if (solutions === 1) {
            // Safe removal
            removed++;
        } else {
            // Multiple solutions:
            // put number back
            puzzle[row][col] = backup;
        }
    }

    return puzzle;
}