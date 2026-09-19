export class Stack<T> {
    private items: T[] = [];

    push(item: T): void {
        this.items.push(item)
    }

    pop(): T | undefined {
        if (this.size === 0) {
            return undefined;
        }

        const item = this.items.pop();

        return item;
    }

    top(): T | undefined {
        if (this.size === 0) {
            return undefined;
        }

        return this.items[this.size - 1];
    }
    get size(): number { return this.items.length }
    get snapshot(): T[] { return [...this.items] }
}