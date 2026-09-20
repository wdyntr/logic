export class Sort<T> {
    bubble(item: T[]) {
        const original = [...item]
        const sorted = [...item]
        const n = sorted.length

        for (let i = 0; i < n - 1; i++) {
            let swapped = false
            for (let j = 0; j < n - 1 - i; j++) {
                if (sorted[j] > sorted[j + 1]) {
                    let temp = sorted[j]
                    sorted[j] = sorted[j + 1]
                    sorted[j + 1] = temp
                    swapped = true
                }
            }
            if (!swapped) break
        }

        return { original, sorted }
    }

    selection(item: T[]) {
        const original = [...item]
        const sorted = [...item]

        for (let i = 0; i < sorted.length - 1; i++) {
            let minIndex = i
            for (let j = i + 1; j < sorted.length; j++) {
                if (sorted[j] < sorted[minIndex]) {
                    minIndex = j
                }
            }

            if (minIndex !== i) {
                let temp = sorted[i]
                sorted[i] = sorted[minIndex]
                sorted[minIndex] = temp
            }
        }

        return { original, sorted }
    }
}