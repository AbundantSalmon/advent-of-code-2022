const inputText = Deno.readTextFileSync('./input.txt')
const lines = inputText.split('\n')

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

// Probably could have dynamically stored the full directory size instead of
// recalculating every time, but dataset is small and wasn't sure whether
// intermediate sizes might be necessary for part 2
const getDirectorySize = (directory: string): number => {
  return (
    directories[directory].totalImmediateFileSize +
    directories[directory].subDirectories.reduce((previousValue, currentValue) => {
      return previousValue + getDirectorySize(currentValue)
    }, 0)
  )
}

const total = Object.keys(directories).reduce((previousValue, currentValue) => {
  const size = getDirectorySize(currentValue)
  if (size <= 100000) {
    return previousValue + size
  }
  return previousValue
}, 0)

console.log(total)
