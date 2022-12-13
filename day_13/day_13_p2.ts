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

const compareFunction = (packetA: Packet, packerB: Packet): number => {
  const value = compareList(packetA, packerB)
  if (value === 'correct') {
    return -1
  } else if (value === 'incorrect') {
    return 1
  }
  return 0
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
      let arrayIsEqual = 'continue'
      if (Array.isArray(leftValue)) {
        arrayIsEqual = compareList(leftValue, [rightValue])
      } else if (Array.isArray(rightValue)) {
        arrayIsEqual = compareList([leftValue], rightValue)
      } else {
        throw new Error('Unexpected value')
      }
      if (arrayIsEqual === 'incorrect') {
        return 'incorrect'
      } else if (arrayIsEqual === 'correct') {
        return 'correct'
      }
    }
  }
  if (leftPacket.length > rightPacket.length) {
    return 'incorrect'
  } else if (rightPacket.length > leftPacket.length) {
    return 'correct'
  }
  return 'continue'
}

const packets: Packet[] = []

lines.forEach(line => {
  if (line !== '') {
    packets.push(convertToPacket(line))
  }
})

//add divider packets

packets.push([[2]])
packets.push([[6]])

const sortedPackets = packets.toSorted(compareFunction)

// console.log(Deno.inspect(sortedPackets, { depth: 10 }))

const sumOfDividerIndex = sortedPackets.reduce((prev, curr, index) => {
  if (
    curr.length === 1 &&
    Array.isArray(curr[0]) &&
    curr[0].length === 1 &&
    (curr[0][0] === 2 || curr[0][0] === 6)
  ) {
    return prev * (index + 1)
  }
  return prev
}, 1)

console.log(sumOfDividerIndex)
