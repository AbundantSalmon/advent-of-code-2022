const directory = new URL('.', import.meta.url).pathname
const inputText = Deno.readTextFileSync(directory + '/input.txt')
const lines = inputText.split('\n')

interface NullableValue {
  data: number
  initialPosition: number
  //   currentPosition: number
  nextValue: NullableValue | null
  previousValue: NullableValue | null
}
interface Value extends NullableValue {
  nextValue: Value
  previousValue: Value
}

const originalNullablePositions: NullableValue[] = lines.map((line, index) => ({
  data: parseInt(line),
  initialPosition: index,
  //   currentPosition: index,
  nextValue: null,
  previousValue: null,
}))

for (let i = 0; i < originalNullablePositions.length; ++i) {
  if (i === originalNullablePositions.length - 1) {
    originalNullablePositions[i].nextValue = originalNullablePositions[0]
  } else {
    originalNullablePositions[i].nextValue = originalNullablePositions[i + 1]
  }
  if (i === 0) {
    originalNullablePositions[i].previousValue =
      originalNullablePositions[originalNullablePositions.length - 1]
  } else {
    originalNullablePositions[i].previousValue = originalNullablePositions[i - 1]
  }
}

const confirmNotNull = (positions: NullableValue[]): Value[] => {
  positions.forEach(value => {
    if (value.nextValue === null) {
      throw new Error('null')
    }
    if (value.previousValue === null) {
      throw new Error('null')
    }
  })

  return positions as Value[]
}

const originalPositions = confirmNotNull(originalNullablePositions)

const mutableList = originalPositions.map(value => value)

originalPositions.forEach(value => {
  const valueToMoveBy = value.data
  const currentPosition = mutableList.findIndex(listValue => listValue === value)
  const indexToMoveToSigned = (currentPosition + valueToMoveBy) % originalPositions.length
  const wrapsForward = (currentPosition + valueToMoveBy) / originalPositions.length > 1
  let indexToMoveTo = indexToMoveToSigned
  // Probably better logic but works for now
  if (wrapsForward) {
    indexToMoveTo = indexToMoveToSigned + 1
  } else if (indexToMoveToSigned > 0 || valueToMoveBy === 0) {
    indexToMoveTo = indexToMoveToSigned
  } else {
    indexToMoveTo = originalPositions.length - 1 + indexToMoveToSigned
    if (indexToMoveToSigned === 0) {
      indexToMoveTo = originalPositions.length - 1
    }
  }

  const valueToMoveAfter = mutableList[indexToMoveTo]

  const previousOriginalLocation = value.previousValue
  const nextOriginalLocation = value.nextValue

  const newPrevious = valueToMoveAfter
  const newNext = valueToMoveAfter.nextValue

  // disconnect current values position
  previousOriginalLocation.nextValue = nextOriginalLocation
  nextOriginalLocation.previousValue = previousOriginalLocation

  // connect up new position
  value.previousValue = newPrevious
  value.nextValue = newNext

  newPrevious.nextValue = value
  newNext.previousValue = value

  // splice it in
  mutableList.splice(currentPosition, 1)
  mutableList.splice(indexToMoveTo, 0, value)
})

const indexOfZeroValue = mutableList.findIndex(listValue => listValue.data === 0)

console.log(indexOfZeroValue)
const thousandthIndex = (indexOfZeroValue + 1000) % mutableList.length
const twoThousandthIndex = (indexOfZeroValue + 2000) % mutableList.length
const threeThousandthIndex = (indexOfZeroValue + 3000) % mutableList.length
console.log(mutableList[thousandthIndex].data)
console.log(mutableList[twoThousandthIndex].data)
console.log(mutableList[threeThousandthIndex].data)

let currentValue = mutableList[indexOfZeroValue]
for (let i = 1; i <= 3000; ++i) {
  currentValue = currentValue.nextValue
  if (i === 1000 || i === 2000 || i === 3000) {
    console.log(currentValue.data)
  }
}


const encryptedNumber =
  mutableList[thousandthIndex].data +
  mutableList[twoThousandthIndex].data +
  mutableList[threeThousandthIndex].data

console.log(encryptedNumber)
