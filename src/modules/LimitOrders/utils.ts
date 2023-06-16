/* eslint-disable sort-keys */
import BigNumber from 'bignumber.js'
import { Subscriber } from 'everscale-inpage-provider'

import { debug, error } from '@/utils'
import {
    LimitOrderBookItem, LimitOrderState, OrderBookData, OrderViewMode,
} from '@/modules/LimitOrders/types'
import { Token } from '@/misc'
import { useStaticRpc } from '@/hooks'

import { SwapDirection } from '../Swap/types'

export function convertOrderViewFilterToStates(
    type: OrderViewMode,
    // onlyActiveOrders: boolean,
): LimitOrderState[] | undefined {
    switch (type) {
        case OrderViewMode.OPEN_ORDERS:
        case OrderViewMode.MY_OPEN_ORDERS:
            return [LimitOrderState.ACTIVE]
        default:
            return undefined
    }

}

export const calcRate = (
    currentSpentAmount?: string,
    spentTokenDecimals?: number,
    currentReceiveAmount?: string,
    receiveTokenDecimals?: number,
): BigNumber => new BigNumber(currentSpentAmount ?? '')
    .dividedBy(new BigNumber(currentReceiveAmount ?? ''))
    .shiftedBy(1 * (receiveTokenDecimals || 0))
    .shiftedBy(-1 * (spentTokenDecimals || 0))

export function prepareData(dataFromBack: LimitOrderBookItem[], leftToken: Token, rightToken: Token): OrderBookData[] {
    const tokens = {
        [leftToken.root]: leftToken,
        [rightToken.root]: rightToken,
    }

    const resultData = dataFromBack
        .sort((a, b) => +a.rate - +b.rate)
        .reduce<any[]>((acc, elem, i) => {
            const duplcicateRate = acc?.[i - 1]?.rate === elem?.rate
            const newElem: any = duplcicateRate
                ? { ...acc?.[i - 1] }
                : { ...elem }
            if (elem.spentTokenRoot === leftToken.root) {
                newElem.askReceiveSymbol = tokens[elem.receiveTokenRoot]?.symbol
                newElem.askSpentSymbol = tokens[elem.spentTokenRoot]?.symbol
                newElem.askSize = new BigNumber(newElem.sumCurrentSpentAmount)
                    .shiftedBy(-1 * (tokens[elem.spentTokenRoot]?.decimals || 0))
                    .toFixed()
                newElem.askCost = new BigNumber(newElem.sumCurrentReceiveAmount)
                    .shiftedBy(-1 * (tokens[elem.receiveTokenRoot]?.decimals || 0))
                    .toFixed()
            }
            else {
                newElem.bidSpentSymbol = tokens[elem.receiveTokenRoot]?.symbol
                newElem.bidReceiveSymbol = tokens[elem.spentTokenRoot]?.symbol
                newElem.bidSize = new BigNumber(newElem.sumCurrentReceiveAmount)
                    .shiftedBy(-1 * (tokens[elem.receiveTokenRoot]?.decimals || 0))
                    .toFixed()
                newElem.bidCost = new BigNumber(newElem.sumCurrentSpentAmount)
                    .shiftedBy(-1 * (tokens[elem.spentTokenRoot]?.decimals || 0))
                    .toFixed()
            }
            if (duplcicateRate) {
                acc[i - 1] = newElem
            }
            else {
                acc.push(newElem)
            }
            return acc
        }, [])
    let totalAskSize = 0,
        totalBidSize = 0,
        totalAskCost = 0,
        totalBidCost = 0

    for (let index = 0; index < resultData.length; index++) {
        const indexFromEnd = resultData.length - index - 1
        if (resultData[index]?.askSize) {
            resultData[index].askSize = new BigNumber(resultData[index].askSize)
                .plus(new BigNumber(totalAskSize))
                .toFixed()
            totalAskSize = resultData[index].askSize
            resultData[index].askCost = new BigNumber(resultData[index].askCost)
                .plus(new BigNumber(totalAskCost))
                .toFixed()
            totalAskCost = resultData[index].askCost
        }
        if (resultData[indexFromEnd]?.bidSize) {
            resultData[indexFromEnd].bidSize = new BigNumber(resultData[indexFromEnd].bidSize)
                .plus(new BigNumber(totalBidSize))
                .toFixed()
            totalBidSize = resultData[indexFromEnd].bidSize
            resultData[indexFromEnd].bidCost = new BigNumber(resultData[indexFromEnd].bidCost)
                .plus(new BigNumber(totalBidCost))
                .toFixed()
            totalBidCost = resultData[indexFromEnd].bidCost
        }

    }
    return resultData
}

const staticRpc = useStaticRpc()
const SUBSCRIBERS = new Map<string, Subscriber>()

export function createTransactionSubscriber(key: string): Subscriber {
    const subscriber = new staticRpc.Subscriber()
    SUBSCRIBERS.set(key, subscriber)
    return subscriber
}

export async function unsubscribeTransactionSubscriber(key: string): Promise<void> {
    if (SUBSCRIBERS.has(key)) {
        try {
            await SUBSCRIBERS.get(key)?.unsubscribe()
            debug(`Unsubscribe stream ${key}`)
        }
        catch (e) {
            error('Transaction unsubscribe error', e)
        }

        SUBSCRIBERS.delete(key)
    }
}

export function calcSwapDirection(isInverse: boolean, currentDirection?: SwapDirection): SwapDirection | undefined {
    // eslint-disable-next-line no-nested-ternary
    return isInverse
        ? currentDirection === SwapDirection.LTR ? SwapDirection.RTL : SwapDirection.LTR
        : currentDirection
}
