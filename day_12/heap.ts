/**
 * There is no heap in the JS STD, implement my own
 */
class HeapEntry<T> {
  priority: number
  value: T
  constructor(priority: number, value: T) {
    this.priority = priority
    this.value = value
  }
}

class MinHeap<T> {
  heap: HeapEntry<T>[] = []
  constructor() {}

  get length() {
    return this.heap.length
  }

  add(priority: number, value: T) {
    const newEntry = new HeapEntry(priority, value)
    this.heap.push(newEntry)
    this.trickleUp(this.heap.length - 1)
  }

  remove() {
    if (!this.heap.length) {
      throw new Error('Heap is empty')
    }
    const valueToReturn = this.heap[0]
    this.heap[0] = this.heap[this.heap.length - 1]
    this.heap.pop()
    this.trickleDown(0)
    return valueToReturn.value
  }

  private trickleUp(index: number) {
    const parentIndex = Math.floor((index - 1) / 2)
    if (index > 0 && this.heap[index].priority < this.heap[parentIndex].priority) {
      const temp = this.heap[parentIndex]
      this.heap[parentIndex] = this.heap[index]
      this.heap[index] = temp
      this.trickleUp(parentIndex)
    }
  }

  private trickleDown(index: number, lastIndexArg?: number) {
    const leftChildIndex = index * 2 + 1
    const rightChildIndex = leftChildIndex + 1
    const lastIndex = lastIndexArg || this.heap.length - 1

    if (leftChildIndex < lastIndex) {
      let smallIndex = rightChildIndex
      if (rightChildIndex < lastIndex) {
        if (this.heap[leftChildIndex].priority < this.heap[rightChildIndex].priority) {
          smallIndex = leftChildIndex
        }
      }
      if (this.heap[smallIndex].priority < this.heap[index].priority) {
        const temp = this.heap[smallIndex]
        this.heap[smallIndex] = this.heap[index]
        this.heap[index] = temp
        this.trickleDown(smallIndex, lastIndex)
      }
    }
  }
}

export default MinHeap
