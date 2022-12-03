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

const linesLength = lines.length
if (linesLength % 3 !== 0) {
  throw new Error('the number of lines must be divisible by 3')
}

for (let i = 0; i < linesLength; i += 3) {
  const firstElf = lines[i]
  const secondElf = lines[i + 1]
  const thirdElf = lines[i + 2]

  const firstCount = counterLetters(firstElf)
  const secondCount = counterLetters(secondElf)
  const thirdCount = counterLetters(thirdElf)

  for (const letter in firstCount) {
    if (letter in secondCount) {
      if (letter in thirdCount) {
        priority += getPriorityOfLetter(letter)
        break
      }
    }
  }
}

console.log(priority)
