const inputText = Deno.readTextFileSync('./input.txt')
const lines = inputText.split('\n')

let count = 0

lines.forEach(line => {
  const assignmentPairRange = line.split(',')

  const firstRangePair = assignmentPairRange[0].split('-')
  const secondRangePair = assignmentPairRange[1].split('-')

  const firstRangePairInteger = firstRangePair.map(x => parseInt(x))
  const secondRangePairInteger = secondRangePair.map(x => parseInt(x))

  if (
    firstRangePairInteger[0] <= secondRangePairInteger[0] &&
    firstRangePairInteger[1] >= secondRangePairInteger[1]
  ) {
    count++
  } else if(
    secondRangePairInteger[0] <= firstRangePairInteger[0] &&
    secondRangePairInteger[1] >= firstRangePairInteger[1]
  ) {
    count++
  }
})

console.log(count)
