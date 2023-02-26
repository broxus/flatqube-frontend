import { BarPrice } from 'lightweight-charts'
import BigNumber from 'bignumber.js'

import { abbreviateNumber, formattedAmount } from '@/utils'

export function usdPriceFormatter(price: BarPrice): string {
    if (price < 1e-8 || price < 0) {
        return ''
    }
    if (price >= 1000) {
        const abbreviated = abbreviateNumber(price)
        const value = abbreviated.substring(0, abbreviated.length - 1)
        const unit = abbreviateNumber(price).slice(-1)
        return `$${formattedAmount(value)}${unit}`
    }
    return `$${formattedAmount(price, undefined, {
        precision: 1,
    })}`
}

export function inversePriceFormatter(price: BarPrice): string {
    // eslint-disable-next-line no-param-reassign
    const invertedPrice = 1 / price
    if (invertedPrice < 1e-8 || invertedPrice < 0) {
        return ''
    }
    if (invertedPrice >= 1000) {
        const abbreviated = abbreviateNumber(invertedPrice)
        const value = new BigNumber(abbreviated.substring(0, abbreviated.length - 1)).toFixed()
        const unit = abbreviated.slice(-1)
        return `${formattedAmount(value)}${unit}`
    }
    return `${formattedAmount(invertedPrice)}`
}

export function priceFormatter(price: BarPrice): string {
    if (price < 1e-8 || price < 0) {
        return ''
    }
    if (price >= 1000) {
        const abbreviated = abbreviateNumber(price)
        const value = abbreviated.substring(0, abbreviated.length - 1)
        const unit = abbreviated.slice(-1)
        return `${formattedAmount(value)}${unit}`
    }
    return `${formattedAmount(price)}`
}
