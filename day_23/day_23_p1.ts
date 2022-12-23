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

interface Elf {
  location: [number, number]
  proposedNextLocation: [number, number] | null
}
const elves: Elf[] = []
lines.forEach((line, rowIndex) => {
  line.split('').forEach((piece, columnIndex) => {
    if (piece === '#') {
      elves.push({
        location: [columnIndex, rowIndex],
        proposedNextLocation: null,
      })
    }
  })
})

let currentOccupiedLocations = new Set<string>()
let nextLocation: Record<string, number> = {}
const directionsToConsider: ('N' | 'S' | 'W' | 'E')[] = ['N', 'S', 'W', 'E']

for (let i = 0; i < 10; ++i) {
  // check phase
  elves.forEach(elf => {
    elf.proposedNextLocation = null
    currentOccupiedLocations.add(pointToString(elf.location))
  })
  elves.forEach(elf => {
    const north: [number, number] = [elf.location[0], elf.location[1] - 1]
    const northEast: [number, number] = [elf.location[0] + 1, elf.location[1] - 1]
    const northWest: [number, number] = [elf.location[0] - 1, elf.location[1] - 1]
    const south: [number, number] = [elf.location[0], elf.location[1] + 1]
    const southEast: [number, number] = [elf.location[0] + 1, elf.location[1] + 1]
    const southWest: [number, number] = [elf.location[0] - 1, elf.location[1] + 1]
    const west: [number, number] = [elf.location[0] - 1, elf.location[1]]
    const east: [number, number] = [elf.location[0] + 1, elf.location[1]]

    if (
      currentOccupiedLocations.has(pointToString(north)) ||
      currentOccupiedLocations.has(pointToString(northEast)) ||
      currentOccupiedLocations.has(pointToString(northWest)) ||
      currentOccupiedLocations.has(pointToString(south)) ||
      currentOccupiedLocations.has(pointToString(southEast)) ||
      currentOccupiedLocations.has(pointToString(southWest)) ||
      currentOccupiedLocations.has(pointToString(west)) ||
      currentOccupiedLocations.has(pointToString(east))
    ) {
      for (let directionIndex = 0; directionIndex < directionsToConsider.length; ++directionIndex) {
        const direction = directionsToConsider[directionIndex]
        if (direction === 'N') {
          if (
            !currentOccupiedLocations.has(pointToString(north)) &&
            !currentOccupiedLocations.has(pointToString(northEast)) &&
            !currentOccupiedLocations.has(pointToString(northWest))
          ) {
            elf.proposedNextLocation = north
            break
          }
        } else if (direction === 'S') {
          if (
            !currentOccupiedLocations.has(pointToString(south)) &&
            !currentOccupiedLocations.has(pointToString(southEast)) &&
            !currentOccupiedLocations.has(pointToString(southWest))
          ) {
            elf.proposedNextLocation = south
            break
          }
        } else if (direction === 'W') {
          if (
            !currentOccupiedLocations.has(pointToString(west)) &&
            !currentOccupiedLocations.has(pointToString(northWest)) &&
            !currentOccupiedLocations.has(pointToString(southWest))
          ) {
            elf.proposedNextLocation = west
            break
          }
        } else if (direction === 'E') {
          if (
            !currentOccupiedLocations.has(pointToString(east)) &&
            !currentOccupiedLocations.has(pointToString(northEast)) &&
            !currentOccupiedLocations.has(pointToString(southEast))
          ) {
            elf.proposedNextLocation = east
            break
          }
        }
      }
    }

    if (elf.proposedNextLocation !== null) {
      const nextLocationString = pointToString(elf.proposedNextLocation)
      if (!(nextLocationString in nextLocation)) {
        nextLocation[nextLocationString] = 0
      }
      nextLocation[nextLocationString]++
    }
  })

  // move phase
  elves.forEach(elf => {
    if (elf.proposedNextLocation !== null) {
      const proposedLocationString = pointToString(elf.proposedNextLocation)
      if (nextLocation[proposedLocationString] === 1) {
        elf.location = elf.proposedNextLocation
      }
    }

    elf.proposedNextLocation = null
  })

  // change checking
  const oldCheckDirection = directionsToConsider.shift()
  if (oldCheckDirection === undefined) {
    throw new Error('unexpected state')
  }
  directionsToConsider.push(oldCheckDirection)

  // reset utility data structures
  currentOccupiedLocations = new Set()
  nextLocation = {}
}

let minX = Number.MAX_SAFE_INTEGER
let maxX = Number.MIN_SAFE_INTEGER
let minY = Number.MAX_SAFE_INTEGER
let maxY = Number.MIN_SAFE_INTEGER

elves.forEach(elf => {
  if (elf.location[0] > maxX) {
    maxX = elf.location[0]
  }
  if (elf.location[0] < minX) {
    minX = elf.location[0]
  }
  if (elf.location[1] > maxY) {
    maxY = elf.location[1]
  }
  if (elf.location[1] < minY) {
    minY = elf.location[1]
  }
})

const area = (maxX - minX + 1) * (maxY - minY + 1)
const numberEmptyGround = area - elves.length

console.log(numberEmptyGround)

// elves.forEach(elf => {
//   elf.proposedNextLocation = null
//   currentOccupiedLocations.add(pointToString(elf.location))
// })

// console.log(currentOccupiedLocations)

// const map: string[][] = []
// for (let y = -5; y < 20; ++y) {
//   const row = []
//   for (let x = -5; x < 20; ++x) {
//     const location: [number, number] = [x, y]
//     const locationString = pointToString(location)
//     if (currentOccupiedLocations.has(locationString)) {
//       row.push('#')
//     } else {
//       row.push('.')
//     }
//   }
//   map.push(row)
// }

// map.forEach(row => {
//   console.log(row.join(''))
// })
