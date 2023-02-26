const si = [
    // { s: 'K', v: 1E3 },
    // { s: 'M', v: 1E6 },
    // { s: 'B', v: 1E9 },
    { s: 'T', v: 1E12 },
    { s: 'P', v: 1E15 },
    { s: 'E', v: 1E18 },
]

/** @deprecated */
export function abbrNumber(value: number | string): [string, string] {
    const num = parseFloat(value.toString().replace(/[^0-9.]/g, ''))

    if (num < 1000) {
        return [num.toString(), '']
    }

    const index = si.findIndex(i => num >= i.v)

    if (index < 0) {
        return [num.toString(), '']
    }

    return [
        (num / si[index].v)
            .toFixed(2)
            .replace(/\.0+$|(\.[0-9]*[1-9])0+$/, '$1'),
        si[index].s,
    ]
}
