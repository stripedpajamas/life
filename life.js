const gameDiv = document.getElementById('life')

function flipCoin (weight) {
  return Math.random() > weight
}

function createBoard (rows, columns) {
  const elements = new Map()
  gameDiv.style.gridTemplateColumns = `repeat(${columns}, 10px)`
  gameDiv.style.gridTemplateRows = `repeat(${rows}, 10px)`

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      const el = document.createElement('div')
      const key = `${r}-${c}`
      el.setAttribute('id', `node-${key}`)
      el.classList.add('node')

      if (flipCoin(0.8)) el.classList.add('alive')
      gameDiv.appendChild(el)

      elements.set(key, el)
    }
  }

  return {
    elements,
    rows,
    columns
  }
}

function getLiveNeighborCount (state, row, col) {
  const rows = state.length
  const cols = state[state.length - 1].length

  return 0 +
    state[(row - 1 + rows) % rows][(col - 1 + cols) % cols] +
    state[(row - 1 + rows) % rows][col] +
    state[(row - 1 + rows) % rows][(col + 1) % cols] +
    state[row][(col - 1 + cols) % cols] +
    state[row][(col + 1) % cols] +
    state[(row + 1) % rows][(col - 1 + cols) % cols] +
    state[(row + 1) % rows][col] +
    state[(row + 1) % rows][(col + 1) % cols]
}

function computeNextState (state, next) {
  for (let r = 0; r < state.length; r++) {
    for (let c = 0; c < state[r].length; c++) {
      const current = state[r][c]
      const alive = !!current

      const neighbors = getLiveNeighborCount(state, r, c)

      if (alive) {
        if (neighbors < 2) {
          next[r][c] = 0
        } else if (neighbors === 2 || neighbors === 3) {
          next[r][c] = 1
        } else if (neighbors > 3) {
          next[r][c] = 0
        }
      } else {
        if (neighbors === 3) {
          next[r][c] = 1
        }
      }
    }
  }
}

function updateBoard (board, state) {
  for (let r = 0; r < state.length; r++) {
    for (let c = 0; c < state[r].length; c++) {
      const key = `${r}-${c}`
      const el = board.elements.get(key)
      if (state[r][c]) {
        el.classList.add('alive')
      } else {
        el.classList.remove('alive')
      }
    }
  }
}

function play (board) {
  const { rows, columns, elements } = board

  let state = new Array(rows).fill(0).map(_ => new Array(columns).fill(0))
  let next = new Array(rows).fill(0).map(_ => new Array(columns).fill(0))

  // prime state from the random bs during board creation
  for (const [key, el] of elements.entries()) {
    if (el.classList.contains('alive')) {
      const [r, c] = key.split('-')
      state[r][c] = 1
    }
  }

  function game () {
    computeNextState(state, next) // mutates next

    // swap state and next
    let tmp = state
    state = next
    next = state

    updateBoard(board, state)
  }

  // TODO manually adjust speed
  let gameInterval

  // pause with spacebar
  document.addEventListener('keydown', (key) => {
    if (key.code === 'Space') {
      if (gameInterval) {
        clearInterval(gameInterval)
        gameInterval = null
      } else {
        gameInterval = setInterval(game, 100)
      }
    }
  });
}

let rowCount = Math.floor((window.innerHeight - 20) / 10)
let colCount = Math.floor((window.innerWidth - 20) / 10)

const board = createBoard(rowCount, colCount)
play(board)

