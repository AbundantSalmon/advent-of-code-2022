const inputText = Deno.readTextFileSync('./input.txt')
const lines = inputText.split('\n')

const rowLength = lines[0].length
const columnLength = lines.length

const treeHeights: number[][] = []

for (let y = 0; y < columnLength; ++y) {
  treeHeights.push([])
  for (let x = 0; x < rowLength; ++x) {
    const treeHeight = parseInt(lines[y][x])
    treeHeights[y].push(treeHeight)
  }
}

const scenicScore = ({
  x,
  y,
  treeHeights,
}: {
  x: number
  y: number
  treeHeights: number[][]
}): number => {
  const rowLength = treeHeights[0].length
  const columnLength = treeHeights.length

  const rightTraverse = rowLength - x - 1
  const bottomTraverse = columnLength - y - 1

  let leftScore = x
  let rightScore = rightTraverse
  let topScore = y
  let bottomScore = bottomTraverse

  const currentTreeHeight = treeHeights[y][x]

  for (let leftX = 1; leftX <= x; ++leftX) {
    if (treeHeights[y][x - leftX] >= currentTreeHeight) {
      leftScore = leftX
      break
    }
  }
  for (let rightX = 1; rightX <= rightTraverse; ++rightX) {
    if (treeHeights[y][x + rightX] >= currentTreeHeight) {
      rightScore = rightX
      break
    }
  }
  for (let topY = 1; topY <= y; ++topY) {
    if (treeHeights[y - topY][x] >= currentTreeHeight) {
      topScore = topY
      break
    }
  }
  for (let bottomY = 1; bottomY <= bottomTraverse; ++bottomY) {
    if (treeHeights[y + bottomY][x] >= currentTreeHeight) {
      bottomScore = bottomY
      break
    }
  }

  return leftScore * rightScore * topScore * bottomScore
}

let highestScenicScore = 0

// already know that edge trees have scenic score of 0, so don't calculate
for (let y = 1; y < columnLength - 1; ++y) {
  for (let x = 1; x < rowLength - 1; ++x) {
    const currentScenicScore = scenicScore({ x, y, treeHeights })
    if (currentScenicScore > highestScenicScore) {
      highestScenicScore = currentScenicScore
    }
  }
}

console.log(highestScenicScore)
