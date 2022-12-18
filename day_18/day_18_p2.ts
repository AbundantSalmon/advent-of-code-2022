const directory = new URL('.', import.meta.url).pathname
const inputText = Deno.readTextFileSync(directory + '/input.txt')
const lines = inputText.split('\n')

class Cube {
  x: number
  y: number
  z: number
  sides = 6
  constructor(x: number, y: number, z: number) {
    this.x = x
    this.y = y
    this.z = z
  }
  reduceSidesIfNextToCube(otherCube: Cube) {
    if (this.isAdjacent(otherCube)) {
      --this.sides
    }
  }

  isAdjacent(otherCube: Cube) {
    if (this.x === otherCube.x && this.y === otherCube.y && Math.abs(this.z - otherCube.z) === 1) {
      return true
    }
    if (this.x === otherCube.x && Math.abs(this.y - otherCube.y) === 1 && this.z === otherCube.z) {
      return true
    }
    if (Math.abs(this.x - otherCube.x) === 1 && this.y === otherCube.y && this.z === otherCube.z) {
      return true
    }
    // if cube in same position then it isn't adjacent, assume this doesn't come
    // up in this problem

    return false
  }
}
let xMinBound = Number.MAX_SAFE_INTEGER
let xMaxBound = Number.MIN_SAFE_INTEGER
let yMinBound = Number.MAX_SAFE_INTEGER
let yMaxBound = Number.MIN_SAFE_INTEGER
let zMinBound = Number.MAX_SAFE_INTEGER
let zMaxBound = Number.MIN_SAFE_INTEGER

const cubes = lines.map(line => {
  const coords = line.split(',')
  const x = parseInt(coords[0])
  const y = parseInt(coords[1])
  const z = parseInt(coords[2])

  if (x < xMinBound) {
    xMinBound = x
  }
  if (x > xMaxBound) {
    xMaxBound = x
  }
  if (y < yMinBound) {
    yMinBound = y
  }
  if (y > yMaxBound) {
    yMaxBound = y
  }
  if (z < zMinBound) {
    zMinBound = z
  }
  if (z > zMaxBound) {
    zMaxBound = z
  }
  return new Cube(x, y, z)
})

xMinBound += -1
xMaxBound += 1
yMinBound += -1
yMaxBound += 1
zMinBound += -1
zMaxBound += 1

// console.log(xMinBound)
// console.log(xMaxBound)
// console.log(yMinBound)
// console.log(yMaxBound)
// console.log(zMinBound)
// console.log(zMaxBound)

const cubesCoordSet = new Set<string>()
cubes.forEach(cube => {
  cubesCoordSet.add(`${cube.x},${cube.y},${cube.z}`)
})

const steamCubeSet = new Set<string>()

const floodFill = (
  startX: number,
  startY: number,
  startZ: number,
  lavaCubes: Set<string>,
  steamCubes: Set<string>
) => {
  const queue = []
  const coordString = `${startX},${startY},${startZ}`
  queue.push(coordString)

  const checked = new Set<string>()

  while (queue.length > 0) {
    const currentCoordString = queue.pop()
    if (currentCoordString === undefined) {
      throw new Error('unexpected value')
    }
    checked.add(currentCoordString)

    const [currentXString, currentYString, currentZString] = currentCoordString.split(',')
    const currentX = parseInt(currentXString)
    const currentY = parseInt(currentYString)
    const currentZ = parseInt(currentZString)
    if (currentX < xMinBound || currentX > xMaxBound) {
      continue
    }
    if (currentY < yMinBound || currentY > yMaxBound) {
      continue
    }
    if (currentZ < zMinBound || currentZ > zMaxBound) {
      continue
    }
    if (lavaCubes.has(currentCoordString) || steamCubes.has(currentCoordString)) {
      continue
    }

    steamCubes.add(currentCoordString)

    const right = `${currentX + 1},${currentY},${currentZ}`
    if (!checked.has(right)) {
      queue.push(right)
    }
    const left = `${currentX - 1},${currentY},${currentZ}`
    if (!checked.has(left)) {
      queue.push(left)
    }
    const front = `${currentX},${currentY + 1},${currentZ}`
    if (!checked.has(front)) {
      queue.push(front)
    }
    const back = `${currentX},${currentY - 1},${currentZ}`
    if (!checked.has(back)) {
      queue.push(back)
    }
    const top = `${currentX},${currentY},${currentZ + 1}`
    if (!checked.has(top)) {
      queue.push(top)
    }
    const bottom = `${currentX},${currentY},${currentZ - 1}`
    if (!checked.has(bottom)) {
      queue.push(bottom)
    }
  }
}

floodFill(xMinBound, yMinBound, zMinBound, cubesCoordSet, steamCubeSet)

const steamCube = [...steamCubeSet.keys()].map(cubeEntry => {
  const coords = cubeEntry.split(',')
  const x = parseInt(coords[0])
  const y = parseInt(coords[1])
  const z = parseInt(coords[2])
  return new Cube(x, y, z)
})

const surfaceAreas = cubes.reduce((prev, curr) => {
  return (
    prev +
    steamCube.reduce((prevCube, currCube) => {
      if (curr.isAdjacent(currCube)) {
        return prevCube + 1
      }
      return prevCube
    }, 0)
  )
}, 0)

console.log(surfaceAreas)
