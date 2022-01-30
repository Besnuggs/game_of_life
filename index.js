// https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life
/**
 * Rules:
 * 
 * 1. Any live cell with fewer than two live neighbours dies, as if by underpopulation.
 * 2. Any live cell with two or three live neighbours lives on to the next generation.
 * 3. Any live cell with more than three live neighbours dies, as if by overpopulation.
 * 4. Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
 * 
 * These rules, which compare the behavior of the automaton to real life, can be condensed into the following:
 * 1. Any live cell with two or three live neighbours survives.
 * 2. Any dead cell with three live neighbours becomes a live cell.
 * 3. All other live cells die in the next generation. Similarly, all other dead cells stay dead.
 * 
 * To put the rules more simply:
 * - If dead cell (0), surrounded by 3 live cells (1s), it will be birthed (turned to 1)
 * - if live cell (1), surrounded by fewer than two live cells (< 2 '1s') OR surrounded by more than three lives cells (> 3 '1s'), it dies (turns to 0)
 */

const ROWS = 30
const COLS = 50
const CELL = 20
const MAX_ALIVE_NEIGHBORS = 3
const MIN_ALIVE_NEIGHBORS = 2
const LIGHTBLUE = 'rgb(122, 215, 240)'
const WHITE = 'rgb(255, 255, 255)'
const universe = document.getElementById('universe')
const generationCountDisplay = document.getElementById('generation-display')
const speedProgressionInput = document.getElementById('progression-speed')
const percentCellIsAliveInput = document.getElementById('percent-cell-is-alive')

const state = {
    internalN: 0,
    generation: 0,
    isProgressing: false,
    chanceToBeLivingCell: Number(percentCellIsAliveInput.value), // 1-100 percent
    currentCellState: {},
    nextCellState: {},
    progressionSpeed: Number(speedProgressionInput.value)
}

speedProgressionInput.onkeyup = (e) => {
    const { target: { value } } = e
    if (/[0-9]+/.test(value)) {
        state.progressionSpeed = Number(value)
    }
}

percentCellIsAliveInput.onkeyup = (e) => {
    const { target: { value } } = e
    if (/[0-9]+/.test(value)) {
        state.chanceToBeLivingCell = Number(value)
    }
}

const initializeUniverse = () => {
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            const cell = document.createElement('div')
            cell.style.position = 'absolute'
            cell.style.border = '1px solid black'
            cell.style.left = j * CELL + 'px'
            cell.style.top = i * CELL + 'px'
            cell.style.width = CELL + 'px'
            cell.style.height = CELL + 'px'
            cell.id = `${i}_${j}`
            cell.className = 'cell'
            if (state.chanceToBeLivingCell && Math.random() * (100 - 1) + 1 < state.chanceToBeLivingCell) {
                cell.style.backgroundColor = LIGHTBLUE
            }
            if (cell.style.backgroundColor === LIGHTBLUE) {
                state.currentCellState[cell.id] = 1
            } else {
                state.currentCellState[cell.id] = 0
            }
            universe.appendChild(cell)
        }
    }
}

const evolve = () => {
    const cells = document.getElementsByClassName('cell')
    for (const [cellId, cellState] of Object.entries(state.currentCellState)) {
        const [ row, col ] = cellId.split('_')
        const numericRow = Number(row)
        const numericCol = Number(col)
        const sumOfNeighbors = countNeighbors({ numericRow, numericCol })
        if (cellState === 1 && (sumOfNeighbors > MAX_ALIVE_NEIGHBORS || sumOfNeighbors < MIN_ALIVE_NEIGHBORS)) {
            state.nextCellState[cellId] = 0
        } else if (cellState === 0 && sumOfNeighbors === MAX_ALIVE_NEIGHBORS) {
            state.nextCellState[cellId] = 1
        } else {
            state.nextCellState[cellId] = cellState
        }
    }
    state.currentCellState = state.nextCellState
    state.nextCellState = {}
    for (const cell of cells) {
        if (state.currentCellState[cell.id]) {
            cell.style.backgroundColor = LIGHTBLUE
        } else {
            cell.style.backgroundColor = WHITE
        }
    }
}

const countNeighbors = ({ numericRow, numericCol }) => {
    let sum = 0;
    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            const col = (numericRow + i + COLS) % COLS
            const row = (numericCol + j + ROWS) % ROWS
            const cellId = `${col}_${row}`
            sum += state.currentCellState.hasOwnProperty(cellId) ? state.currentCellState[cellId] : 0
        }
    }
    sum -= state.currentCellState[`${numericRow}_${numericCol}`]
    return sum
}

const handleStateProgression = () => {
    const button = document.getElementById('start-button')
    state.isProgressing = !state.isProgressing
    if (state.isProgressing) {
        state.internalN = setInterval(() => {
            state.generation++
            generationCountDisplay.innerText = state.generation
            evolve()
        }, state.progressionSpeed)
        button.innerText = 'Stop'
    } else {
        clearInterval(state.internalN)
        button.innerText = 'Start'
    }
}

const clearUniverse = () => {
    state.generation = 0
    const cells = document.getElementsByClassName('cell')
    for (const cell of cells) {
        cell.style.background = WHITE
        state.currentCellState[cell.id] = 0
    }
}

const randomize = () => {
    clearUniverse()
    initializeUniverse()
}

initializeUniverse()

