export const hitungFrekuensi = <T>(arr: T[]): Record<string, number> => {
    const obj: { [key: string]: number } = {}

    for (const item of arr) {
        const key = String(item)
        obj[key] = (obj[key] || 0) + 1
    }

    return obj
}
