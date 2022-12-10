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

const width = 40
const height = 6

const screen: string[][] = []
Array(height)
  .fill(0)
  .forEach(_ => {
    screen.push(Array(width).fill('.'))
  })

commands.forEach(command => {
  Array(numberOfCyclesToExecute[command.action])
    .fill(0)
    .forEach((_, index, array) => {
      cycle++
      if (command.action === 'addx' && index === array.length - 1) {
        register += command.amount
      }
      const row = Math.floor(cycle / 40)
      const value = cycle % 40

      if (register - 1 === value) {
        screen[row][register - 1] = '#'
      }
      if (register === value) {
        screen[row][register] = '#'
      }
      if (register + 1 === value) {
        screen[row][register + 1] = '#'
      }
    })
})

screen.forEach(value => {
  console.log(
    value.reduce((curr, prev) => {
      return curr + prev
    }, '')
  )
})
