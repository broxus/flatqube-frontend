import { USDTRootAddress, WEVERRootAddress } from '@/config'
import { SwapBill } from '@/modules/Swap/types'


/* WEVER root address */
export const DEFAULT_LEFT_TOKEN_ROOT = WEVERRootAddress.toString()

/* USDT root address */
export const DEFAULT_RIGHT_TOKEN_ROOT = USDTRootAddress.toString()

export const DEFAULT_DECIMALS = 18

export const DEFAULT_SLIPPAGE_VALUE = '0.5'

export const DEFAULT_SWAP_BILL: SwapBill = {
    amount: undefined,
    expectedAmount: undefined,
    fee: undefined,
    minExpectedAmount: undefined,
    priceImpact: undefined,
}
