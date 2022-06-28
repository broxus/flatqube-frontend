import BigNumber from 'bignumber.js'
import {
    Address,
    Contract,
    DecodedAbiFunctionInputs,
    DecodedAbiFunctionOutputs,
    FullContractState,
    Transaction,
} from 'everscale-inpage-provider'
import { toJS } from 'mobx'

import { useStaticRpc } from '@/hooks/useStaticRpc'
import { DexAbi, PairType } from '@/misc'
import { SwapRouteResult, SwapRouteStep } from '@/modules/Swap/types'
import { error } from '@/utils'

const staticRpc = useStaticRpc()


export function fillStepResult(
    result: SwapRouteResult,
    transaction: Transaction,
    src?: Address,
    amount?: SwapRouteResult['amount'],
    status?: SwapRouteResult['status'],
    input?: DecodedAbiFunctionInputs<typeof DexAbi.Callbacks, 'dexPairExchangeSuccess'>,
): SwapRouteResult {
    if (
        result.step.pair.address?.toString() === src?.toString()
        && result.status === undefined
    ) {
        return {
            ...result,
            amount,
            input,
            status,
            transaction,
        }
    }
    return result
}

export async function getExpectedExchange(
    pairContract: Contract<typeof DexAbi.Pair>,
    amount: string,
    spentTokenAddress: Address,
    pairContractState?: FullContractState,
): Promise<DecodedAbiFunctionOutputs<typeof DexAbi.Pair, 'expectedExchange'>> {
    return pairContract.methods.expectedExchange({
        answerId: 0,
        amount,
        spent_token_root: spentTokenAddress,
    }).call({
        cachedState: pairContractState,
    })
}

export async function getExpectedSpendAmount(
    pairContract: Contract<typeof DexAbi.Pair>,
    receiveAmount: string,
    receiveTokenRoot: Address,
    pairContractState?: FullContractState,
): Promise<DecodedAbiFunctionOutputs<typeof DexAbi.Pair, 'expectedSpendAmount'>> {
    return pairContract.methods.expectedSpendAmount({
        answerId: 0,
        receive_amount: receiveAmount,
        receive_token_root: receiveTokenRoot,
    }).call({
        cachedState: pairContractState,
    })
}

export function getDefaultPerPrice(
    value: BigNumber,
    dividedBy: BigNumber,
    decimals: number,
): BigNumber {
    return value
        .div(dividedBy)
        .dp(decimals, BigNumber.ROUND_UP)
        .shiftedBy(decimals)
}

export function getExchangePerPrice(
    value: BigNumber,
    dividedBy: BigNumber,
    decimals: number,
): BigNumber {
    return value
        .div(dividedBy)
        .shiftedBy(decimals)
        .dp(0, BigNumber.ROUND_DOWN)
}

export function getDirectExchangePriceImpact(start: BigNumber, end: BigNumber): BigNumber {
    return new BigNumber(end.minus(start))
        .div(start)
        .abs()
        .times(100)
        .dp(2, BigNumber.ROUND_UP)
}

export function getSlippageMinExpectedAmount(
    amount: BigNumber,
    slippage: string,
): BigNumber {
    return amount
        .div(100)
        .times(new BigNumber(100).minus(slippage))
        .dp(0, BigNumber.ROUND_DOWN)
}

export function getCrossExchangeSlippage(value: string, stepsCounts: number): string {
    return new BigNumber(100)
        .plus(value)
        .div(100)
        .exponentiatedBy(stepsCounts)
        .minus(1)
        .times(100)
        .toFixed()
}

export function getReducedCrossExchangeFee(iteratee: SwapRouteStep[]): BigNumber {
    const fee = iteratee.reduceRight(
        (acc, step, idx, steps) => (
            acc
                .plus(step.fee)
                .times((steps[idx - 1]?.amount) || 1)
                .div((steps[idx - 1]?.expectedAmount) || 1)
        ),
        new BigNumber(0),
    )
    return fee.dp(0, BigNumber.ROUND_DOWN)
}

