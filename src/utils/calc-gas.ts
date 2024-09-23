import BigNumber from 'bignumber.js'

export function calcGas(fixedValue: string, dynamicGas: string): string {
    return BigNumber(fixedValue)
        .plus(BigNumber(dynamicGas).plus(100_000).times(1_000))
        .plus(1_000_000_000)
        .toFixed()
}
