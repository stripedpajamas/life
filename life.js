const gameDiv = document.getElementById('life')
const helpModal = document.getElementById('help')

let helpOpen = false
function showHelp () {
  helpModal.style.display = 'block'
  helpOpen = true
}

window.addEventListener('click', (e) => {
  if (e.target == helpModal) {
    helpModal.style.display = 'none'
  }
})

function isTouchScreen() { 
	return ('ontouchstart' in window) || 
		(navigator.maxTouchPoints > 0) || 
		(navigator.msMaxTouchPoints > 0) 
}

function hideHelp () {
  helpModal.style.display = 'none'
  helpOpen = false
}

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

      gameDiv.appendChild(el)

      elements.set(key, el)
    }
  }

  return { elements, rows, columns }
}

function getLiveNeighborCount (state, row, col) {
  const rows = state.length
  const cols = state[state.length - 1].length

  return 0 +
    state[((row - 1) + rows) % rows][((col - 1) + cols) % cols] +
    state[((row - 1) + rows) % rows][col] +
    state[((row - 1) + rows) % rows][(col + 1) % cols] +
    state[row][((col - 1) + cols) % cols] +
    state[row][(col + 1) % cols] +
    state[(row + 1) % rows][((col - 1) + cols) % cols] +
    state[(row + 1) % rows][col] +
    state[(row + 1) % rows][(col + 1) % cols]
}

function computeNextState (state, next) {
  for (let r = 0; r < state.length; r++) {
    for (let c = 0; c < state[r].length; c++) {
      next[r][c] = 0

      const current = state[r][c]
      const alive = !!current

      const neighbors = getLiveNeighborCount(state, r, c)

      if (alive) {
        if (neighbors === 2 || neighbors === 3) {
          next[r][c] = 1
        } else {
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

function updateElement (el, alive) {
  if (alive) {
    el.classList.add('alive')
  } else {
    el.classList.remove('alive')
  }
}

function updateBoard (board, state) {
	let totalAlive = 0
  for (let r = 0; r < state.length; r++) {
    for (let c = 0; c < state[r].length; c++) {
      const key = `${r}-${c}`
      const el = board.elements.get(key)
      updateElement(el, state[r][c])

			totalAlive += state[r][c]
    }
  }

	return totalAlive
}

function addClickHandlers (board, funcs) {
  const { rows, columns } = board
  const { flip, set, isMouseDown } = funcs
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      const key = `${r}-${c}`
      const el = board.elements.get(key)
      el.addEventListener('click', () => flip(r, c))
      el.addEventListener('mouseover', () => {
        if (isMouseDown()) {
          set(r, c, 1)
        }
      })
    }
  }
}

function play (board) {
  const { rows, columns, elements } = board

  let state = new Array(rows).fill(0).map(_ => new Array(columns).fill(0))
  let next = new Array(rows).fill(0).map(_ => new Array(columns).fill(0))
  let gameInterval
  let grid = true

  let mouseDown = false
  document.addEventListener('mousedown', () => {
    mouseDown = true
  })
  document.addEventListener('mouseup', () => {
    mouseDown = false
  })

  let isMouseDown = () => mouseDown

  // init with random
  randomState(0.8)
  updateBoard(board, state)
  addClickHandlers(board, {
    flip,
    set,
    isMouseDown
  })

  if (isTouchScreen()) { // no keyboard shortcuts for phones etc
    start()
  }

  function set (row, col, val, update = false) {
    state[row][col] = val
    updateElement(elements.get(`${row}-${col}`), val)
    if (update) updateBoard(board, state)
  }

  function get (row, col) {
    return state[row][col]
  }

  function flip (row, col) {
    set(row, col, Number(!get(row, col)))
  }

  function toggleGrid () {
    for (const el of elements.values()) {
      el.classList[grid ? 'add' : 'remove']('noborders')
    }
    gameDiv.classList[grid ? 'add' : 'remove']('noborders')
    grid = !grid
  }

  function clearState () {
    for (let r = 0; r < state.length; r++) {
      for (let c = 0; c < state[r].length; c++) {
        set(r, c, 0, false)
      }
    }
  }

  function randomState (weight) {
    for (let r = 0; r < state.length; r++) {
      for (let c = 0; c < state[r].length; c++) {
        if (flipCoin(weight)) {
          set(r, c, 1, false)
        }
      }
    }
  }

  function copy(src, dst) {
    for (let r = 0; r < src.length; r++) {
      for (let c = 0; c < src[src.length - 1].length; c++) {
        dst[r][c] = src[r][c]
      }
    }
  }

  function game () {
    computeNextState(state, next)
    copy(next, state)

    const totalAlive = updateBoard(board, state)
		if (!totalAlive) stop()
  }

  function playPause () {
    if (gameInterval) {
      stop()
    } else {
      start()
    }
  }

  function start () {
    if (!gameInterval) {
      if (!document.title.includes('▶')) {
        document.title = '▶ ' + document.title
      }
      // TODO manually adjust speed
      gameInterval = setInterval(game, 100)
    }
  }

  function stop () {
    if (gameInterval) {
      if (document.title.includes('▶')) {
        document.title = document.title.slice(2)
      }
      clearInterval(gameInterval)
      gameInterval = null
    }
  }

  document.addEventListener('keydown', (key) => {
    switch (key.key) { // pause with spacebar
      case ' ': {
        playPause()
        break
      }
      case 'c': { // clear screen
        stop()
        clearState()
        updateBoard(board, state)
        break
      }
      case 'r': { // random state
        if (key.metaKey || key.ctrlKey) return
        randomState(0.8)
        updateBoard(board, state)
        break
      }
      case 'g': { // toggle grid
        toggleGrid()
        break
      }
      default: {}
    }
  });
}

let rowCount = Math.floor((window.innerHeight - 20) / 10)
let colCount = Math.floor((window.innerWidth - 20) / 10)

const board = createBoard(rowCount, colCount)
play(board)

document.addEventListener('keydown', (key) => {
  switch (key.key) {
    case '?': {
      showHelp()
      break
    }
    case 'Escape': {
      hideHelp()
      break
    }
  }
})
