import { getUserAgent } from '@broxus/js-utils'
import { isEverWalletBrowser, isSparXWalletBrowser } from '@broxus/tvm-connect/lib'

export const isWebkit = /\b(iPad|iPhone|iPod)\b/g.test(getUserAgent())
    || /WebKit/g.test(getUserAgent())
    // @ts-ignore
    || (!/Edge/g.test(getUserAgent()) && !window.MSStream)

export const isEverWallet = isEverWalletBrowser(getUserAgent())

export const isSparXWallet = isSparXWalletBrowser(getUserAgent())
