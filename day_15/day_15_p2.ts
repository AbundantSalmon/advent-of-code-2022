const directory = new URL('.', import.meta.url).pathname
const inputText = Deno.readTextFileSync(directory + '/input.txt')
const lines = inputText.split('\n')

class Sensor {
  x: number
  y: number
  closestBeaconX: number
  closestBeaconY: number
  manhattanDistance: number
  exclusionCornerPoints: [number, number][]

  constructor(x: number, y: number, closestBeaconX: number, closestBeaconY: number) {
    this.x = x
    this.y = y
    this.closestBeaconX = closestBeaconX
    this.closestBeaconY = closestBeaconY
    const xLength = Math.abs(this.x - this.closestBeaconX)
    const yLength = Math.abs(this.y - this.closestBeaconY)
    this.manhattanDistance = xLength + yLength
    this.exclusionCornerPoints = this.getExclusionCornerPoints()
  }

  getExclusionCornerPoints() {
    const manhattanDistance = this.manhattanDistance

    const corners: [number, number][] = []

    const minX = this.x - manhattanDistance
    const maxX = this.x + manhattanDistance

    const minY = this.y - manhattanDistance
    const maxY = this.y + manhattanDistance

    // they connect one after the other
    corners.push([minX, this.y])
    corners.push([this.x, maxY])
    corners.push([maxX, this.y])
    corners.push([this.x, minY])

    return corners
  }

  possiblePoints(minX: number, maxX: number, minY: number, maxY: number, sensors: Sensor[]) {
    // Assumptions are:
    // Since one spot, it has be one space away from an edge of the exclusion
    // zone

    // Passing in all the sensors is necessary as memory issues if trying to
    // store all the intermediate results, needed sensors to validate whether
    // the point was in an another sensor's exclusion zone immediately

    const exclusionCorners = this.exclusionCornerPoints
    const possiblePoints: [number, number][] = []

    const northWest = [exclusionCorners[0], exclusionCorners[1]]
    const northEast = [exclusionCorners[1], exclusionCorners[2]]
    const southEast = [exclusionCorners[2], exclusionCorners[3]]
    const southWest = [exclusionCorners[3], exclusionCorners[0]]

    for (let i = 0; i <= this.manhattanDistance + 1; ++i) {
      const xPoint = northWest[0][0] - 1 + i
      const yPoint = northWest[0][1] - i
      if (xPoint >= minX && xPoint <= maxX && yPoint >= minY && yPoint <= maxY) {
        if (sensors.every(sensor => !sensor.pointInExclusion(xPoint, yPoint))) {
          possiblePoints.push([xPoint, yPoint])
        }
      }
    }

    for (let i = 0; i <= this.manhattanDistance + 1; ++i) {
      const xPoint = northEast[0][0] + i
      const yPoint = northEast[0][1] - 1 + i
      if (xPoint >= minX && xPoint <= maxX && yPoint >= minY && yPoint <= maxY) {
        if (sensors.every(sensor => !sensor.pointInExclusion(xPoint, yPoint))) {
          possiblePoints.push([xPoint, yPoint])
        }
      }
    }

    for (let i = 0; i <= this.manhattanDistance + 1; ++i) {
      const xPoint = southEast[0][0] + 1 - i
      const yPoint = southEast[0][1] - i
      if (xPoint >= minX && xPoint <= maxX && yPoint >= minY && yPoint <= maxY) {
        if (sensors.every(sensor => !sensor.pointInExclusion(xPoint, yPoint))) {
          possiblePoints.push([xPoint, yPoint])
        }
      }
    }

    for (let i = 0; i <= this.manhattanDistance + 1; ++i) {
      const xPoint = southWest[0][0] - i
      const yPoint = southWest[0][1] + 1 - i
      if (xPoint >= minX && xPoint <= maxX && yPoint >= minY && yPoint <= maxY) {
        if (sensors.every(sensor => !sensor.pointInExclusion(xPoint, yPoint))) {
          possiblePoints.push([xPoint, yPoint])
        }
      }
    }
    return possiblePoints
  }

  pointInExclusion(x: number, y: number): boolean {
    if (Math.abs(this.x - x) + Math.abs(this.y - y) <= this.manhattanDistance) {
      return true
    }
    return false
  }
}

const sensorRegex =
  /Sensor at x=([-|0-9]+), y=([-|0-9]+): closest beacon is at x=([-|0-9]+), y=([-|0-9]+)/

const sensors: Sensor[] = lines.map(line => {
  const matches = line.match(sensorRegex)
  if (matches === null) {
    throw new Error('unexpected line')
  }
  const [_, x, y, b_x, b_y] = matches
  return new Sensor(parseInt(x), parseInt(y), parseInt(b_x), parseInt(b_y))
})

const minX = 0
const maxX = 4_000_000
const minY = 0
const maxY = 4_000_000

const potentialPositions = new Set(
  sensors
    .flatMap(sensor => sensor.possiblePoints(minX, maxX, minY, maxY, sensors))
    .map(value => `${value[0]},${value[1]}`)
)

const point = potentialPositions.keys().next()
if (!point.done) {
  const pointString = point.value
  const pointInt = pointString.split(',').map(value => parseInt(value))
  const tuningFrequency = pointInt[0] * 4_000_000 + pointInt[1]
  console.log(tuningFrequency)
}
