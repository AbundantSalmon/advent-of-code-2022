const CHOICE_POINTS_MAP = {
  A: 1,
  X: 1,
  B: 2,
  Y: 2,
  C: 3,
  Z: 3,
} as const

type OpponentChoice = keyof Pick<typeof CHOICE_POINTS_MAP, 'A' | 'B' | 'C'>
type MyChoice = keyof Pick<typeof CHOICE_POINTS_MAP, 'X' | 'Y' | 'Z'>

const ROCK = ['A', 'X']
const PAPER = ['B', 'Y']
const SCISSORS = ['C', 'Z']

const WIN_POINTS = 6
const LOSE_POINTS = 0
const DRAW_POINTS = 3

const inputText = Deno.readTextFileSync('./input.txt')
const lines = inputText.split('\n')

const getRoundPoints = (opponentChoice: OpponentChoice, myChoice: MyChoice): number => {
  let points = 0
  points += CHOICE_POINTS_MAP[myChoice]

  if (ROCK.includes(opponentChoice) && ROCK.includes(myChoice)) {
    points += DRAW_POINTS
  } else if (ROCK.includes(opponentChoice) && PAPER.includes(myChoice)) {
    points += WIN_POINTS
  } else if (ROCK.includes(opponentChoice) && SCISSORS.includes(myChoice)) {
    points += LOSE_POINTS
  } else if (PAPER.includes(opponentChoice) && ROCK.includes(myChoice)) {
    points += LOSE_POINTS
  } else if (PAPER.includes(opponentChoice) && PAPER.includes(myChoice)) {
    points += DRAW_POINTS
  } else if (PAPER.includes(opponentChoice) && SCISSORS.includes(myChoice)) {
    points += WIN_POINTS
  } else if (SCISSORS.includes(opponentChoice) && ROCK.includes(myChoice)) {
    points += WIN_POINTS
  } else if (SCISSORS.includes(opponentChoice) && PAPER.includes(myChoice)) {
    points += LOSE_POINTS
  } else if (SCISSORS.includes(opponentChoice) && SCISSORS.includes(myChoice)) {
    points += DRAW_POINTS
  } else {
    throw new Error(`unknown choices encountered: ${opponentChoice} ${myChoice}`)
  }

  return points
}

let points = 0

lines.forEach(line => {
  const choices = line.split(' ') as [OpponentChoice, MyChoice]
  points += getRoundPoints(choices[0], choices[1])
})

console.log(points)
