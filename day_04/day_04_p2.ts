const inputText = Deno.readTextFileSync('./input.txt')
const lines = inputText.split('\n')

let count = 0

const isOverlapping = (
  firstRangePairInteger: [number, number],
  secondRangePairInteger: [number, number]
): boolean => {
  /**
   * Overlap occurs if the start value of the first range is within the bounds of the second range.
   * Overlap occurs if the start value of the second range is within the bounds of the first range.
   */
  if (
    firstRangePairInteger[0] >= secondRangePairInteger[0] &&
    firstRangePairInteger[0] <= secondRangePairInteger[1]
  ) {
    return true
  } else if (
    secondRangePairInteger[0] >= firstRangePairInteger[0] &&
    secondRangePairInteger[0] <= firstRangePairInteger[1]
  ) {
    return true
  }
  return false
}

lines.forEach(line => {
  const assignmentPairRange = line.split(',')

  const firstRangePair = assignmentPairRange[0].split('-')
  const secondRangePair = assignmentPairRange[1].split('-')

  const firstRangePairInteger = firstRangePair.map(x => parseInt(x))
  const secondRangePairInteger = secondRangePair.map(x => parseInt(x))

  if (
    isOverlapping(
      [firstRangePairInteger[0], firstRangePairInteger[1]],
      [secondRangePairInteger[0], secondRangePairInteger[1]]
    )
  ) {
    count++
  }
})

console.log(count)
