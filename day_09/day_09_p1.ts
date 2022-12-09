const inputText = Deno.readTextFileSync('./input.txt')
const lines = inputText.split('\n')

interface Move {
  direction: 'U' | 'D' | 'L' | 'R'
  amount: number
}

interface Position {
  x: number
  y: number
}

const parseLine = (line: string): Move => {
  const components = line.split(' ')
  const direction = components[0]
  if (direction != 'U' && direction != 'D' && direction != 'L' && direction != 'R') {
    throw new Error('Unrecognised Direction')
  }
  return {
    direction,
    amount: parseInt(components[1]),
  }
}

const incrementHeadMove = (direction: Move['direction'], startPos: Position): Position => {
  if (direction === 'D') {
    return {
      x: startPos.x,
      y: startPos.y - 1,
    }
  } else if (direction === 'U') {
    return {
      x: startPos.x,
      y: startPos.y + 1,
    }
  } else if (direction === 'L') {
    return {
      x: startPos.x - 1,
      y: startPos.y,
    }
  } else if (direction === 'R') {
    return {
      x: startPos.x + 1,
      y: startPos.y,
    }
  } else {
    throw new Error('Invalid Direction')
  }
}

const incrementTailMove = (headCurrentPos: Position, tailCurrentPos: Position): Position => {
  const xDiff = headCurrentPos.x - tailCurrentPos.x
  const yDiff = headCurrentPos.y - tailCurrentPos.y

  if (Math.abs(xDiff) <= 1 && Math.abs(yDiff) <= 1) {
    return { ...tailCurrentPos }
  } else if (
    (Math.abs(xDiff) === 2 && Math.abs(yDiff) === 0) ||
    (Math.abs(xDiff) === 0 && Math.abs(yDiff) === 2)
  ) {
    return {
      x: tailCurrentPos.x + Math.sign(xDiff),
      y: tailCurrentPos.y + Math.sign(yDiff),
    }
  } else if (
    (Math.abs(xDiff) === 2 && Math.abs(yDiff) === 1) ||
    (Math.abs(xDiff) === 1 && Math.abs(yDiff) === 2)
  ) {
    return {
      x: tailCurrentPos.x + Math.sign(xDiff),
      y: tailCurrentPos.y + Math.sign(yDiff),
    }
  }

  throw new Error('head tail relative position not considered')
}

const processMove = ({
  startHeadPos,
  startTailPos,
  move,
}: {
  startHeadPos: Position
  startTailPos: Position
  move: Move
}) => {
  const tailVisitedPositions: Position[] = []
  let headCurrentPos = startHeadPos
  let tailCurrentPos = startTailPos
  for (let i = 0; i < move.amount; ++i) {
    headCurrentPos = incrementHeadMove(move.direction, headCurrentPos)
    tailCurrentPos = incrementTailMove(headCurrentPos, tailCurrentPos)
    tailVisitedPositions.push(tailCurrentPos)
  }
  return { tailVisitedPositions, headFinalPos: headCurrentPos, tailFinalPos: tailCurrentPos }
}

const moves = lines.map(line => parseLine(line))

let currentHeadPos: Position = {
  x: 0,
  y: 0,
}
let currentTailPos: Position = {
  x: 0,
  y: 0,
}

const tailVisitedPositions = moves.reduce<Position[]>((prev, curr) => {
  const { tailVisitedPositions, headFinalPos, tailFinalPos } = processMove({
    startHeadPos: currentHeadPos,
    startTailPos: currentTailPos,
    move: curr,
  })
  currentHeadPos = headFinalPos
  currentTailPos = tailFinalPos
  return prev.concat(tailVisitedPositions)
}, [])

const tailVisitPositionsSet = new Set()

tailVisitedPositions.forEach(pos => {
  // converting to string because JS sets can't define how equality works, so
  // convert to string primitive instead
  tailVisitPositionsSet.add(`${pos.x},${pos.y}`)
})

console.log(tailVisitPositionsSet.size)
