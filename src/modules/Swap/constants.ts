import type { SwapTransactionReceipt } from '@/modules/Swap/types'

export const COMBINED_URL_PARAM = 'combined'

export const COIN_URL_PARAM = 'coin'

export const DEFAULT_DECIMALS = 18

export const DEFAULT_SLIPPAGE_VALUE = '0.5'

export const RECEIPTS = new Map<string, SwapTransactionReceipt>()
