export function abbreviateNumber(
    number: number,
    decimalPlaces = 2,
    units: string[] = ['K', 'M', 'B', 'T'],
    startsFrom: number = 1e3,
): string {
    const isNegative = number < 0

    // eslint-disable-next-line no-param-reassign
    number = Math.abs(number)

    let stringValue = String(number),
        unit: string | undefined

    if (number >= startsFrom) {
        const precisionScale = 10 ** decimalPlaces

        const len = units.length

        for (let i = len - 1; i >= 0; i--) {
            const size = 10 ** ((i + 1) * 3)

            if (size <= number) {
                // eslint-disable-next-line no-param-reassign
                number = Math.round((number * precisionScale) / size) / precisionScale

                if (number === startsFrom && i < len - 1) {
                    // eslint-disable-next-line no-param-reassign
                    number = 1
                    i += 1
                }

                stringValue = number.toFixed(decimalPlaces)
                unit = units[i]

                break
            }
        }
    }

    if (isNegative) {
        stringValue = `-${stringValue}`
    }

    return `${stringValue}${unit ?? ''}`
}
