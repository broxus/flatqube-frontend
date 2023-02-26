export function hexToRgba(hex: string, opacity: number = 100): string {
    let r: number = 0,
        g: number = 0,
        b: number = 0

    // eslint-disable-next-line no-param-reassign
    hex = hex.replace('#', '')
    // eslint-disable-next-line no-param-reassign,no-nested-ternary
    opacity = opacity > 100 ? 100 : (opacity < 0 ? 0 : opacity)

    if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16)
        g = parseInt(hex.substring(2, 4), 16)
        b = parseInt(hex.substring(4, 6), 16)
    }
    else if (hex.length === 3) {
        r = parseInt(hex.substring(0, 1), 16)
        g = parseInt(hex.substring(1, 2), 16)
        b = parseInt(hex.substring(2, 3), 16)
    }

    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`
}
