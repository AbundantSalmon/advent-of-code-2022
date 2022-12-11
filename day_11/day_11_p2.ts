const inputText = Deno.readTextFileSync('./input.txt')
const lines = inputText.split('\n')

const rounds = 10000
let lowestCommonModulus = 1

class Monkey {
  items: number[]
  operation: (oldWorryLevel: number) => number
  test: (worryLevel: number) => number
  otherMonkeys: Map<number, Monkey>
  numberOfInspectedItems = 0

  constructor(
    items: number[],
    operation: (oldWorryLevel: number) => number,
    test: (worrylevel: number) => number,
    otherMonkeys: Map<number, Monkey>
  ) {
    this.items = items
    this.operation = operation
    this.test = test
    this.otherMonkeys = otherMonkeys
  }

  inspectAndThrowAll() {
    this.items.forEach(item => {
      let currentWorryLevelOfItem = item
      currentWorryLevelOfItem = this.operation(currentWorryLevelOfItem) % lowestCommonModulus
      const monkeyToThrowTo = this.test(currentWorryLevelOfItem)
      const otherMonkey = this.otherMonkeys.get(monkeyToThrowTo)
      if (otherMonkey === undefined) {
        throw new Error('monkey does not exist')
      }
      otherMonkey.items.push(currentWorryLevelOfItem)
      this.numberOfInspectedItems++
    })
    this.items = [] // reset
  }
}

const createTest = (divisibleTestNumber: number, falseMonkey: number, trueMonkey: number) => {
  return (worryLevel: number) => {
    if (worryLevel % divisibleTestNumber === 0) {
      return trueMonkey
    } else {
      return falseMonkey
    }
  }
}

const parseMonkeys = (lines: string[]): Map<number, Monkey> => {
  const monkeys = new Map<number, Monkey>() // assume they activate in insertion order

  let currentIndex = 0
  let currentItems: number[] = []
  let currentOperation: (oldWorryLevel: number) => number = x => x
  let divisibleTestNumber = 0
  let falseMonkey = 0
  let trueMonkey = 0

  lines.forEach(line => {
    const lineNoWhiteSpace = line.trim()
    if (lineNoWhiteSpace.slice(0, 6).toLowerCase() === 'monkey') {
      currentIndex = parseInt(lineNoWhiteSpace.slice(7, -1))
    } else if (lineNoWhiteSpace.slice(0, 15).toLowerCase() === 'starting items:') {
      lineNoWhiteSpace
        .slice(16)
        .split(', ')
        .forEach(itemWorryLevel => {
          currentItems.push(parseInt(itemWorryLevel))
        })
    } else if (lineNoWhiteSpace.slice(0, 10).toLowerCase() === 'operation:') {
      const operationStr = lineNoWhiteSpace.slice(12)
      const operationItems = operationStr.split(' ')
      if (operationItems.length !== 5) {
        throw Error('invalid operation read: ' + operationStr)
      }
      const argument = operationItems[2]
      currentOperation = new Function(argument, 'return ' + operationItems.slice(2).join(' ')) as (
        oldWorryLevel: number
      ) => number // is there a better way to type this?
    } else if (lineNoWhiteSpace.slice(0, 18).toLowerCase() === 'test: divisible by') {
      divisibleTestNumber = parseInt(lineNoWhiteSpace.slice(19))
      lowestCommonModulus *= divisibleTestNumber
    } else if (lineNoWhiteSpace.slice(0, 24).toLowerCase() === 'if true: throw to monkey') {
      trueMonkey = parseInt(lineNoWhiteSpace.slice(25))
    } else if (lineNoWhiteSpace.slice(0, 25).toLowerCase() === 'if false: throw to monkey') {
      falseMonkey = parseInt(lineNoWhiteSpace.slice(25))
    } else if (lineNoWhiteSpace === '') {
      const currentTest = createTest(divisibleTestNumber, falseMonkey, trueMonkey)
      monkeys.set(currentIndex, new Monkey(currentItems, currentOperation, currentTest, monkeys))
      currentItems = [] // reset with new array
    } else {
      throw new Error(`Unexpected line: ${lineNoWhiteSpace}`)
    }
  })

  return monkeys
}

const monkeys = parseMonkeys(lines)

Array.from({ length: rounds }, () => 0).forEach(_ => {
  monkeys.forEach(monkey => {
    monkey.inspectAndThrowAll()
  })
})

// no priority queue implementation in std JS
// will find the two most active monkeys in a janky way

let mostInspections = 0
let secondMostInspections = 0

monkeys.forEach(monkey => {
  if (monkey.numberOfInspectedItems > mostInspections) {
    secondMostInspections = mostInspections
    mostInspections = monkey.numberOfInspectedItems
  } else if (monkey.numberOfInspectedItems > secondMostInspections) {
    secondMostInspections = monkey.numberOfInspectedItems
  }
})

const levelOfMonkeyBusiness = mostInspections * secondMostInspections

console.log(levelOfMonkeyBusiness)
