import { ScamTokens } from '@/config'

const scamTokens = ScamTokens.map(item => item.toString().toLowerCase())

export function checkForScam(symbol?: string, root?: string): boolean {
    if (root && scamTokens.includes(root.toLowerCase())) {
        return true
    }

    if (symbol && /venom/gi.test(symbol.toLowerCase())) {
        return true
    }

    return false
}
