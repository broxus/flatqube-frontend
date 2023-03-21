import BigNumber from 'bignumber.js'

export function calcGas(fixedValue: string, dynamicGas: string): string {
    return new BigNumber(fixedValue).plus(new BigNumber(dynamicGas).plus(100000).times(1000)).toFixed()
}
