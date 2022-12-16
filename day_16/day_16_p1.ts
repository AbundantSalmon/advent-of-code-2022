import MinHeap from './heap.ts'

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

const dijkstra = (nodes: Record<string, Node>, start: string, end: string): number => {
  const queue = new MinHeap<string>()
  const distance: Record<string, number> = {}

  // setup
  distance[start] = 0
  Object.values(nodes).forEach(node => {
    const point = node.name
    if (point !== start) {
      distance[point] = Number.MAX_SAFE_INTEGER
    }
    queue.add(distance[point], point)
  })

  while (queue.length !== 0) {
    const point = queue.remove()
    if (point === undefined) {
      throw new Error('error occurred')
    }
    if (point === end) {
      break
    }
    for (const neighbour of nodes[point].connectedNodes) {
      const neighbourDistance = distance[point] + 1
      const name = neighbour.name
      if (neighbourDistance < distance[name]) {
        distance[name] = neighbourDistance
        queue.add(neighbourDistance, name)
      }
    }
  }

  return distance[end]
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

const nodesWithFlowRates = Object.values(nodes).filter(node => node.openFlowRate > 0)

const nodesWithFlowRatesIncludingStart = [...nodesWithFlowRates]
nodesWithFlowRatesIncludingStart.push(nodes['AA']) // must include starting node

const shortestPathBetweenNodes: Record<string, number> = {}

nodesWithFlowRatesIncludingStart.forEach(startNode => {
  nodesWithFlowRatesIncludingStart.forEach(endNode => {
    if (startNode.name !== endNode.name) {
      const shortestPath = dijkstra(nodes, startNode.name, endNode.name)
      shortestPathBetweenNodes[`${startNode.name},${endNode.name}`] = shortestPath
    }
  })
})

interface StateParams {
  nodeName: string
  currentTime: number
  pressure: number
  openedValves: string[]
}

const queue: StateParams[] = []

const root: StateParams = {
  nodeName: 'AA',
  currentTime: 30,
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

  const availableNeighbours = Object.values(nodesWithFlowRates).filter(
    node => !currentState.openedValves.find(nodeName => nodeName === node.name)
  )

  if (availableNeighbours.length === 0) {
    // visited all the valves with flow
    const pressure =
      currentState.pressure + currentState.currentTime * nodes[currentState.nodeName].openFlowRate
    if (pressure > maxPressure) {
      maxPressure = pressure
    }
  }

  for (const node of availableNeighbours) {
    const timeDeltaMoveAndOpen =
      shortestPathBetweenNodes[`${currentState.nodeName},${node.name}`] + 1 // to open

    if (currentState.currentTime - timeDeltaMoveAndOpen <= 0) {
      // can't reach any more valves due to time
      const pressure =
        currentState.pressure + currentState.currentTime * nodes[currentState.nodeName].openFlowRate
      if (pressure > maxPressure) {
        maxPressure = pressure
      }
    } else {
      queue.push({
        nodeName: node.name,
        currentTime: currentState.currentTime - timeDeltaMoveAndOpen,
        pressure:
          currentState.pressure +
          currentState.currentTime * nodes[currentState.nodeName].openFlowRate,
        openedValves: [...currentState.openedValves, node.name],
      })
    }
  }
}

console.log(maxPressure)
