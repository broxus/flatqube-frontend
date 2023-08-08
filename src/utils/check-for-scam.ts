export function checkForScam(str: string): boolean {
    return /venom/gi.test(str.toLowerCase())
}
