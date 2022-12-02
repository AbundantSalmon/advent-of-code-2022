const ROCK = 'A'
const PAPER = 'B'
const SCISSORS = 'C'

const CHOICE_POINTS_MAP = {
  [ROCK]: 1,
  [PAPER]: 2,
  [SCISSORS]: 3,
} as const

const WIN = 'Z'
const LOSE = 'X'
const DRAW = 'Y'

type OpponentChoice = typeof ROCK | typeof PAPER | typeof SCISSORS
type ResultNeeded = typeof WIN | typeof LOSE | typeof DRAW

type MyChoicePointsMap = {
  [k1 in OpponentChoice]: {
    [k2 in ResultNeeded]: number
  }
}

const myChoicePointsMap: MyChoicePointsMap = {
  [ROCK]: {
    [WIN]: CHOICE_POINTS_MAP[PAPER],
    [LOSE]: CHOICE_POINTS_MAP[SCISSORS],
    [DRAW]: CHOICE_POINTS_MAP[ROCK],
  },
  [PAPER]: {
    [WIN]: CHOICE_POINTS_MAP[SCISSORS],
    [LOSE]: CHOICE_POINTS_MAP[ROCK],
    [DRAW]: CHOICE_POINTS_MAP[PAPER],
  },
  [SCISSORS]: {
    [WIN]: CHOICE_POINTS_MAP[ROCK],
    [LOSE]: CHOICE_POINTS_MAP[PAPER],
    [DRAW]: CHOICE_POINTS_MAP[SCISSORS],
  },
}

const WIN_POINTS = 6
const LOSE_POINTS = 0
const DRAW_POINTS = 3

const inputText = Deno.readTextFileSync('./input.txt')
const lines = inputText.split('\n')

const getRoundPoints = (opponentChoice: OpponentChoice, resultNeeded: ResultNeeded): number => {
  let points = 0
  points += myChoicePointsMap[opponentChoice][resultNeeded]

  if (resultNeeded === WIN) {
    points += WIN_POINTS
  } else if (resultNeeded === LOSE) {
    points += LOSE_POINTS
  } else if (resultNeeded === DRAW) {
    points += DRAW_POINTS
  }

  return points
}

let points = 0

lines.forEach(line => {
  const choices = line.split(' ') as [OpponentChoice, ResultNeeded]
  points += getRoundPoints(choices[0], choices[1])
})

console.log(points)
