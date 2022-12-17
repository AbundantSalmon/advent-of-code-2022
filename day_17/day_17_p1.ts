const directory = new URL('.', import.meta.url).pathname
const inputText = Deno.readTextFileSync(directory + '/input.txt')
const lines = inputText.split('\n')

function range(start: number, stop?: number, step?: number) {
  // taken from stackoverflow, range function like python
  if (typeof stop == 'undefined') {
    // one param defined
    stop = start
    start = 0
  }

  if (typeof step == 'undefined') {
    step = 1
  }

  if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
    return []
  }

  const result = []
  for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
    result.push(i)
  }

  return result
}

interface Command {
  action: 'left' | 'right'
}

const commands: Command[] = lines[0].split('').map(character => {
  if (character === '<') {
    return { action: 'left' }
  } else if (character === '>') {
    return { action: 'right' }
  }
  throw new Error('unexpected input')
})

const SPACE = '.'
const ROCK = '@'
const STOPPED_ROCK = '#'

type Tunnel = [string, string, string, string, string, string, string][]

const hLineRock: string[][] = [[ROCK, ROCK, ROCK, ROCK]]
const crossRock: string[][] = [
  [SPACE, ROCK, SPACE],
  [ROCK, ROCK, ROCK],
  [SPACE, ROCK, SPACE],
]
const lRock: string[][] = [
  [SPACE, SPACE, ROCK],
  [SPACE, SPACE, ROCK],
  [ROCK, ROCK, ROCK],
]
const vLineRock: string[][] = [[ROCK], [ROCK], [ROCK], [ROCK]]
const squareRock: string[][] = [
  [ROCK, ROCK],
  [ROCK, ROCK],
]
const rocks = [hLineRock, crossRock, lRock, vLineRock, squareRock]

let numberOfRocksDropped = 0

const tunnel: Tunnel = [
  [SPACE, SPACE, SPACE, SPACE, SPACE, SPACE, SPACE],
  [SPACE, SPACE, SPACE, SPACE, SPACE, SPACE, SPACE],
  [SPACE, SPACE, SPACE, SPACE, SPACE, SPACE, SPACE],
  [
    STOPPED_ROCK,
    STOPPED_ROCK,
    STOPPED_ROCK,
    STOPPED_ROCK,
    STOPPED_ROCK,
    STOPPED_ROCK,
    STOPPED_ROCK,
  ],
]

const findRowOfHighestStoppedRock = (tunnel: Tunnel) => {
  let highestStoppedRock = -1
  let row = 0
  while (highestStoppedRock === -1) {
    const found = tunnel[row].find(space => space === STOPPED_ROCK)
    if (found) {
      highestStoppedRock = row
    }
    ++row
  }
  return highestStoppedRock
}

const findXAndYPositionOfRock = (tunnel: Tunnel, rockToAdd: string[][]): [number, number] => {
  const rowToStartOffset = findRowOfHighestStoppedRock(tunnel)
  const xValue = 2
  const yValue = rowToStartOffset - 3 - rockToAdd.length
  return [xValue, yValue]
}

const addSpaceInTunnel = (tunnel: Tunnel, rockToAdd: string[][]) => {
  const rowToStartOffset = findRowOfHighestStoppedRock(tunnel)
  const rowsToAddToTunnel = rockToAdd.length - (rowToStartOffset - 3)
  if (rowsToAddToTunnel > 0) {
    for (let i = 0; i < rowsToAddToTunnel; ++i) {
      tunnel.unshift([SPACE, SPACE, SPACE, SPACE, SPACE, SPACE, SPACE])
    }
  }
}

const shiftRockCommand = (
  tunnel: Tunnel,
  command: Command,
  rockToAdd: string[][],
  startX: number,
  startY: number
): [number, number] => {
  if (command.action === 'left') {
    const newX = startX - 1
    if (newX < 0) {
      return [startX, startY]
    }
    const overlap = rockToAdd.some((row, rowIndex) => {
      return row.some((column, columnIndex) => {
        if (column === ROCK && tunnel[rowIndex + startY][columnIndex + newX] === STOPPED_ROCK) {
          return true
        }
        return false
      })
    })
    if (overlap) {
      return [startX, startY]
    }
    return [newX, startY]
  } else if (command.action === 'right') {
    const maxX = tunnel[0].length - rockToAdd[0].length
    const newX = startX + 1
    if (newX > maxX) {
      return [startX, startY]
    }
    const overlap = rockToAdd.some((row, rowIndex) => {
      return row.some((column, columnIndex) => {
        if (column === ROCK && tunnel[rowIndex + startY][columnIndex + newX] === STOPPED_ROCK) {
          return true
        }
        return false
      })
    })
    if (overlap) {
      return [startX, startY]
    }
    return [newX, startY]
  } else {
    throw new Error('unexpected command')
  }
}

const dropRockCommand = (
  tunnel: Tunnel,
  rockToAdd: string[][],
  startX: number,
  startY: number
): [boolean, [number, number]] => {
  const newY = startY + 1

  const overlap = rockToAdd.some((row, rowIndex) => {
    return row.some((column, columnIndex) => {
      if (column === ROCK && tunnel[rowIndex + newY][columnIndex + startX] === STOPPED_ROCK) {
        return true
      }
      return false
    })
  })

  if (overlap) {
    return [true, [startX, startY]]
  }
  return [false, [startX, newY]]
}

const putNewRockInTunnel = (tunnel: Tunnel, rockToAdd: string[][], xPos: number, yPos: number) => {
  rockToAdd.forEach((row, rowIndex) => {
    return row.forEach((column, columnIndex) => {
      if (column === ROCK) {
        tunnel[rowIndex + yPos][columnIndex + xPos] = STOPPED_ROCK
      }
    })
  })
}

while (numberOfRocksDropped !== 2022) {
  const rockToAppear = rocks[numberOfRocksDropped % rocks.length]
  addSpaceInTunnel(tunnel, rockToAppear)
  const xy = findXAndYPositionOfRock(tunnel, rockToAppear)
  let currentX = xy[0]
  let currentY = xy[1]

  let rockStopped = false
  while (!rockStopped) {
    const nextCommand = commands.shift()
    if (nextCommand === undefined) {
      throw new Error('command not found')
    }
    commands.push(nextCommand) // insert back into the end of commands
    const newXY = shiftRockCommand(tunnel, nextCommand, rockToAppear, currentX, currentY)
    const [rockResult, finalXY] = dropRockCommand(tunnel, rockToAppear, newXY[0], newXY[1])
    rockStopped = rockResult
    currentX = finalXY[0]
    currentY = finalXY[1]
  }

  putNewRockInTunnel(tunnel, rockToAppear, currentX, currentY)

  // tunnel.forEach(row => console.log(row.join('')))
  ++numberOfRocksDropped
}

const tallestPointIndex = findRowOfHighestStoppedRock(tunnel)
const heightOfTower = tunnel.length - tallestPointIndex - 1 // minus the floor

console.log(heightOfTower)
