// ========================
// SUDOKU GENERATOR
// ========================

function generateSolvedBoard(size, randomFn = Math.random) {

    // 16x16 uses an optimized pattern generator
    if (size === 16) {
        return generate16x16Board(randomFn);
    }

    // Existing generator for 6x6 and 9x9
    const board = Array.from(
        { length: size },
        () => Array(size).fill(0)
    );

    fillBoard(board, size, randomFn);

    return board;
}


// =========================
// FAST 16x16 GENERATOR
// =========================

function generate16x16Board(randomFn = Math.random) {

    const size = 16;
    const boxSize = 4;

    const board = Array.from(
        { length: size },
        () => Array(size).fill(0)
    );

    /*
     * Base pattern for a valid 16x16 Sudoku.
     *
     * This avoids brute-force backtracking completely.
     */
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const value =
                (row * boxSize +
                    Math.floor(row / boxSize) +
                    col
                ) % size;

            board[row][col] = value + 1;
        }
    }


    // =========================
    // RANDOMIZE NUMBERS
    // =========================

    const numbers = [];

    for (let i = 1; i <= size; i++) {
        numbers.push(i);
    }

    shuffle(numbers, randomFn);


    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            board[row][col] =
                numbers[board[row][col] - 1];
        }
    }


    // =========================
    // RANDOMIZE ROWS
    // =========================

    const rowOrder = create16x16RowOrder(randomFn);
    const shuffledRows = rowOrder.map(row => [...board[row]]);
    return shuffledRows;
}


// =========================
// RANDOM ROW ORDER
// =========================

function create16x16RowOrder(randomFn) {

    const bands = [
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [8, 9, 10, 11],
        [12, 13, 14, 15]
    ];

    shuffle(bands, randomFn);

    for (let band of bands) {
        shuffle(band, randomFn);
    }

    return bands.flat();
}


// =========================
// BACKTRACKING
// =========================

function fillBoard(board, size, randomFn = Math.random) {
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (board[row][col] === 0) {
                let numbers = [];
                for (let num = 1; num <= size; num++) {
                    numbers.push(num);
                }

                shuffle(numbers, randomFn);

                for (let number of numbers) {
                    if (isValid(board,row,col,number,size)) {
                        board[row][col] = number;

                        if (fillBoard(board,size,randomFn)
                        ) {
                            return true;
                        }
                        board[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
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
    } else if (size === 16) {
        boxRows = 4;
        boxCols = 4;
    } else {
        boxRows = 3;
        boxCols = 3;
    }

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


// =======================
// SHUFFLE ARRAY
// =======================

function shuffle(array, randomFn = Math.random) {
    for (let i = array.length - 1; i > 0; i--) {
        const j =
            Math.floor(
                randomFn() * (i + 1)
            );

        [array[i],array[j]] = [array[j],array[i]];
    }
    return array;
}


// =======================
// DAILY CHALLENGE SEED
// =======================

function getDailySeed() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    return (
        year * 10000 +
        month * 100 +
        day
    );
}


// =======================
// SEEDED RANDOM
// =======================

function createSeededRandom(seed) {
    let value = seed;
    return function () {
        value = (value * 9301 +49297) % 233280;
        return value / 233280;
    };
}


// =======================
// COUNT SOLUTIONS
// =======================

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

    // No empty cells
    if (emptyRow === -1) {
        return 1;
    }

    let solutionCount = 0;

    for (
        let number = 1;
        number <= size;
        number++
    ) {

        if (isValid(board,emptyRow,emptyCol,number,size)
        ) {
            board[emptyRow][emptyCol] = number;

            solutionCount += countSolutions(board,size,limit);

            // Undo
            board[emptyRow][emptyCol] = 0;

            // We only care about multiple solutions
            if (solutionCount >= limit) {
                return solutionCount;
            }
        }
    }

    return solutionCount;
}

// ==========================================
// 16x16 PUZZLE GENERATOR
// ==========================================

function create16x16Puzzle(
    solutionBoard,
    difficulty,
    randomFn = Math.random
) {
    const size = 16;
    const puzzle = solutionBoard.map(row => [...row]);
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

    const targetRemovals = Math.floor(size * size * removePercent);

    const positions = [];

    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            positions.push({
                row: row,
                col: col
            });
        }
    }

    shuffle(positions, randomFn);

    for (let i = 0; i < targetRemovals; i++) {
        const position = positions[i];

        puzzle[position.row][position.col] = 0;
    }
    return puzzle;
}


// =======================
// CREATE PUZZLE
// =======================

function createPuzzle(
    solutionBoard,
    size,
    difficulty,
    randomFn = Math.random
) {

    // Copy solved board
    const puzzle =
        solutionBoard.map(function (row) {
            return [...row];
        });


    // =================
    // DIFFICULTY
    // =================

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


    // ========================================
    // 16x16 SPECIAL MODE
    // ========================================

    /*
     * DO NOT run countSolutions() for every cell on 16x16.
     *
     * That was the reason the browser was freezing.
     *
     * Instead, remove cells directly from the already
     * valid solved board.
     */

    if (size === 16) {
        return create16x16Puzzle(
            solutionBoard,
            difficulty,
            randomFn
        );
    }


    // =====================================================
    // EXISTING 6x6 / 9x9 PUZZLE GENERATION
    // =====================================================

    const positions = [];
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            positions.push({
                row: row,
                col: col
            });
        }
    }

    shuffle(positions,randomFn);

    // ====================
    // REMOVE NUMBERS
    // ====================

    let removed = 0;

    for (let position of positions) {
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
        const testBoard =
            puzzle.map(function (row) {
                return [...row];
            });

        const solutions = countSolutions(testBoard,size);

        if (solutions === 1) {
            removed++;
        } else {
            // Put number back
            puzzle[row][col] = backup;
        }
    }
    return puzzle;
}