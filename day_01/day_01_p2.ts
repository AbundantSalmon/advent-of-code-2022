const inputText = Deno.readTextFileSync('./input.txt')
const lines = inputText.split('\n')

let mostCalories = 0
let secondMostCalories = 0
let thirdMostCalories = 0
let currentElfCalories = 0

lines.forEach(line => {
  if (line === '') {
    if (currentElfCalories > mostCalories) {
      thirdMostCalories = secondMostCalories
      secondMostCalories = mostCalories
      mostCalories = currentElfCalories
    } else if (currentElfCalories > secondMostCalories) {
      thirdMostCalories = secondMostCalories
      secondMostCalories = currentElfCalories
    } else if (currentElfCalories > thirdMostCalories) {
      thirdMostCalories = currentElfCalories
    }
    currentElfCalories = 0
  } else {
    currentElfCalories += parseInt(line)
  }
})

console.log(mostCalories + secondMostCalories + thirdMostCalories)
