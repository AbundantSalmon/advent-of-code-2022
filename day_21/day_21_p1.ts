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
  operation: '+' | '-' | '*' | '/'
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
    const operation = parts[2]
    if (operation !== '+' && operation !== '-' && operation !== '*' && operation !== '/') {
      throw new Error('unexpected input')
    }
    return {
      name: parts[0].slice(0, parts[0].length - 1),
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

const getMonkeyValue = (monkey: Monkey, monkeys: Record<string, Monkey>): number => {
  if (monkey.valueNumber !== null) {
    return monkey.valueNumber
  } else if (monkey.action === 'operation') {
    const firstMonkey = monkeys[monkey.firstMonkey]
    let firstMonkeyValue = firstMonkey.valueNumber
    if (firstMonkeyValue === null) {
      firstMonkeyValue = getMonkeyValue(firstMonkey, monkeys)
    }
    const secondMonkey = monkeys[monkey.secondMonkey]
    let secondMonkeyValue = secondMonkey.valueNumber
    if (secondMonkeyValue === null) {
      secondMonkeyValue = getMonkeyValue(secondMonkey, monkeys)
    }

    if (monkey.operation === '*') {
      return firstMonkeyValue * secondMonkeyValue
    } else if (monkey.operation === '/') {
      return firstMonkeyValue / secondMonkeyValue
    } else if (monkey.operation === '+') {
      return firstMonkeyValue + secondMonkeyValue
    } else if (monkey.operation === '-') {
      return firstMonkeyValue - secondMonkeyValue
    } else {
      throw new Error('unexpected state')
    }
  } else {
    throw new Error('unexpected state')
  }
}

const rootMonkeyValue = getMonkeyValue(monkeyMap['root'], monkeyMap)

console.log(rootMonkeyValue)
