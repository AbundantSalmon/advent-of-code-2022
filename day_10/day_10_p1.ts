const inputText = Deno.readTextFileSync('./input.txt')
const lines = inputText.split('\n')

interface NoopCommand {
  action: 'noop'
  amount: null
}
interface AddxCommand {
  action: 'addx'
  amount: number
}

type Command = NoopCommand | AddxCommand

const commands = lines.map<Command>(line => {
  const command = line.slice(0, 4)
  if (command === 'noop') {
    return {
      action: 'noop',
      amount: null,
    }
  } else if (command === 'addx') {
    return {
      action: 'addx',
      amount: parseInt(line.slice(4)),
    }
  }
  throw new Error('Unexpected command')
})

const numberOfCyclesToExecute: {
  [K in Command['action']]: number
} = {
  noop: 1,
  addx: 2,
}

let register = 1
let cycle = 0

const cyclesToRecordAt = [20, 60, 100, 140, 180, 220]
const records: { [k: number]: number } = {}

commands.forEach(command => {
  Array(numberOfCyclesToExecute[command.action])
    .fill(0)
    .forEach((_, index, array) => {
      cycle++
      if (command.action === 'addx' && index === array.length - 1) {
        register += command.amount
      }
      if (cyclesToRecordAt.includes(cycle)) {
        records[cycle] = register
      }
    })
})

const sumOf = Object.keys(records).reduce((prev, curr) => {
  const keyAsInt = parseInt(curr)
  return (prev += keyAsInt * records[keyAsInt])
}, 0)

console.log(sumOf)
