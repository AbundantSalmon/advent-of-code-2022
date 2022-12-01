const inputText = Deno.readTextFileSync('./input.txt')
const lines = inputText.split('\n')

let mostCalories = 0
let currentElfCalories = 0

lines.forEach(line => {
  if (line === '') {
    if (currentElfCalories > mostCalories) {
      mostCalories = currentElfCalories
    }
    currentElfCalories = 0
  } else {
    currentElfCalories += parseInt(line)
  }
})

console.log(mostCalories)
