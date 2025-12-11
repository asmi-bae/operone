/**
 * Priority Queue implementation for task scheduling
 * Uses a min-heap for efficient priority-based dequeuing
 */

export interface PriorityQueueItem<T> {
  item: T;
  priority: number;
}

export class PriorityQueue<T> {
  private heap: PriorityQueueItem<T>[] = [];

  /**
   * Add an item to the queue with a given priority
   * Lower priority numbers are dequeued first (min-heap)
   */
  enqueue(item: T, priority: number): void {
    this.heap.push({ item, priority });
    this.bubbleUp(this.heap.length - 1);
  }

  /**
   * Remove and return the highest priority item (lowest priority number)
   */
  dequeue(): T | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop()!.item;

    const result = this.heap[0]!.item;
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return result;
  }

  /**
   * View the highest priority item without removing it
   */
  peek(): T | undefined {
    return this.heap[0]?.item;
  }

  /**
   * Get the current size of the queue
   */
  get size(): number {
    return this.heap.length;
  }

  /**
   * Check if the queue is empty
   */
  get isEmpty(): boolean {
    return this.heap.length === 0;
  }

  /**
   * Clear all items from the queue
   */
  clear(): void {
    this.heap = [];
  }

  /**
   * Convert queue to array (sorted by priority)
   */
  toArray(): T[] {
    return [...this.heap]
      .sort((a, b) => a.priority - b.priority)
      .map(item => item.item);
  }

  /**
   * Bubble up an item to maintain heap property
   */
  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      
      if (this.heap[index]!.priority >= this.heap[parentIndex]!.priority) {
        break;
      }

      [this.heap[index], this.heap[parentIndex]] = 
        [this.heap[parentIndex]!, this.heap[index]!];
      
      index = parentIndex;
    }
  }

  /**
   * Bubble down an item to maintain heap property
   */
  private bubbleDown(index: number): void {
    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let smallest = index;

      if (
        leftChild < this.heap.length &&
        this.heap[leftChild]!.priority < this.heap[smallest]!.priority
      ) {
        smallest = leftChild;
      }

      if (
        rightChild < this.heap.length &&
        this.heap[rightChild]!.priority < this.heap[smallest]!.priority
      ) {
        smallest = rightChild;
      }

      if (smallest === index) break;

      [this.heap[index], this.heap[smallest]] = 
        [this.heap[smallest]!, this.heap[index]!];
      
      index = smallest;
    }
  }
}
