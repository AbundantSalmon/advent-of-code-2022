const directory = new URL('.', import.meta.url).pathname
const inputText = Deno.readTextFileSync(directory + '/input.txt')
const lines = inputText.split('\n')

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

const rockRecords = {
  hLineRock: hLineRock,
  crossRock: crossRock,
  lRock: lRock,
  vLineRock: vLineRock,
  squareRock: squareRock,
}
const rocks: (keyof typeof rockRecords)[] = [
  ...Object.keys(rockRecords),
] as (keyof typeof rockRecords)[]

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

const heightOfTower = (tunnel: Tunnel) => {
  const tallestPointIndex = findRowOfHighestStoppedRock(tunnel)
  const heightOfTower = tunnel.length - tallestPointIndex - 1 // minus the floor
  return heightOfTower
}

function run(numberOfRocks: number, tunnel: Tunnel) {
  let numberOfRocksDropped = 0
  let commandIndex = 0
  const numDroppedVsHeightCache: Record<number, number> = {}
  const rockIdStartEndCommandCache: string[] = []
  while (numberOfRocksDropped !== numberOfRocks) {
    const rockID = rocks[numberOfRocksDropped % rocks.length]
    const rockToAppear = rockRecords[rockID]
    addSpaceInTunnel(tunnel, rockToAppear)
    const xy = findXAndYPositionOfRock(tunnel, rockToAppear)
    let currentX = xy[0]
    let currentY = xy[1]

    let rockStopped = false
    let commandsForRock = ''
    while (!rockStopped) {
      const nextCommand = commands[commandIndex % commands.length]
      commandsForRock += nextCommand.action
      commandIndex++
      const newXY = shiftRockCommand(tunnel, nextCommand, rockToAppear, currentX, currentY)
      const [rockResult, finalXY] = dropRockCommand(tunnel, rockToAppear, newXY[0], newXY[1])
      rockStopped = rockResult
      currentX = finalXY[0]
      currentY = finalXY[1]
    }

    putNewRockInTunnel(tunnel, rockToAppear, currentX, currentY)

    ++numberOfRocksDropped

    const tallestPointIndex = findRowOfHighestStoppedRock(tunnel)

    // This is probably a terrible key and only works by chance 😅
    const rockAndCommands = `${rockID}${commandIndex % commands.length}${commandsForRock}${tunnel[
      tallestPointIndex
    ].join('')}${tunnel[tallestPointIndex + 1].join('')}${tunnel[tallestPointIndex + 2]?.join(
      ''
    )}${tunnel[tallestPointIndex + 3]?.join('')}`
    rockIdStartEndCommandCache.push(rockAndCommands)
    const currentHeightOfTower = heightOfTower(tunnel)
    numDroppedVsHeightCache[numberOfRocksDropped] = currentHeightOfTower

    const indices = getCycleIndices(rockIdStartEndCommandCache)
    if (indices !== null ){
      const rockCyclePeriod = indices[1] - indices[0]
      const heightChangeOverPeriod =
        numDroppedVsHeightCache[indices[1] + 1] - numDroppedVsHeightCache[indices[0] + 1]

      const startRock = indices[0] + 1
      const remainingRocks = numberOfRocks - startRock
      const remainingPeriods = Math.floor(remainingRocks / rockCyclePeriod)
      const remainingPeriodHeightChange = remainingPeriods * heightChangeOverPeriod
      const leftOverRemainingRocks = remainingRocks % rockCyclePeriod
      const leftOverHeight =
        numDroppedVsHeightCache[leftOverRemainingRocks + indices[0] + 1] -
        numDroppedVsHeightCache[indices[0] + 1]

      return numDroppedVsHeightCache[indices[0] + 1] + remainingPeriodHeightChange + leftOverHeight
    }
  }
}

const getCycleIndices = (rockIdStartEndCommandCache: string[], startIndex = 0) => {
  let tortoiseIndex = startIndex
  let hareIndex = startIndex + 1

  if (!rockIdStartEndCommandCache[tortoiseIndex] || !rockIdStartEndCommandCache[hareIndex]) {
    return null
  }
  while (rockIdStartEndCommandCache[hareIndex] && rockIdStartEndCommandCache[hareIndex + 1]) {
    if (
      rockIdStartEndCommandCache[tortoiseIndex] === undefined ||
      rockIdStartEndCommandCache[hareIndex] === undefined
    ) {
      return null
    }

    if (rockIdStartEndCommandCache[tortoiseIndex] === rockIdStartEndCommandCache[hareIndex]) {
      //cycle found
      return [tortoiseIndex, hareIndex]
    }
    tortoiseIndex++
    hareIndex += 2
  }
  return null
}
const numOfRuns = 1000000000000

const heightOfOneRun = run(numOfRuns, tunnel)

tunnel.forEach((tunnel, index, array) =>
  console.log(tunnel.join('') + ' : ' + (array.length - index - 1))
)
console.log(heightOfOneRun)
