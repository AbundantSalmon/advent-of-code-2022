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

const inputText = Deno.readTextFileSync('./input.txt')
const lines = inputText.split('\n')

const line = lines[0]

let charactersBeforeMarker = 0
for (let i = 0; i < line.length - 4; ++i) {
  const slice = line.slice(i, i + 4)

  const count = counterLetters(slice)
  if (Object.values(count).every(value => value <= 1)) {
    charactersBeforeMarker = i + 4
    break
  }
}

console.log(charactersBeforeMarker)
