export function isAddressValid(value?: string, allowMasterChain: boolean = false): boolean {
    if (value === undefined) {
        return false
    }

    if (allowMasterChain) {
        return /^(?:0|-1)[:][0-9a-fA-F]{64}$/.test(value)
    }
    return /^[0][:][0-9a-fA-F]{64}$/.test(value)
}
