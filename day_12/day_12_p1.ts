import MinHeap from './heap.ts'
const inputText = Deno.readTextFileSync('./input.txt')
const lines = inputText.split('\n')

const grid: number[][] = []

const startLocation: [number, number] = [0, 0]
const endLocation: [number, number] = [0, 0]

lines.forEach((line, row_index) => {
  const location = line.split('').map((letter, col_index) => {
    if (letter === 'S') {
      startLocation[0] = col_index
      startLocation[1] = row_index
      return 'a'.charCodeAt(0) - 96
    } else if (letter === 'E') {
      endLocation[0] = col_index
      endLocation[1] = row_index
      return 'z'.charCodeAt(0) - 96
    } else {
      return letter.charCodeAt(0) - 96
    }
  })
  grid.push(location)
})

const dijkstra = (grid: number[][], start: [number, number], end: [number, number]): number => {
  const queue = new MinHeap<string>()
  const distance: Record<string, number> = {}

  // setup
  distance[pointToString(start)] = 0
  grid.forEach((row, y) => {
    row.forEach((_, x) => {
      const point = pointToString([x, y])
      if (point !== pointToString(start)) {
        distance[point] = Number.MAX_SAFE_INTEGER
      }
      queue.add(distance[point], point)
    })
  })

  while (queue.length !== 0) {
    const point = queue.remove()
    if (point === undefined) {
      throw new Error('error occurred')
    }
    if (point === pointToString(end)) {
      break
    }
    for (const neighbour of validNeighbours(grid, stringToPoint(point))) {
      const neighbourDistance = distance[point] + 1
      const neighbourString = pointToString(neighbour)
      if (neighbourDistance < distance[neighbourString]) {
        distance[neighbourString] = neighbourDistance
        queue.add(neighbourDistance, neighbourString)
      }
    }
  }

  return distance[pointToString(end)]
}

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

const validNeighbours = (grid: number[][], point: [number, number]): [number, number][] => {
  const neighbours: [number, number][] = []
  for (const newPointRelativeDelta of [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ]) {
    const newPoint: [number, number] = [
      point[0] + newPointRelativeDelta[0],
      point[1] + newPointRelativeDelta[1],
    ]
    if (inGrid(grid, newPoint) && allowedMovement(grid, point, newPoint)) {
      neighbours.push(newPoint)
    }
  }

  return neighbours
}

const inGrid = (grid: number[][], point: [number, number]): boolean => {
  const x = point[0]
  const y = point[1]
  return x >= 0 && x < grid[0].length && y >= 0 && y < grid.length
}

const allowedMovement = (
  grid: number[][],
  fromPoint: [number, number],
  toPoint: [number, number]
): boolean => {
  const fromElevation = grid[fromPoint[1]][fromPoint[0]]
  const toElevation = grid[toPoint[1]][toPoint[0]]
  return toElevation <= fromElevation + 1
}

const shortestPath = dijkstra(grid, startLocation, endLocation)

console.log(shortestPath)
