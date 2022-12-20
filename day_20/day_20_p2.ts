const directory = new URL('.', import.meta.url).pathname
const inputText = Deno.readTextFileSync(directory + '/input.txt')
const lines = inputText.split('\n')

interface NullableValue {
  data: number
  nextValue: NullableValue | null
  previousValue: NullableValue | null
}
interface Value extends NullableValue {
  nextValue: Value
  previousValue: Value
}

const originalNullablePositions: NullableValue[] = lines.map(line => ({
  data: parseInt(line) * 811589153,
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
    if (!value.nextValue) {
      throw new Error('null')
    }
    if (!value.previousValue) {
      throw new Error('null')
    }
  })

  return positions as Value[]
}

const originalPositions = confirmNotNull(originalNullablePositions)

function mix(originalPositions: Value[]) {
  originalPositions.forEach(value => {
    const valueToMoveBy = value.data

    if (valueToMoveBy > 0) {
      let valueToMoveAfter = value
      for (let i = 0; i < valueToMoveBy % (originalPositions.length - 1); ++i) {
        valueToMoveAfter = valueToMoveAfter.nextValue
        if (valueToMoveAfter === value) {
          // technically value is removed before counting, so it needs to skip itself
          valueToMoveAfter = valueToMoveAfter.nextValue
        }
      }

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
    } else if (valueToMoveBy < 0) {
      let valueToMoveBefore = value
      for (let i = 0; i < Math.abs(valueToMoveBy) % (originalPositions.length - 1); ++i) {
        valueToMoveBefore = valueToMoveBefore.previousValue
        if (valueToMoveBefore === value) {
          // technically value is removed before counting, so it needs to skip itself
          valueToMoveBefore = valueToMoveBefore.previousValue
        }
      }

      const previousOriginalLocation = value.previousValue
      const nextOriginalLocation = value.nextValue

      const newPrevious = valueToMoveBefore.previousValue
      const newNext = valueToMoveBefore

      // disconnect current values position
      previousOriginalLocation.nextValue = nextOriginalLocation
      nextOriginalLocation.previousValue = previousOriginalLocation

      // connect up new position
      value.previousValue = newPrevious
      value.nextValue = newNext

      newPrevious.nextValue = value
      newNext.previousValue = value
    }
  })
}

for (let i = 0; i < 10; ++i) {
  mix(originalPositions)
}

let thousandthValue = -1
let twoThousandthValue = -1
let threeThousandthValue = -1

let currentValue = originalPositions.find(listValue => listValue.data === 0)
if (currentValue === undefined) {
  throw new Error('error')
}
for (let i = 1; i <= 3000; ++i) {
  currentValue = currentValue.nextValue
  if (i === 1000) {
    thousandthValue = currentValue.data
  }
  if (i === 2000) {
    twoThousandthValue = currentValue.data
  }
  if (i === 3000) {
    threeThousandthValue = currentValue.data
  }
}

const encryptedNumber = thousandthValue + twoThousandthValue + threeThousandthValue

console.log(encryptedNumber)
