/**
 * Does not work
 */
const directory = new URL('.', import.meta.url).pathname
const inputText = Deno.readTextFileSync(directory + '/input.txt')
const lines = inputText.split('\n')

type NumberMonkey = {
  name: string
  action: 'number'
  valueNumber: number
}
type OperationMonkey = {
  name: string
  action: 'operation'
  operation: '+' | '-' | '*' | '/' | '==='
  firstMonkey: string
  secondMonkey: string
  valueNumber: number | null
}

type Monkey = NumberMonkey | OperationMonkey

const monkeys = lines.map<Monkey>(line => {
  const parts = line.split(' ')
  if (parts.length === 2) {
    return {
      name: parts[0].slice(0, parts[0].length - 1),
      action: 'number',
      valueNumber: parseInt(parts[1]),
    }
  } else if (parts.length === 4) {
    if (parts[2] !== '+' && parts[2] !== '-' && parts[2] !== '*' && parts[2] !== '/') {
      throw new Error('unexpected input')
    }
    let operation: OperationMonkey['operation'] = parts[2]
    const name = parts[0].slice(0, parts[0].length - 1)
    if (name === 'root') {
      operation = '==='
    }
    return {
      name,
      action: 'operation',
      operation,
      firstMonkey: parts[1],
      secondMonkey: parts[3],
      valueNumber: null,
    }
  } else {
    throw new Error('unexpected input')
  }
})

const monkeyMap: Record<string, Monkey> = {}

monkeys.forEach(monkey => {
  monkeyMap[monkey.name] = monkey
})

const getMonkeyValue = (
  monkey: Monkey,
  monkeys: Record<string, Monkey>,
  humanValue: number
): number | [number, number] => {
  if (monkey.valueNumber !== null) {
    if (monkey.name === 'humn') {
      monkey['valueNumber'] = humanValue
      return humanValue
    } else {
      return monkey.valueNumber
    }
  } else if (monkey.action === 'operation') {
    const firstMonkey = monkeys[monkey.firstMonkey]
    let firstMonkeyValue = firstMonkey.valueNumber
    const fValue = getMonkeyValue(firstMonkey, monkeys, humanValue)
    if (typeof fValue === 'object') {
      throw new Error('unexpected state')
    }
    firstMonkeyValue = fValue

    const secondMonkey = monkeys[monkey.secondMonkey]
    let secondMonkeyValue = secondMonkey.valueNumber
    const value = getMonkeyValue(secondMonkey, monkeys, humanValue)
    if (typeof value === 'object') {
      throw new Error('unexpected state')
    }
    secondMonkeyValue = value

    if (monkey.operation === '*') {
      return firstMonkeyValue * secondMonkeyValue
    } else if (monkey.operation === '/') {
      return firstMonkeyValue / secondMonkeyValue
    } else if (monkey.operation === '+') {
      return firstMonkeyValue + secondMonkeyValue
    } else if (monkey.operation === '-') {
      return firstMonkeyValue - secondMonkeyValue
    } else if (monkey.operation === '===') {
      return [firstMonkeyValue, secondMonkeyValue]
    } else {
      throw new Error('unexpected state')
    }
  } else {
    throw new Error('unexpected state')
  }
}

let found = false
let i = 10000000000
let minSearchValue = i
let maxSearchValue = 1000000000000
let run = 0

while (!found) {
  const rootMonkeyValue = getMonkeyValue(monkeyMap['root'], monkeyMap, i)
  if (typeof rootMonkeyValue === 'number') {
    throw new Error('unexpected')
  }
  const [changing, constantVal] = rootMonkeyValue
  const difference = Math.abs(constantVal - changing)

  // console.log(rootMonkeyValue)
  console.log(i)
  console.log(rootMonkeyValue)

  if (difference < 0.00000001) {
    found = true
  } else {
    console.log('firslesst')
    i = Math.floor((maxSearchValue - minSearchValue) / 2)
    if (constantVal < changing) {
      minSearchValue = i
    } else {
      maxSearchValue = i
    }
  }
  console.log(maxSearchValue)
  console.log(minSearchValue)
  run++
  if (run === 10) {
    break
  }
}

console.log(i)
