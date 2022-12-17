/**
 * INCOMPLETE does not currently work
 */
const directory = new URL('.', import.meta.url).pathname
const inputText = Deno.readTextFileSync(directory + '/input.txt')
const lines = inputText.split('\n')

class Node {
  name: string
  openFlowRate: number
  connectedNodes: Node[] = []
  constructor(name: string, openFlowRate: number) {
    this.name = name
    this.openFlowRate = openFlowRate
  }
  connectNode(node: Node) {
    this.connectedNodes.push(node)
  }
}

const nodeRegex = /Valve (.+) has flow rate=([0-9]+); tunnels? leads? to valves? (.+)/

const nodes: Record<string, Node> = {}

lines.forEach(line => {
  const matches = line.match(nodeRegex)
  if (matches === null) {
    throw new Error('unexpected line')
  }
  const [_, name, flowRate] = matches

  nodes[name] = new Node(name, parseInt(flowRate))
})

lines.forEach(line => {
  const matches = line.match(nodeRegex)
  if (matches === null) {
    throw new Error('unexpected line')
  }
  const [_, name, _flowRate, connectedString] = matches
  const connectedNodes = connectedString.split(', ')
  connectedNodes.forEach(node => {
    nodes[name].connectNode(nodes[node])
  })
})

/**
- find shortest paths between nodes with flow rates
- path cost between nodes with flow rates is shortest path (assume minute) * flow rate
- solution is the path to visit all nodes with flow
- calculate whilst visiting to get total flow
 */

interface StateParams {
  meLocation: string
  meOpening: boolean
  elephantLocation: string
  elephantOpening: boolean
  currentTime: number
  pressure: number
  openedValves: string[]
}

const queue: StateParams[] = []

const root: StateParams = {
  meLocation: 'AA',
  meOpening: false,
  elephantLocation: 'AA',
  elephantOpening: false,
  currentTime: 26, // due to training elephant
  pressure: 0,
  openedValves: [],
}
queue.push(root)

let maxPressure = 0

while (queue.length > 0) {
  const currentState = queue.shift()
  if (currentState === undefined) {
    throw new Error('unexpected state')
  }

  const meAvailableNeighbours = nodes[currentState.meLocation].connectedNodes.filter(
    node => !currentState.openedValves.find(nodeName => nodeName === node.name)
  )

  const elephantAvailableNeighbours = nodes[currentState.elephantLocation].connectedNodes.filter(
    node => !currentState.openedValves.find(nodeName => nodeName === node.name)
  )

  if (meAvailableNeighbours.length === 0 || elephantAvailableNeighbours.length === 0) {
    // visited all the valves with flow
    let pressure =
      currentState.pressure +
      (currentState.currentTime - 1) * nodes[currentState.meLocation].openFlowRate
    if (currentState.meLocation !== currentState.elephantLocation) {
      // only count if they are different locations
      pressure += (currentState.currentTime - 1) * nodes[currentState.elephantLocation].openFlowRate
    }

    if (pressure > maxPressure) {
      maxPressure = pressure
    }
  }

  if (currentState.currentTime <= 0) {
    if (currentState.pressure > maxPressure) {
      maxPressure = currentState.pressure
    }
  }

  const timeDeltaMove = 1

  if (currentState.meOpening && currentState.elephantOpening) {
    queue.push({
      meLocation: currentState.meLocation,
      meOpening: false,
      elephantLocation: currentState.elephantLocation,
      elephantOpening: false,
      currentTime: currentState.currentTime - timeDeltaMove,
      pressure: currentState.pressure,
      openedValves: [
        ...currentState.openedValves,
      ],
    })
  } else if (currentState.meOpening) {
    for (const elephantNode of elephantAvailableNeighbours) {
      const newPressure =
        currentState.pressure +
        (currentState.currentTime - 1) * nodes[currentState.elephantLocation].openFlowRate

        const openedValves = [...currentState.openedValves]
        if (nodes[currentState.elephantLocation].openFlowRate > 0) {
          openedValves.push(currentState.elephantLocation)
        }

      queue.push({
        meLocation: currentState.meLocation,
        meOpening: false,
        elephantLocation: elephantNode.name,
        elephantOpening: nodes[currentState.elephantLocation].openFlowRate > 0,
        currentTime: currentState.currentTime - timeDeltaMove,
        pressure: newPressure,
        openedValves,
      })
    }
  } else if (currentState.elephantOpening) {
    for (const meNode of meAvailableNeighbours) {
      const newPressure =
        currentState.pressure +
        (currentState.currentTime - 1) * nodes[currentState.meLocation].openFlowRate

        const openedValves = [...currentState.openedValves]
        if (nodes[currentState.meLocation].openFlowRate > 0) {
          openedValves.push(currentState.meLocation)
        }

      queue.push({
        meLocation: meNode.name,
        meOpening: nodes[currentState.meLocation].openFlowRate > 0,
        elephantLocation: currentState.elephantLocation,
        elephantOpening: false,
        currentTime: currentState.currentTime - timeDeltaMove,
        pressure: newPressure,
        openedValves: openedValves,
      })
    }
  } else {
    //neither opening
    for (const meNode of meAvailableNeighbours) {
      for (const elephantNode of elephantAvailableNeighbours) {
        const newPressure =
          currentState.pressure +
          (currentState.currentTime - 1) * nodes[currentState.meLocation].openFlowRate +
          (currentState.currentTime - 1) * nodes[currentState.elephantLocation].openFlowRate

        const openedValves = [...currentState.openedValves]
        if (nodes[currentState.meLocation].openFlowRate > 0) {
          openedValves.push(currentState.meLocation)
        }
        if (nodes[currentState.elephantLocation].openFlowRate > 0) {
          openedValves.push(currentState.elephantLocation)
        }

        queue.push({
          meLocation: meNode.name,
          meOpening: nodes[currentState.meLocation].openFlowRate > 0,
          elephantLocation: elephantNode.name,
          elephantOpening: nodes[currentState.elephantLocation].openFlowRate > 0,
          currentTime: currentState.currentTime - timeDeltaMove,
          pressure: newPressure,
          openedValves: openedValves,
        })
      }
    }
  }
}

console.log(maxPressure)
