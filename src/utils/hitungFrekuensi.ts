export const hitungFrekuensi = <T>(arr: T[]): Record<string, number> => {
    const obj: { [key: string]: number } = {}

    for (const item of arr) {
        if (!(String(item) in obj)) {
            obj[String(item)] = 1
        } else {
            obj[String(item)] += 1
        }

    }

    return obj
}
