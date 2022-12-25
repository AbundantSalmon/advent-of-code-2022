const directory = new URL('.', import.meta.url).pathname
const inputText = Deno.readTextFileSync(directory + '/input.txt')
const lines = inputText.split('\n')

// 125,25,5,1
// 2,1,0,-,=

/**
 * 1-12 <- 107
 *       105 2
 */

const parseToDecimal = (line: string) => {
  const valuesInPlaces: number[] = []
  line.split('').forEach(char => {
    if (char === '0' || char === '1' || char === '2') {
      valuesInPlaces.push(parseInt(char))
    } else if (char === '-') {
      valuesInPlaces.push(-1)
    } else if (char === '=') {
      valuesInPlaces.push(-2)
    } else {
      throw new Error(`unexpected input: ${char}`)
    }
  })
  const decimals = valuesInPlaces.map((value, index) => {
    const power = valuesInPlaces.length - 1 - index
    return Math.pow(5, power) * value
  })
  return decimals.reduce((prev, curr) => {
    return prev + curr
  }, 0)
}

const decimalToSnafu = (value: number): string => {
  const valueInPlaces: number[] = []
  let newValue = value
  while (newValue > 0) {
    const nextValue = Math.floor(newValue / 5)
    const rightMostDigit = newValue % 5
    valueInPlaces.unshift(rightMostDigit)
    newValue = nextValue
  }

  /**
   * [ 2, -2, 0, -2 ]
   * 198
   * [ 1, 2, 4, 3 ]
   *
   * [ 1, 3, -1, 3 ]
   * [ 2, -2, -1, 3 ]
   * [ 2, -2, 0, -2 ]
   */

  let i = 0
  while (valueInPlaces.length - 1 - i >= 0) {
    if (valueInPlaces[i] > 2) {
      valueInPlaces[i] = valueInPlaces[i] - 5
      if (i === 0) {
        valueInPlaces.unshift(1)
      } else {
        valueInPlaces[i - 1] += 1
      }
      --i
    } else {
      ++i
    }
  }

  //   console.log(valueInPlaces)
  return valueInPlaces.reduce((prev, curr) => {
    if (curr === 0 || curr === 1 || curr === 2) {
      return (prev += curr.toString())
    } else if (curr === -2) {
      return (prev += '=')
    } else if (curr === -1) {
      return (prev += '-')
    }
    throw new Error('unexpected input')
  }, '')
}

const valuesInDecimal = lines.map(line => {
  return parseToDecimal(line)
})

const sum = valuesInDecimal.reduce((prev, curr) => {
  return prev + curr
}, 0)

console.log(sum)

const sumInSnafu = decimalToSnafu(sum)

console.log(sumInSnafu)
