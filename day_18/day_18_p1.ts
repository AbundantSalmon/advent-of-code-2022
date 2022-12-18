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
const cubes = lines.map(line => {
  const coords = line.split(',')
  return new Cube(parseInt(coords[0]), parseInt(coords[1]), parseInt(coords[2]))
})

cubes.forEach(cube1 => {
  cubes.forEach(cube2 => {
    cube1.reduceSidesIfNextToCube(cube2)
  })
})

const surfaceAreas = cubes.reduce((prev, curr) => {
  return prev + curr.sides
}, 0)

console.log(surfaceAreas)
