export class Sort<T> {
    private swap: boolean = false

    bubble(item: T[]) {
        const original = [...item]
        const sort = [...item]
        const n = sort.length

        for (let i = 0; i < n - 1; i++) {
            this.swap = false
            for (let j = 0; j < n - 1 - i; j++) {
                if (sort[j] > sort[j + 1]) {
                    let temp = sort[j]
                    sort[j] = sort[j + 1]
                    sort[j + 1] = temp
                    this.swap = true
                }
            }
            if (!this.swap) break
        }

        return { original: original, sorted: sort }
    }
}