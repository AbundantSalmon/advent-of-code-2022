/**
 * INCOMPLETE does not currently work
 */
const directory = new URL('.', import.meta.url).pathname
const inputText = Deno.readTextFileSync(directory + '/input.txt')
const lines = inputText.split('\n')

const bluePrintRegex =
  /Blueprint ([0-9]+): Each ore robot costs ([0-9]+) ore. Each clay robot costs ([0-9]+) ore. Each obsidian robot costs ([0-9]+) ore and ([0-9]+) clay. Each geode robot costs ([0-9]+) ore and ([0-9]+) obsidian./

class Blueprint {
  id: number
  oreRobot: Robot
  clayRobot: Robot
  obsidianRobot: Robot
  geodeRobot: Robot
  constructor(
    id: number,
    oreRobot: Robot,
    clayRobot: Robot,
    obsidianRobot: Robot,
    geodeRobot: Robot
  ) {
    this.id = id
    this.oreRobot = oreRobot
    this.clayRobot = clayRobot
    this.obsidianRobot = obsidianRobot
    this.geodeRobot = geodeRobot
  }
}

interface Resources {
  ore: number
  clay: number
  obsidian: number
  geode: number
}

class Robot {
  oreCost: number
  clayCost: number
  obsidianCost: number
  type: 'oreRobot' | 'clayRobot' | 'obsidianRobot' | 'geodeRobot'
  constructor(
    oreCost: number,
    clayCost: number,
    obsidianCost: number,
    type: 'oreRobot' | 'clayRobot' | 'obsidianRobot' | 'geodeRobot'
  ) {
    this.oreCost = oreCost
    this.clayCost = clayCost
    this.obsidianCost = obsidianCost
    this.type = type
  }

  generateResource(): Resources {
    switch (this.type) {
      case 'oreRobot': {
        return {
          ore: 1,
          clay: 0,
          obsidian: 0,
          geode: 0,
        }
      }
      case 'clayRobot': {
        return {
          ore: 0,
          clay: 1,
          obsidian: 0,
          geode: 0,
        }
      }
      case 'obsidianRobot': {
        return {
          ore: 0,
          clay: 0,
          obsidian: 1,
          geode: 0,
        }
      }
      case 'geodeRobot': {
        return {
          ore: 0,
          clay: 0,
          obsidian: 0,
          geode: 1,
        }
      }
      default:
        throw new Error('unexpected robot')
    }
  }

  canBeCreated(resources: Resources): boolean {
    if (
      resources.ore >= this.oreCost &&
      resources.clay >= this.clayCost &&
      resources.obsidian >= this.obsidianCost
    ) {
      return true
    }
    return false
  }
}

const blueprints = lines.map(line => {
  const match = line.match(bluePrintRegex)
  if (match === null) {
    throw new Error('unexpected line')
  }
  const [
    _,
    id,
    oreRobotOreCost,
    clayRobotOreCost,
    obsidianRobotOreCost,
    obsidianRobotClayCost,
    geodeRobotOreCost,
    geodeRobotObsidianCost,
  ] = match

  const oreRobot = new Robot(parseInt(oreRobotOreCost), 0, 0, 'oreRobot')
  const clayRobot = new Robot(parseInt(clayRobotOreCost), 0, 0, 'clayRobot')
  const obsidianRobot = new Robot(
    parseInt(obsidianRobotOreCost),
    parseInt(obsidianRobotClayCost),
    0,
    'obsidianRobot'
  )
  const geodeRobot = new Robot(
    parseInt(geodeRobotOreCost),
    0,
    parseInt(geodeRobotObsidianCost),
    'geodeRobot'
  )

  return new Blueprint(parseInt(id), oreRobot, clayRobot, obsidianRobot, geodeRobot)
})

const timeMinutes = 24

const addResources = (resources: Resources, addition: Resources): Resources => {
  const res = {
    ...resources,
  }
  res['ore'] += addition.ore
  res['clay'] += addition.clay
  res['obsidian'] += addition.obsidian
  res['geode'] += addition.geode
  return res
}

interface State {
  robots: ('oreRobot' | 'clayRobot' | 'obsidianRobot' | 'geodeRobot')[]
  time: number
  resources: Resources
}

const scores = blueprints.map(blueprint => {
  const resources: Resources = {
    ore: 0,
    clay: 0,
    geode: 0,
    obsidian: 0,
  }
  const robots: ('oreRobot' | 'clayRobot' | 'obsidianRobot' | 'geodeRobot')[] = []
  robots.push('oreRobot')
  const states: State[] = [
    {
      robots: robots,
      time: timeMinutes,
      resources,
    },
  ]

  let maxGeodeBots = 0

  while (states.length > 0) {
    const state = states.pop()
    if (state === undefined) {
      throw new Error('unexpected behaviour')
    }
    // console.log(`length: ${states.length}`)
    // console.log(`time: ${state.time}`)
    if (state.time <= 0) {
      if (state.resources.geode > maxGeodeBots) {
        maxGeodeBots = state.resources.geode
      }
      continue
    }
    const currentResources = { ...state.resources }

    // if can construct robots (choose to or not) can only construct 1 at a time
    for (const robot of [
      blueprint.geodeRobot,
      blueprint.clayRobot,
      blueprint.obsidianRobot,
      blueprint.oreRobot,
    ]) {
      // generate resources from the current robots
      const newResourcesPerTimeStep = state.robots.reduce<Resources>(
        (prev, robotKey) => {
          return addResources(prev, blueprint[robotKey].generateResource())
        },
        { ore: 0, clay: 0, obsidian: 0, geode: 0 }
      )

      // See if robot can be made
      if (robot.clayCost > 0 && newResourcesPerTimeStep.clay === 0) {
        continue
      }
      if (robot.obsidianCost > 0 && newResourcesPerTimeStep.obsidian === 0) {
        continue
      }
      if (robot.oreCost > 0 && newResourcesPerTimeStep.ore === 0) {
        continue
      }

      const potentialTimeSteps: number[] = []
      if (newResourcesPerTimeStep.clay > 0) {
        potentialTimeSteps.push(
          Math.ceil((robot.clayCost - currentResources.clay) / newResourcesPerTimeStep.clay)
        )
      }
      if (newResourcesPerTimeStep.obsidian > 0) {
        potentialTimeSteps.push(
          Math.ceil(
            (robot.obsidianCost - currentResources.obsidian) / newResourcesPerTimeStep.obsidian
          )
        )
      }
      if (newResourcesPerTimeStep.ore > 0) {
        potentialTimeSteps.push(
          Math.ceil((robot.oreCost - currentResources.ore) / newResourcesPerTimeStep.ore)
        )
      }

      let requiredTimeStep = Math.max(...potentialTimeSteps)
      if (requiredTimeStep <= 0) {
        requiredTimeStep = 1
      }

      const afterRobotConsumed = { ...currentResources }
      afterRobotConsumed.clay += -robot.clayCost + requiredTimeStep * newResourcesPerTimeStep.clay
      afterRobotConsumed.obsidian +=
        -robot.obsidianCost + requiredTimeStep * newResourcesPerTimeStep.obsidian
      afterRobotConsumed.ore += -robot.oreCost + requiredTimeStep * newResourcesPerTimeStep.ore
      afterRobotConsumed.geode += requiredTimeStep * newResourcesPerTimeStep.geode
      // console.log(afterRobotConsumed)
      states.push({
        resources: afterRobotConsumed,
        time: state.time - requiredTimeStep,
        robots: [...state.robots, robot.type],
      })
    }
  }

  return [maxGeodeBots, blueprint.id]
})

console.log(scores)
