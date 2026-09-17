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

export const hitungStatus = (arr: boolean[]): Record<string, number> => {
    const obj: { [key: string]: number } = {}

    for (const status of arr) {
        if (!(String(status) in obj)) {
            obj[String(status)] = 1
        } else {
            obj[String(status)] += 1
        }
    }

    return obj
}