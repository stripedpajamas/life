const gameDiv = document.getElementById('life')

function flipCoin () {
  return Math.random() > .5
}

function createBoard (size) {
  const board = []

  for (let i = 0; i < size; i++) {
    const el = document.createElement('div')
    el.setAttribute('id', `node-${i}`)
    el.classList.add('node')
    if (flipCoin()) el.classList.add('alive')
    gameDiv.appendChild(el)
    board.push(el)
  }

  return board
}


function computeNextState (state, next) {
}

function play (board) {
  const state = new Array(board.length).fill(0)
  const next = new Array(board.length).fill(0)

  board.forEach((el, idx) => {
    if (el.classList.has('alive')) {
      state[idx] = 1
    }
  })

  // TODO manually adjust speed
  const gameInterval = setInterval(() => {
    computeNextState(state, next)

    for (const alive of next) {
    }

  }, 2000)
}

const board = createBoard(16)
play(board)

