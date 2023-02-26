import BigNumber from 'bignumber.js'

import type { CrossSwapStepResponse } from '@/modules/Swap/types'


export function calcExchangePricesRates(
    value: BigNumber.Value,
    dividedBy: BigNumber.Value,
    decimals: number,
): string {
    return new BigNumber(value)
        .div(dividedBy)
        .shiftedBy(decimals)
        .dp(0, BigNumber.ROUND_DOWN)
        .toFixed()
}


export function getSlippageMinExpectedAmount(value: BigNumber.Value, slippage: string): string {
    return new BigNumber(value).div(100)
        .times(new BigNumber(100).minus(slippage))
        .dp(0, BigNumber.ROUND_DOWN)
        .toFixed()
}

export function calcCrossExchangeSlippage(value: BigNumber.Value, stepsCounts: number): string {
    return new BigNumber(100)
        .plus(value)
        .div(100)
        .exponentiatedBy(stepsCounts)
        .minus(1)
        .times(100)
        .toFixed()
}

export function getReducedCrossExchangeFee(iteratee: CrossSwapStepResponse[]): string {
    const fee = iteratee.reduceRight(
        (acc, step, idx, steps) => (
            acc.plus(step.fee)
                .times((steps[idx - 1]?.spentAmount) || 1)
                .div((steps[idx - 1]?.expectedReceiveAmount) || 1)
        ),
        new BigNumber(0),
    )
    return fee.dp(0, BigNumber.ROUND_DOWN).toFixed()
}