export function getCrossExchangePriceImpact(steps: SwapRouteStep[], initialLeftRoot: string): BigNumber {
    const reduced = steps.reduce<{
        leftRoot: string | undefined,
        value: BigNumber,
    }>((acc, step) => {
        const isInverted = step.pair.roots?.left.toString() !== acc.leftRoot

        const leftDecimals = isInverted
            ? -(step.pair.decimals?.right ?? 0)
            : -(step.pair.decimals?.left ?? 0)

        const rightDecimals = isInverted
            ? -(step.pair.decimals?.left ?? 0)
            : -(step.pair.decimals?.right ?? 0)

        const pairLeftBalanceNumber = isInverted
            ? new BigNumber(step.pair.balances?.right || 0).shiftedBy(-(step.pair.decimals?.right ?? 0))
            : new BigNumber(step.pair.balances?.left || 0).shiftedBy(-(step.pair.decimals?.left ?? 0))

        const pairRightBalanceNumber = isInverted
            ? new BigNumber(step.pair.balances?.left || 0).shiftedBy(-(step.pair.decimals?.left ?? 0))
            : new BigNumber(step.pair.balances?.right || 0).shiftedBy(-(step.pair.decimals?.right ?? 0))

        const expectedLeftPairBalanceNumber = pairLeftBalanceNumber.plus(
            new BigNumber(step.amount).minus(
                new BigNumber(step.fee)
                    .times(step.pair.feeParams?.beneficiaryNumerator ?? 0)
                    .div(
                        new BigNumber(step.pair.feeParams?.numerator ?? 0)
                            .plus(step.pair.feeParams?.beneficiaryNumerator ?? 0),
                    ),
            ).shiftedBy(leftDecimals),
        )
        const expectedRightPairBalanceNumber = pairRightBalanceNumber.minus(
            new BigNumber(step.expectedAmount).shiftedBy(rightDecimals),
        )

        const start = pairRightBalanceNumber.div(pairLeftBalanceNumber)
        const end = expectedRightPairBalanceNumber.div(expectedLeftPairBalanceNumber)

        return {
            leftRoot: isInverted ? step.pair.roots?.left.toString() : step.pair.roots?.right.toString(),
            value: acc.value.times(
                new BigNumber(1).minus(end.minus(start).div(start).abs()),
            ),
        }
    }, {
        leftRoot: initialLeftRoot,
        value: new BigNumber(1),
    })

    return new BigNumber(1).minus(reduced.value).times(100).dp(2, BigNumber.ROUND_DOWN)
}

export async function getCrossExchangeStablePriceImpact(
    steps: SwapRouteStep[],
    initialLeftRoot: string,
): Promise<BigNumber> {
    let value = new BigNumber(1),
        leftRoot = initialLeftRoot

    // eslint-disable-next-line no-restricted-syntax
    for (const step of steps) {
        if (step.pair.address === undefined) {
            break
        }
        const isInverted = step.pair.roots?.left.toString() !== leftRoot

        let { type } = step.pair

        if (type === undefined) {
            type = (await step.pair.contract?.methods.getPoolType({
                answerId: 0,
            }).call({
                cachedState: toJS(step.pair.state),
            }))?.value0 as PairType
        }

        if (type === PairType.CONSTANT_PRODUCT) {
            const leftDecimals = isInverted
                ? -(step.pair.decimals?.right ?? 0)
                : -(step.pair.decimals?.left ?? 0)

            const rightDecimals = isInverted
                ? -(step.pair.decimals?.left ?? 0)
                : -(step.pair.decimals?.right ?? 0)

            const pairLeftBalanceNumber = isInverted
                ? new BigNumber(step.pair.balances?.right || 0).shiftedBy(-(step.pair.decimals?.right ?? 0))
                : new BigNumber(step.pair.balances?.left || 0).shiftedBy(-(step.pair.decimals?.left ?? 0))

            const pairRightBalanceNumber = isInverted
                ? new BigNumber(step.pair.balances?.left || 0).shiftedBy(-(step.pair.decimals?.left ?? 0))
                : new BigNumber(step.pair.balances?.right || 0).shiftedBy(-(step.pair.decimals?.right ?? 0))

            const expectedLeftPairBalanceNumber = pairLeftBalanceNumber.plus(
                new BigNumber(step.amount).minus(
                    new BigNumber(step.fee)
                        .times(step.pair.feeParams?.beneficiaryNumerator ?? 0)
                        .div(
                            new BigNumber(step.pair.feeParams?.numerator ?? 0)
                                .plus(step.pair.feeParams?.beneficiaryNumerator ?? 0),
                        ),
                ).shiftedBy(leftDecimals),
            )
            const expectedRightPairBalanceNumber = pairRightBalanceNumber.minus(
                new BigNumber(step.expectedAmount).shiftedBy(rightDecimals),
            )

            const start = pairRightBalanceNumber.div(pairLeftBalanceNumber)
            const end = expectedRightPairBalanceNumber.div(expectedLeftPairBalanceNumber)

            leftRoot = (isInverted ? step.pair.roots?.left.toString() : step.pair.roots?.right.toString()) as string
            value = value.times(new BigNumber(1).minus(end.minus(start).div(start).abs()))
        }

        if (type === PairType.STABLESWAP) {
            const contract = new staticRpc.Contract(DexAbi.StablePair, step.pair.address)
            const params = {
                amount: step.amount,
                // todo do something with this => root is key
                price_amount: new BigNumber(1).shiftedBy(
                    (isInverted
                        ? step.pair.decimals?.right
                        : step.pair.decimals?.left) ?? 0,
                ).toFixed(),
                spent_token_root: new Address(leftRoot),
            }
            let currentValue: string | null = '0'
            try {
                currentValue = (await contract.methods.getPriceImpact(params).call({
                    cachedState: toJS(step.pair.state),
                })).value0
            }
            catch (e) {
                error('Get price impact error', e)
            }
            const currentValueNumber = new BigNumber(currentValue ?? 0).abs()

            value = value.times(new BigNumber(1).minus(currentValueNumber.shiftedBy(-20)))
            leftRoot = (isInverted ? step.pair.roots?.left.toString() : step.pair.roots?.right.toString()) as string
        }
    }

    return new BigNumber(1).minus(value).times(100).dp(2, BigNumber.ROUND_DOWN)
}
