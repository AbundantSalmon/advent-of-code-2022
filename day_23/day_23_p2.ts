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

let numberOfRounds = 0
while (true) {
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

  if (Object.keys(nextLocation).length === 0) {
    break
  }

  // change checking
  const oldCheckDirection = directionsToConsider.shift()
  if (oldCheckDirection === undefined) {
    throw new Error('unexpected state')
  }
  directionsToConsider.push(oldCheckDirection)

  // reset utility data structures
  currentOccupiedLocations = new Set()
  nextLocation = {}

  ++numberOfRounds
}

console.log(numberOfRounds + 1)
