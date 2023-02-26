import * as React from 'react'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { useSwapFormStoreContext } from '@/modules/Swap/context'
import { SwapDirection } from '@/modules/Swap/types'
import { formattedTokenAmount, stripHtmlTags } from '@/utils'

import './index.scss'


export function SwapPrice(): JSX.Element | null {
    const intl = useIntl()
    const formStore = useSwapFormStoreContext()

    if (formStore.leftToken === undefined || formStore.rightToken === undefined) {
        return null
    }

    return (
        <div className="form-row swap-price">
            <div />
            <div className="swap-price-details">
                <Observer>
                    {() => {
                        const { coinSide, priceDirection } = formStore
                        const isCurrencyOnLeft = coinSide === 'leftToken'
                        const isCurrencyOnRight = coinSide === 'rightToken'
                        const leftSymbol = isCurrencyOnLeft
                            ? formStore.wallet.coin.symbol
                            : formStore.leftToken?.symbol
                        const rightSymbol = isCurrencyOnRight
                            ? formStore.wallet.coin.symbol
                            : formStore.rightToken?.symbol

                        return priceDirection === SwapDirection.RTL ? (
                            <span
                                key={SwapDirection.RTL}
                                dangerouslySetInnerHTML={{
                                    __html: intl.formatMessage({
                                        id: 'SWAP_PRICE_RESULT',
                                    }, {
                                        leftSymbol: stripHtmlTags(leftSymbol ?? ''),
                                        rightSymbol: stripHtmlTags(rightSymbol ?? ''),
                                        value: formattedTokenAmount(formStore.ltrPrice),
                                    }, {
                                        ignoreTag: true,
                                    }),
                                }}
                            />
                        ) : (
                            <span
                                key={SwapDirection.LTR}
                                dangerouslySetInnerHTML={{
                                    __html: intl.formatMessage({
                                        id: 'SWAP_PRICE_RESULT',
                                    }, {
                                        leftSymbol: stripHtmlTags(rightSymbol ?? ''),
                                        rightSymbol: stripHtmlTags(leftSymbol ?? ''),
                                        value: formattedTokenAmount(formStore.rtlPrice),
                                    }, {
                                        ignoreTag: true,
                                    }),
                                }}
                            />
                        )
                    }}
                </Observer>
                <Button
                    size="xs"
                    className="swap-price__reverse-btn"
                    onClick={formStore.togglePriceDirection}
                >
                    <Icon icon="reverseHorizontal" />
                </Button>
            </div>
        </div>
    )
}
