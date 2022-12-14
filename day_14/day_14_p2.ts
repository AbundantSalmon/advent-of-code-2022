const directory = new URL('.', import.meta.url).pathname
const inputText = Deno.readTextFileSync(directory + '/input.txt')
const lines = inputText.split('\n')

const sandStartPoint = [500, 0]
const AIR = '.'
const ROCK = '#'
const SAND = '+'

class SandMovementError extends Error {
  constructor(message: string) {
    super(message)

    this.name = this.constructor.name
  }
}

let lowestY = 0
let furtherestX = 0

const rockLines = lines.map(line => {
  const points = line.split(' -> ')
  return points.map(point => {
    const pointArray = point.split(',').map(value => parseInt(value))

    if (pointArray[0] > furtherestX) {
      furtherestX = pointArray[0]
    }
    if (pointArray[1] > lowestY) {
      lowestY = pointArray[1]
    }
    return pointArray
  })
})

class Sand {
  locationX: number = sandStartPoint[0]
  locationY: number = sandStartPoint[1]
  grid: string[][]
  constructor(grid: string[][]) {
    this.grid = grid
    this.grid[this.locationY][this.locationX] = SAND
  }

  canMove(): boolean {
    if (grid[this.locationY + 1][this.locationX] === AIR) {
      return true
    } else if (grid[this.locationY + 1][this.locationX - 1] === AIR) {
      return true
    } else if (grid[this.locationY + 1][this.locationX + 1] === AIR) {
      return true
    }
    if (this.locationY === sandStartPoint[1] && this.locationX === sandStartPoint[0]) {
      throw new SandMovementError('No movement from start point')
    }
    return false
  }

  move(): void {
    this.grid[this.locationY][this.locationX] = AIR
    if (grid[this.locationY + 1][this.locationX] === AIR) {
      this.grid[this.locationY + 1][this.locationX] = SAND
      this.locationY = this.locationY + 1
    } else if (grid[this.locationY + 1][this.locationX - 1] === AIR) {
      this.grid[this.locationY + 1][this.locationX - 1] = SAND
      this.locationY = this.locationY + 1
      this.locationX = this.locationX - 1
    } else if (grid[this.locationY + 1][this.locationX + 1] === AIR) {
      this.grid[this.locationY + 1][this.locationX + 1] = SAND
      this.locationY = this.locationY + 1
      this.locationX = this.locationX + 1
    } else {
      throw new Error('move called when it was not possible to move')
    }
  }
}

const width = furtherestX + 500 // expand floor to take into account all sand. Probably can be done more efficiently
const floor = lowestY + 2
const height = floor + 1

const grid: string[][] = Array.from({ length: height }, () => AIR).map(_ => {
  return Array(width).fill(AIR)
})

rockLines.forEach(line => {
  for (let i = 0; i < line.length - 1; ++i) {
    const point1 = line[i]
    const point2 = line[i + 1]

    let changingIndex = -1
    let nonChangingIndex = -1

    if (point1[0] === point2[0]) {
      changingIndex = 1
      nonChangingIndex = 0
    } else if (point1[1] === point2[1]) {
      changingIndex = 0
      nonChangingIndex = 1
    } else {
      throw new Error('unexpected line')
    }

    const greater = Math.max(point1[changingIndex], point2[changingIndex])
    const lesser = Math.min(point1[changingIndex], point2[changingIndex])

    for (let j = lesser; j <= greater; ++j) {
      if (changingIndex === 1) {
        grid[j][point1[nonChangingIndex]] = ROCK
      } else {
        grid[point1[nonChangingIndex]][j] = ROCK
      }
    }
  }
})

// Add floor
Array.from({ length: grid[0].length }, (_, index) => index).forEach(column => {
  grid[floor][column] = ROCK
})

let sandHasBottomed = false
let count = 0
while (!sandHasBottomed) {
  const sand = new Sand(grid)
  count++
  console.log(count)
  try {
    while (sand.canMove()) {
      sand.move()
    }
  } catch (e) {
    if (e instanceof SandMovementError) {
      sandHasBottomed = true
    } else {
      grid.forEach(row => {
        console.log(row.join(''))
      })
      throw e
    }
  }
}

let sandCount = 0
grid.forEach(row => {
  row.forEach(point => {
    if (point === SAND) {
      sandCount++
    }
  })
})

// grid.forEach(row => {
//   console.log(row.join(''))
// })

console.log(sandCount)
