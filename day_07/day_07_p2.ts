const inputText = Deno.readTextFileSync('./input.txt')
const lines = inputText.split('\n')

const TOTAL_DISK_SPACE = 70000000
const REQUIRED_DISK_SPACE = 30000000

const fileSizeRegex = /([0-9]+)/

const isCommand = (line: string): boolean => {
  return line[0] === '$'
}

const handleDirectoryName = ({
  currentDirectory,
  parent,
}: {
  currentDirectory: string
  parent: string
}) => {
  return parent + '/' + currentDirectory
}

const processCommand = (line: string) => {
  const command = line.slice(2, 4)
  if (command === 'cd') {
    const directory = line.slice(5)
    if (directory === '..') {
      currentDirectory = directories[currentDirectory].parentDirectory
    } else if (directory === '/') {
      currentDirectory = '/'
    } else {
      // Because directories can have the same name under different paths
      const directoryPath = handleDirectoryName({
        currentDirectory: directory,
        parent: currentDirectory,
      })
      directories[directoryPath] = {
        parentDirectory: currentDirectory,
        subDirectories: [],
        totalImmediateFileSize: 0,
      }
      currentDirectory = directoryPath
    }
  } else if (command === 'ls') {
    // do nothing
  } else {
    throw new Error('Unexpected command')
  }
}

const processInformation = (line: string) => {
  if (line.slice(0, 3) === 'dir') {
    directories[currentDirectory].subDirectories.push(
      handleDirectoryName({ parent: currentDirectory, currentDirectory: line.slice(4) })
    )
  } else {
    const match = line.match(fileSizeRegex)
    if (!match) {
      throw new Error('Error reading filesize: ' + line)
    }
    directories[currentDirectory].totalImmediateFileSize += parseInt(match[1])
  }
}

interface Directories {
  [key: string]: {
    parentDirectory: string
    subDirectories: string[]
    totalImmediateFileSize: number
  }
}

const directories: Directories = {
  '/': {
    parentDirectory: '',
    subDirectories: [],
    totalImmediateFileSize: 0,
  },
}

let currentDirectory = '/'
lines.forEach(line => {
  if (isCommand(line)) {
    processCommand(line)
  } else {
    processInformation(line)
  }
})

const getDirectorySize = (directory: string): number => {
  return (
    directories[directory].totalImmediateFileSize +
    directories[directory].subDirectories.reduce((previousValue, currentValue) => {
      return previousValue + getDirectorySize(currentValue)
    }, 0)
  )
}

const currentDiskUsage = getDirectorySize('/')
const unusedSpace = TOTAL_DISK_SPACE - currentDiskUsage
const amountRequiredToBeDeleted = REQUIRED_DISK_SPACE - unusedSpace

let bestDirectoryToDelete = '/'
let bestDirectoryToDeleteExtraSpace = currentDiskUsage - amountRequiredToBeDeleted

Object.keys(directories).forEach(directory => {
  const size = getDirectorySize(directory)
  const difference = size - amountRequiredToBeDeleted
  if (difference > 0 && difference < bestDirectoryToDeleteExtraSpace) {
    bestDirectoryToDelete = directory
    bestDirectoryToDeleteExtraSpace = difference
  }
})

console.log(getDirectorySize(bestDirectoryToDelete))
