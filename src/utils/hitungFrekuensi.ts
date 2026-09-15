export const hitungFrekuensi = (arr: string[]): Record<string, number> => {
    const obj: { [key: string]: number } = {}

    for (const nama of arr) {
        if (!(nama in obj)) {
            obj[nama] = 1
        } else {
            obj[nama] += 1
        }

    }

    return obj
}