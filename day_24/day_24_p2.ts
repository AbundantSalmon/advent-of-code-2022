const directory = new URL('.', import.meta.url).pathname
import { produce } from 'npm:immer@9.0.16'
import MinHeap from './heap.ts'

const inputText = Deno.readTextFileSync(directory + '/input.txt')
const lines = inputText.split('\n')

type Location = [number, number]

const pointToString = (point: Location): string => {
  return `${point[0]},${point[1]}`
}

const stringToPoint = (pointStr: string): Location => {
  const components = pointStr.split(',')
  if (components.length !== 2) {
    throw new Error('invalid point')
  }
  return [parseInt(components[0]), parseInt(components[1])]
}

type WallState = {
  [K: string]: '#'
}

interface Hurricane {
  type: '>' | 'v' | '<' | '^'
  location: string
}

const wallState: WallState = {}
let hurricaneState: Hurricane[] = []

const minX = 0
const maxX = lines[0].length - 1
const minY = 0
const maxY = lines.length - 1

const keyLength = Math.max(maxX, maxY) + 1

lines.forEach((line, rowIndex) => {
  line.split('').forEach((char, columnIndex) => {
    const locStr = pointToString([columnIndex, rowIndex])
    if (char === '#') {
      wallState[locStr] = char
    } else if (char === '>' || char === 'v' || char === '<' || char === '^') {
      hurricaneState.push({
        type: char,
        location: locStr,
      })
    } else if (char === '.') {
      // ignore
    } else {
      throw new Error(`unexpected input: ${char}`)
    }
  })
})

const heuristic = (current: Location, goal: Location, currentTime: number): number => {
  return Math.abs(current[0] - goal[0]) + Math.abs(current[1] - goal[1]) + currentTime
}

const show = (hurricanes: Hurricane[], walls: WallState, currentLocationStr: string) => {
  const space: Record<string, string> = { ...walls, [currentLocationStr]: 'E' }
  hurricanes.forEach(hurricane => {
    space[hurricane.location] = hurricane.type
  })

  for (let y = minY; y <= maxY; ++y) {
    const row = []
    for (let x = minX; x <= maxX; ++x) {
      const currentPoint: Location = [x, y]
      const currentPointStr = pointToString(currentPoint)
      if (currentPointStr in space) {
        row.push(space[currentPointStr])
      } else {
        row.push('.')
      }
    }
    console.log(row.join(''))
  }
}

const memoizedNextHurricane = (): ((currentHurricanes: Hurricane[]) => {
  nextHState: Hurricane[]
  stateKey: string
}) => {
  const hurricaneCache: Record<string, Hurricane[]> = {}
  return (currentHurricanes: Hurricane[]) => {
    const key = JSON.stringify(currentHurricanes)
    if (key in hurricaneCache) {
      return { nextHState: hurricaneCache[key], stateKey: key }
    } else {
      const nextHurricaneState: Hurricane[] = []
      currentHurricanes.forEach(({ type, location }) => {
        const locationPoint = stringToPoint(location)
        if (type === '<') {
          const nextLocationPoint: Location = [locationPoint[0] - 1, locationPoint[1]]
          let nextLocationStr = pointToString(nextLocationPoint)
          if (wallState[nextLocationStr] === '#') {
            nextLocationPoint[0] = maxX - 1
            nextLocationStr = pointToString(nextLocationPoint)
          }
          nextHurricaneState.push({ type: '<', location: nextLocationStr })
        } else if (type === '>') {
          const nextLocationPoint: Location = [locationPoint[0] + 1, locationPoint[1]]
          let nextLocationStr = pointToString(nextLocationPoint)
          if (wallState[nextLocationStr] === '#') {
            nextLocationPoint[0] = minX + 1
            nextLocationStr = pointToString(nextLocationPoint)
          }
          nextHurricaneState.push({ type: '>', location: nextLocationStr })
        } else if (type === '^') {
          const nextLocationPoint: Location = [locationPoint[0], locationPoint[1] - 1]
          let nextLocationStr = pointToString(nextLocationPoint)
          if (wallState[nextLocationStr] === '#') {
            nextLocationPoint[1] = maxY - 1
            nextLocationStr = pointToString(nextLocationPoint)
          }
          nextHurricaneState.push({ type: '^', location: nextLocationStr })
        } else if (type === 'v') {
          const nextLocationPoint: Location = [locationPoint[0], locationPoint[1] + 1]
          let nextLocationStr = pointToString(nextLocationPoint)
          if (wallState[nextLocationStr] === '#') {
            nextLocationPoint[1] = minY + 1
            nextLocationStr = pointToString(nextLocationPoint)
          }
          nextHurricaneState.push({ type: 'v', location: nextLocationStr })
        } else if (type === '#') {
          wallState[location] = '#'
        }
      })
      hurricaneCache[key] = nextHurricaneState
      return { nextHState: nextHurricaneState, stateKey: key }
    }
  }
}

const nextHurricane = memoizedNextHurricane()

interface State {
  time: number
  hurricaneState: Hurricane[]
  playerLocation: Location
}

