const directory = new URL('.', import.meta.url).pathname
const inputText = Deno.readTextFileSync(directory + '/input.txt')
const lines = inputText.split('\n')

const END_OF_ARRAY = 'EOA'

type Packet = (number | typeof END_OF_ARRAY | Packet)[]

interface PacketPair {
  left: Packet | null
  right: Packet | null
}

const insertValue = (packet: Packet, value: number | number[] | typeof END_OF_ARRAY) => {
  let previousPlace: Packet = packet
  let currentPlace: Packet = packet
  while (
    Array.isArray(currentPlace[currentPlace.length - 1]) &&
    currentPlace[currentPlace.length - 1] !== END_OF_ARRAY
  ) {
    const value = currentPlace[currentPlace.length - 1]
    if (typeof value === 'number') {
      throw new Error('Unexpected value')
    }
    if (value === END_OF_ARRAY) {
      throw new Error('Unexpected value')
    }

    previousPlace = currentPlace
    currentPlace = value
  }
  if (currentPlace[currentPlace.length - 1] === END_OF_ARRAY) {
    currentPlace.pop()
    previousPlace.push(value)
  } else {
    currentPlace.push(value)
  }
}
const convertToPacket = (line: string): Packet => {
  let packet: Packet | null = null
  let currentNumber = ''

  for (const character of line.split('')) {
    if (character === '[') {
      if (packet === null) {
        packet = []
      } else {
        insertValue(packet, [])
      }
    } else if (character === ']') {
      if (packet === null) {
        throw new Error('Unexpected value')
      }

      if (currentNumber !== '') {
        insertValue(packet, parseInt(currentNumber))
        insertValue(packet, END_OF_ARRAY)
        currentNumber = ''
      } else {
        insertValue(packet, END_OF_ARRAY)
      }
    } else if (character === ',') {
      if (packet === null) {
        throw new Error('Unexpected value')
      }

      if (currentNumber !== '') {
        insertValue(packet, parseInt(currentNumber))
        currentNumber = ''
      }
    } else {
      // must be a number
      currentNumber += character
    }
  }

  if (packet === null) {
    throw new Error('Unexpected value')
  }

  packet.pop() // remove the last EOA

  return packet
}

const isRightOrder = (pair: PacketPair): boolean => {
  if (pair.left === null) {
    throw new Error('Unexpected value')
  }
  if (pair.right === null) {
    throw new Error('Unexpected value')
  }
  const value = compareList(pair.left, pair.right)
  if (value === 'continue' || value === 'correct') {
    return true
  }
  return false
}

const compareList = (
  leftPacket: Packet,
  rightPacket: Packet
): 'correct' | 'incorrect' | 'continue' => {
  const smallestLength = Math.min(leftPacket.length, rightPacket.length)

  for (let i = 0; i < smallestLength; ++i) {
    const leftValue = leftPacket[i]
    const rightValue = rightPacket[i]
    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      if (rightValue < leftValue) {
        return 'incorrect'
      } else if (leftValue < rightValue) {
        return 'correct'
      }
    } else if (Array.isArray(leftValue) && Array.isArray(rightValue)) {
      const arrayIsEqual = compareList(leftValue, rightValue)
      if (arrayIsEqual === 'incorrect') {
        return 'incorrect'
      } else if (arrayIsEqual === 'correct') {
        return 'correct'
      }
    } else {
      if (Array.isArray(leftValue)) {
        rightPacket[i] = [rightValue]
      } else {
        leftPacket[i] = [leftValue]
      }
      --i // run it again now that it is modified
    }
  }
  if (leftPacket.length > rightPacket.length) {
    return 'incorrect'
  } else if (rightPacket.length > leftPacket.length) {
    return 'correct'
  }
  return 'continue'
}

const packetPairs: PacketPair[] = []
let currentPacket: PacketPair = { left: null, right: null }

lines.forEach(line => {
  if (line === '') {
    packetPairs.push(currentPacket)
    currentPacket = { left: null, right: null }
  } else if (currentPacket.left === null) {
    currentPacket.left = convertToPacket(line)
  } else if (currentPacket.right === null) {
    currentPacket.right = convertToPacket(line)
  }
})

const sumOfIndicesOfOrderedPairs = packetPairs
  .map((pair, index) => {
    return isRightOrder(pair) ? index + 1 : 0
  })
  .reduce((prev, curr) => prev + curr, 0)

// console.log(Deno.inspect(packetPairs, { depth: 10 }))

console.log(sumOfIndicesOfOrderedPairs)
