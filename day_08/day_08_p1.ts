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

const isVisible = ({
  x,
  y,
  treeHeights,
}: {
  x: number
  y: number
  treeHeights: number[][]
}): boolean => {
  const currentTreeHeight = treeHeights[y][x]
  let visibleLeft = true
  let visibleRight = true
  let visibleTop = true
  let visibleBottom = true
  for (let leftX = 0; leftX < x; ++leftX) {
    if (treeHeights[y][leftX] >= currentTreeHeight) {
      visibleLeft = false
      break
    }
  }
  for (let rightX = x + 1; rightX < treeHeights[0].length; ++rightX) {
    if (treeHeights[y][rightX] >= currentTreeHeight) {
      visibleRight = false
      break
    }
  }
  for (let topY = 0; topY < y; ++topY) {
    if (treeHeights[topY][x] >= currentTreeHeight) {
      visibleTop = false
      break
    }
  }
  for (let bottomY = y + 1; bottomY < treeHeights.length; ++bottomY) {
    if (treeHeights[bottomY][x] >= currentTreeHeight) {
      visibleBottom = false
      break
    }
  }

  return [visibleLeft, visibleRight, visibleTop, visibleBottom].some(value => value)
}

let numVisibleTree = rowLength * 2 + columnLength * 2 - 4

for (let y = 1; y < columnLength - 1; ++y) {
  for (let x = 1; x < rowLength - 1; ++x) {
    if (isVisible({ x, y, treeHeights })) {
      numVisibleTree++
    }
  }
}

console.log(numVisibleTree)
