const directory = new URL('.', import.meta.url).pathname
const inputText = Deno.readTextFileSync(directory + '/input.txt')
const lines = inputText.split('\n')

class Sensor {
  x: number
  y: number
  closestBeaconX: number
  closestBeaconY: number
  constructor(x: number, y: number, closestBeaconX: number, closestBeaconY: number) {
    this.x = x
    this.y = y
    this.closestBeaconX = closestBeaconX
    this.closestBeaconY = closestBeaconY
  }

  excludedBeaconPoints(onRow: number) {
    const xLength = Math.abs(this.x - this.closestBeaconX)
    const yLength = Math.abs(this.y - this.closestBeaconY)
    const manhattanDistance = xLength + yLength

    const excludedPositions: string[] = []

    for (let i = -manhattanDistance; i <= manhattanDistance; ++i) {
      const deltaX = i
      const deltaY1 = manhattanDistance - Math.abs(deltaX)
      const deltaY2 = -(manhattanDistance - Math.abs(deltaX))

      const y1 = this.y + deltaY1
      const y2 = this.y + deltaY2

      if (onRow >= y2 && onRow <= y1) {
        excludedPositions.push(`${this.x + deltaX},${onRow}`)
      }
    }

    return excludedPositions
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

const allExcludedPositions = new Set(
  sensors
    .map(sensor => sensor.excludedBeaconPoints(2_000_000))
    .reduce<string[]>((prev, curr) => {
      return prev.concat(curr)
    }, [])
)

sensors.forEach(sensor => {
  allExcludedPositions.delete(`${sensor.x},${sensor.y}`)
  allExcludedPositions.delete(`${sensor.closestBeaconX},${sensor.closestBeaconY}`)
})

console.log(allExcludedPositions.size)
