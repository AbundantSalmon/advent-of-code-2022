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

const incrementKnotMove = (headCurrentPos: Position, tailCurrentPos: Position): Position => {
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
  } else if (
    (Math.abs(xDiff) === 2 && Math.abs(yDiff) === 2) ||
    (Math.abs(xDiff) === 2 && Math.abs(yDiff) === 2)
  ) {
    return {
      x: tailCurrentPos.x + Math.sign(xDiff),
      y: tailCurrentPos.y + Math.sign(yDiff),
    }
  }

  console.log(headCurrentPos)
  console.log(tailCurrentPos)
  throw new Error('head tail relative position not considered')
}

const processMove = ({ startRopePos, move }: { startRopePos: Position[]; move: Move }) => {
  const tailVisitedPositions: Position[] = []
  let currentRopePos = startRopePos

  for (let i = 0; i < move.amount; ++i) {
    const newRopePosAfterIncrement: Position[] = []
    const headCurrentPos = incrementHeadMove(move.direction, currentRopePos[0])
    newRopePosAfterIncrement.push(headCurrentPos)

    currentRopePos.slice(1, -1).forEach(pos => {
      const newPos = incrementKnotMove(
        newRopePosAfterIncrement[newRopePosAfterIncrement.length - 1],
        pos
      )
      newRopePosAfterIncrement.push(newPos)
    })

    const newTailPos = incrementKnotMove(
      newRopePosAfterIncrement[newRopePosAfterIncrement.length - 1],
      currentRopePos[currentRopePos.length - 1]
    )
    newRopePosAfterIncrement.push(newTailPos)
    tailVisitedPositions.push(newTailPos)

    if (currentRopePos.length !== newRopePosAfterIncrement.length) {
      throw new Error('lengths must equal')
    }
    currentRopePos = newRopePosAfterIncrement
  }
  return { tailVisitedPositions, ropeFinalPos: currentRopePos }
}

const moves = lines.map(line => parseLine(line))

let ropeCurrentPos: Position[] = Array(10)
  .fill(0)
  .map(() => {
    return {
      x: 0,
      y: 0,
    }
  })

const tailVisitedPositions = moves.reduce<Position[]>((prev, curr) => {
  const { tailVisitedPositions, ropeFinalPos } = processMove({
    startRopePos: ropeCurrentPos,
    move: curr,
  })
  ropeCurrentPos = ropeFinalPos
  return prev.concat(tailVisitedPositions)
}, [])

const tailVisitPositionsSet = new Set()

tailVisitedPositions.forEach(pos => {
  // converting to string because JS sets can't define how equality works, so
  // convert to string primitive instead
  tailVisitPositionsSet.add(`${pos.x},${pos.y}`)
})

console.log(tailVisitPositionsSet.size)
