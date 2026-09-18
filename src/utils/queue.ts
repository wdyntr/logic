export class Queue<T> {
  private items: T[] = [];
  private headIndex: number = 0;

  enqueue(item: T): void {
    this.items.push(item);
  }

  dequeue(): T | undefined {
    if (this.size === 0) {
      return undefined;
    }

    const item = this.items[this.headIndex];
    this.headIndex++;

    return item;
  }

  peek(): T | undefined {
    if (this.size === 0) {
      return undefined;
    }

    return this.items[this.headIndex];
  }

  get size(): number {
    return this.items.length - this.headIndex;
  }

  get index(): number{
    return this.headIndex
  }
}