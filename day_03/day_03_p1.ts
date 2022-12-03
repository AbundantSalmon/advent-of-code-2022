const inputText = Deno.readTextFileSync('./input.txt')
const lines = inputText.split('\n')

let priority = 0

const counterLetters = (str: string): Record<string, number> => {
  const counter: Record<string, number> = {}
  str.split('').forEach(letter => {
    if (letter in counter) {
      counter[letter] += 1
    } else {
      counter[letter] = 1
    }
  })
  return counter
}
const getPriorityOfLetter = (letter: string): number => {
  const asciiValue = letter.charCodeAt(0)
  if (asciiValue >= 65 && asciiValue <= 90) {
    return asciiValue - 64 + 26
  } else if (asciiValue >= 97 && asciiValue <= 122) {
    return asciiValue - 96
  }
  throw new Error(`Invalid letter: ${letter}`)
}

lines.forEach(line => {
  if (line.length % 2 !== 0) {
    throw new Error('line length must be even')
  }

  const halfLength = line.length / 2

  const firstHalf = line.slice(0, halfLength)
  const secondHalf = line.slice(halfLength)

  const firstCount = counterLetters(firstHalf)
  const secondCount = counterLetters(secondHalf)

  let foundAppearsInBoth = false
  for (const letter in firstCount) {
    if (letter in secondCount) {
      foundAppearsInBoth = true
      priority += getPriorityOfLetter(letter)
      break
    }
  }

  if (!foundAppearsInBoth) {
    for (const letter in secondCount) {
      if (letter in firstCount) {
        foundAppearsInBoth = true
        priority += getPriorityOfLetter(letter)
        break
      }
    }
  }
})

console.log(priority)