const run = (
  startLocation: Location,
  goalLocation: Location,
  hurricaneState: Hurricane[]
): [number, Hurricane[]] => {
  const initialState: State = {
    time: 0,
    hurricaneState: hurricaneState,
    playerLocation: startLocation,
  }

  const goalLocationStr = pointToString(goalLocation)

  const queue = new MinHeap<State>()
  queue.add(initialState.time, initialState)

  let shortestTime = Number.MAX_SAFE_INTEGER
  let shortestHurricaneState: Hurricane[] = []

  const visited = new Set<string>()

  while (queue.length > 0) {
    // console.log(queue.length)
    const currentState = queue.remove()
    // console.log(currentState.time)
    if (currentState === undefined) {
      throw new Error('undefined state')
    }

    const currentLocationStr = pointToString(currentState.playerLocation)

    if (currentLocationStr === goalLocationStr) {
      if (currentState.time < shortestTime) {
        shortestTime = currentState.time
        shortestHurricaneState = currentState.hurricaneState
      }
      continue
    }

    if (currentState.time > shortestTime) {
      continue
    }

    // show(currentState.hurricaneState, wallState, currentLocationStr)

    let key = ''
    const nextState = produce(currentState, draftState => {
      draftState.time++
      const next = nextHurricane(draftState.hurricaneState)
      draftState.hurricaneState = next.nextHState
      key = next.stateKey
      // move all blizzards first
    })
    key = key.slice(0, keyLength)

    const occupiedSpaces = new Set<string>(Object.keys(wallState))
    nextState.hurricaneState.forEach(hurri => {
      occupiedSpaces.add(hurri.location)
    })

    // move player based on possible actions
    const eastPlayerLocation: Location = [...nextState.playerLocation]
    eastPlayerLocation[0]++
    const eastPlayerLocationStr = pointToString(eastPlayerLocation)
    if (
      eastPlayerLocation[0] <= maxX &&
      !occupiedSpaces.has(eastPlayerLocationStr) &&
      !visited.has(eastPlayerLocationStr + key)
    ) {
      const nextStateEast = produce(nextState, draftState => {
        draftState.playerLocation = eastPlayerLocation
      })
      queue.add(heuristic(eastPlayerLocation, goalLocation, nextStateEast.time), nextStateEast)
      visited.add(eastPlayerLocationStr + key)
    }

    const southPlayerLocation: Location = [...nextState.playerLocation]
    southPlayerLocation[1]++
    const southPlayerLocationStr = pointToString(southPlayerLocation)
    if (
      southPlayerLocation[1] <= maxY &&
      !occupiedSpaces.has(southPlayerLocationStr) &&
      !visited.has(southPlayerLocationStr + key)
    ) {
      const nextStateSouth = produce(nextState, draftState => {
        draftState.playerLocation = southPlayerLocation
      })
      queue.add(heuristic(southPlayerLocation, goalLocation, nextStateSouth.time), nextStateSouth)
      visited.add(southPlayerLocationStr + key)
    }

    const westPlayerLocation: Location = [...nextState.playerLocation]
    westPlayerLocation[0]--
    const westPlayerLocationStr = pointToString(westPlayerLocation)
    if (
      westPlayerLocation[0] >= 0 &&
      !occupiedSpaces.has(westPlayerLocationStr) &&
      !visited.has(westPlayerLocationStr + key)
    ) {
      const nextStateWest = produce(nextState, draftState => {
        draftState.playerLocation = westPlayerLocation
      })
      queue.add(heuristic(westPlayerLocation, goalLocation, nextStateWest.time), nextStateWest)
      visited.add(westPlayerLocationStr + key)
    }

    const northPlayerLocation: Location = [...nextState.playerLocation]
    northPlayerLocation[1]--
    const northPlayerLocationStr = pointToString(northPlayerLocation)
    if (
      northPlayerLocation[1] >= 0 &&
      !occupiedSpaces.has(northPlayerLocationStr) &&
      !visited.has(northPlayerLocationStr + key)
    ) {
      const nextStateNorth = produce(nextState, draftState => {
        draftState.playerLocation = northPlayerLocation
      })
      queue.add(heuristic(northPlayerLocation, goalLocation, nextStateNorth.time), nextStateNorth)
      visited.add(northPlayerLocationStr + key)
    }

    // need to add player not moving
    if (!occupiedSpaces.has(currentLocationStr) && !visited.has(currentLocationStr + key)) {
      queue.add(nextState.time, nextState)
      visited.add(currentLocationStr + key)
    }
  }

  return [shortestTime, shortestHurricaneState]
}

const goalLocation: Location = [maxX - 1, maxY]
const startLocation: Location = [minX + 1, minY]

const shortestTimes: number[] = []

for (const startEnd of [
  [startLocation, goalLocation],
  [goalLocation, startLocation],
  [startLocation, goalLocation],
] as [Location, Location][]) {
  const results = run(startEnd[0], startEnd[1], hurricaneState)
  shortestTimes.push(results[0])
  hurricaneState = results[1]
}

console.log(shortestTimes)

console.log(
  shortestTimes.reduce((prev, curr) => {
    return prev + curr
  }, 0)
)
