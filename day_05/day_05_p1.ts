const inputText = Deno.readTextFileSync('./input.txt')
const lines = inputText.split('\n')

// Using map ensures insertion order
const stackState = new Map<string, string[]>()

const moveRegex = /move ([0-9]+) from ([0-9]+) to ([0-9]+)/

let endOfStack = false
lines.forEach(line => {
  if (line === '') {
    endOfStack = true
  } else if (endOfStack) {
    const matches = line.match(moveRegex)
    if (matches === null) {
      throw new Error('unexpected format')
    }

    const [_, numberToMove, fromStackKey, toStackKey] = matches

    const fromStack = stackState.get(fromStackKey)
    if (fromStack === undefined) {
      throw new Error('unexpected value')
    }
    const toStack = stackState.get(toStackKey)
    if (toStack === undefined) {
      throw new Error('unexpected value')
    }

    for (let i = 0; i < parseInt(numberToMove); ++i) {
      const value = fromStack.pop()
      if (value === undefined) {
        throw new Error('unexpected value')
      }
      toStack.push(value)
    }
  } else {
    const numberOfStacks = Math.ceil(line.length / 4)

    if (stackState.size === 0) {
      for (let i = 1; i <= numberOfStacks; ++i) {
        stackState.set(i.toString(), [])
      }
    }

    for (let i = 1; i <= numberOfStacks; ++i) {
      const position = 1 + (i - 1) * 4
      const value = line.slice(position, position + 1)
      if (value !== ' ') {
        const stack = stackState.get(i.toString())
        if (stack === undefined) {
          throw new Error('unexpected value')
        }
        stack.unshift(value)
      }
    }
  }
})

const answerString = [...stackState.values()].reduce(
  (previousValue, currentValue) => (previousValue += currentValue[currentValue.length - 1]),
  ''
)
console.log(answerString)
