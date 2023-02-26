const r = Math.round

function toRGBA(input: string): number[] {
    const l = input.length
    const rgba: number[] = []
    if (input.slice(0, 3).toLowerCase() === 'rgb') {
        // eslint-disable-next-line no-param-reassign
        const d = input.replace(' ', '').split(',')
        rgba[0] = parseInt(d[0].slice(d[3].toLowerCase() === 'a' ? 5 : 4), 10)
        rgba[1] = parseInt(d[1], 10)
        rgba[2] = parseInt(d[2], 10)
        rgba[3] = d[3] ? parseFloat(d[3]) : -1
    }
    else {
        let d: number
        if (l < 6) {
            d = parseInt(String(input[1]) + input[1] + input[2] + input[2] + input[3] + input[3] + (l > 4 ? String(input[4]) + input[4] : ''), 16)
        }
        else {
            d = parseInt(input.slice(1), 16)
        }
        // eslint-disable-next-line no-bitwise
        rgba[0] = (d >> 16) & 255
        // eslint-disable-next-line no-bitwise
        rgba[1] = (d >> 8) & 255
        // eslint-disable-next-line no-bitwise
        rgba[2] = d & 255
        // eslint-disable-next-line no-bitwise
        rgba[3] = l === 9 || l === 5 ? r((((d >> 24) & 255) / 255) * 10000) / 10000 : -1
    }
    return rgba
}

export function blend(from: string, to: string, p: number = 0.5): string {
    // eslint-disable-next-line no-param-reassign
    from = from.trim()
    // eslint-disable-next-line no-param-reassign
    to = to.trim()
    const b = p < 0
    // eslint-disable-next-line no-param-reassign
    p = b ? p * -1 : p
    const f = toRGBA(from)
    const t = toRGBA(to)
    if (to[0] === 'r') {
        return `rgb${to[3] === 'a' ? 'a(' : '('
        }${r(((t[0] - f[0]) * p) + f[0])},${
            r(((t[1] - f[1]) * p) + f[1])},${
            r(((t[2] - f[2]) * p) + f[2])
        }${f[3] < 0 && t[3] < 0 ? '' : `,${
            // eslint-disable-next-line no-nested-ternary
            f[3] > -1 && t[3] > -1
                ? r((((t[3] - f[3]) * p) + f[3]) * 10000) / 10000
                : t[3] < 0 ? f[3] : t[3]}`})`
    }

    return `#${(0x100000000 + ((
        // eslint-disable-next-line no-nested-ternary
        f[3] > -1 && t[3] > -1
            ? r((((t[3] - f[3]) * p) + f[3]) * 255)
            // eslint-disable-next-line no-nested-ternary
            : t[3] > -1 ? r(t[3] * 255) : f[3] > -1 ? r(f[3] * 255) : 255
    ) * 0x1000000)
        + (r(((t[0] - f[0]) * p) + f[0]) * 0x10000)
        + (r(((t[1] - f[1]) * p) + f[1]) * 0x100)
        + r(((t[2] - f[2]) * p) + f[2])
    ).toString(16).slice(f[3] > -1 || t[3] > -1 ? 1 : 3)}`
}
