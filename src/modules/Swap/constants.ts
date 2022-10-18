import type { Subscriber } from 'everscale-inpage-provider'

import type { SwapBill, SwapTransactionReceipt } from '@/modules/Swap/types'


export const DEFAULT_DECIMALS = 18

export const DEFAULT_SLIPPAGE_VALUE = '0.5'

export const DEFAULT_SWAP_BILL: SwapBill = {
    amount: undefined,
    expectedAmount: undefined,
    fee: undefined,
    minExpectedAmount: undefined,
    priceImpact: undefined,
}

export const SUBSCRIBERS = new Map<string, Subscriber>()

export const RECEIPTS = new Map<string, SwapTransactionReceipt>()
