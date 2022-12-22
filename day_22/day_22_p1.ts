const directory = new URL('.', import.meta.url).pathname
const inputText = Deno.readTextFileSync(directory + '/input.txt')
const lines = inputText.split('\n')

const pointToString = (point: [number, number]): string => {
  return `${point[0]},${point[1]}`
}

const stringToPoint = (pointStr: string): [number, number] => {
  const components = pointStr.split(',')
  if (components.length !== 2) {
    throw new Error('invalid point')
  }
  return [parseInt(components[0]), parseInt(components[1])]
}

// column, row starting at 1
const EMPTY = '.'
const WALL = '#'
type MapSpaces = Record<string, typeof EMPTY | typeof WALL>

interface MoveSpaces {
  action: 'move'
  spacesNumber: number
}

interface Turn {
  action: 'turn'
  direction: 'L' | 'R'
}

type Movement = MoveSpaces | Turn

const mapSpaces: MapSpaces = {}
const movements: Movement[] = []

type FacingDirection = 'N' | 'E' | 'S' | 'W'

let startPosition: null | [number, number] = null
const startFacingDirection: FacingDirection = 'E'
const maxEast = lines[0].length
const maxSouth = lines.length - 2

type Input = `${FacingDirection},${'L' | 'R'}`

type TurnMapping = {
  [Property in Input]: FacingDirection
}
const turnMapping: TurnMapping = {
  'E,L': 'N',
  'E,R': 'S',
  'N,L': 'W',
  'N,R': 'E',
  'W,L': 'S',
  'W,R': 'N',
  'S,L': 'E',
  'S,R': 'W',
}

lines.forEach((line, rowIndex) => {
  if (rowIndex !== lines.length - 1) {
    const spaces = line.split('')
    spaces.forEach((space, columnIndex) => {
      if (space === EMPTY || space === WALL) {
        if (startPosition === null) {
          startPosition = [columnIndex + 1, rowIndex + 1]
        }
        mapSpaces[`${columnIndex + 1},${rowIndex + 1}`] = space
      }
    })
  } else {
    let accumulated = ''
    line.split('').forEach((char, index) => {
      const parsed = parseInt(char)
      if (isNaN(parsed)) {
        movements.push({
          action: 'move',
          spacesNumber: parseInt(accumulated),
        })
        accumulated = ''
        if (char === 'L' || char === 'R') {
          movements.push({
            action: 'turn',
            direction: char,
          })
        } else {
          throw new Error('unexpected char')
        }
      } else {
        accumulated += char
      }
    })
    if (accumulated !== '') {
      movements.push({
        action: 'move',
        spacesNumber: parseInt(accumulated),
      })
    }
  }
})

if (startPosition === null) {
  throw new Error('unexpected state')
}

let currentPosition: [number, number] = startPosition
let currentFacing: FacingDirection = startFacingDirection

movements.forEach(movement => {
  if (movement.action === 'move') {
    const move = [0, 0]
    if (currentFacing === 'N') {
      move[1] = -1
    } else if (currentFacing === 'S') {
      move[1] = 1
    } else if (currentFacing === 'E') {
      move[0] = 1
    } else if (currentFacing === 'W') {
      move[0] = -1
    }

    for (let i = 0; i < movement.spacesNumber; ++i) {
      const newPoint: [number, number] = [
        currentPosition[0] + move[0],
        currentPosition[1] + move[1],
      ]

      const nextSpace = pointToString(newPoint)
      if (nextSpace in mapSpaces) {
        const spaceType = mapSpaces[nextSpace]
        if (spaceType === EMPTY) {
          currentPosition = [...newPoint]
        } else {
          break
        }
      } else {
        // wrap around
        let nextWrapSpace: [number, number] = [...currentPosition]
        if (currentFacing === 'N') {
          nextWrapSpace = [currentPosition[0], maxSouth]
        } else if (currentFacing === 'S') {
          nextWrapSpace = [currentPosition[0], 1]
        } else if (currentFacing === 'E') {
          nextWrapSpace = [0, currentPosition[1]]
        } else if (currentFacing === 'W') {
          nextWrapSpace = [maxEast, currentPosition[1]]
        }
        let found = false
        while (!found) {
          const nextWrapSpaceString = pointToString(nextWrapSpace)
          if (nextWrapSpaceString in mapSpaces) {
            found = true
          } else {
            nextWrapSpace = [nextWrapSpace[0] + move[0], nextWrapSpace[1] + move[1]]
          }
        }
        const foundWrapString = pointToString(nextWrapSpace)
        if (mapSpaces[foundWrapString] === '.') {
          currentPosition = [...nextWrapSpace]
        } else {
          break
        }
      }
    }
  } else if (movement.action === 'turn') {
    currentFacing = turnMapping[`${currentFacing},${movement.direction}`]
  } else {
    throw new Error('unexpected value')
  }
})

const directionValueMap: Record<FacingDirection, number> = {
  E: 0,
  S: 1,
  W: 2,
  N: 3,
}

const passCode =
  1000 * currentPosition[1] + 4 * currentPosition[0] + directionValueMap[currentFacing]

console.log(passCode)