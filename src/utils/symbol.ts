export const concatSymbols = (left?: string | null, right?: string | null, symbol = '/'): string => {
    if (left && right) {
        return `${left}${symbol}${right}`
    }

    return left || right || ''
}
