import * as React from 'react'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { useSwapFormStore } from '@/modules/Swap/stores/SwapFormStore'
import { SwapDirection } from '@/modules/Swap/types'
import { formattedTokenAmount } from '@/utils'

import './index.scss'


export function SwapPrice(): JSX.Element | null {
    const intl = useIntl()
    const formStore = useSwapFormStore()

    if (formStore.leftToken === undefined || formStore.rightToken === undefined) {
        return null
    }

    return (
        <div className="form-row swap-price">
            <div>
                <Observer>
                    {() => {
                        switch (true) {
                            case formStore.isCrossExchangeOnly:
                                return (
                                    <div
                                        className="btn btn-xs btn-secondary swap-price__exchange-mode-btn"
                                    >
                                        {intl.formatMessage({
                                            id: 'SWAP_PRICE_CROSS_EXCHANGE_MODE_ONLY_LABEL',
                                        })}
                                    </div>
                                )

                            case formStore.isCrossExchangeMode:
                                return (
                                    <Button
                                        size="xs"
                                        type="secondary"
                                        className="swap-price__exchange-mode-btn"
                                        disabled={formStore.isSwapping}
                                        onClick={formStore.toggleSwapExchangeMode}
                                    >
                                        {intl.formatMessage({
                                            id: 'SWAP_PRICE_DIRECT_EXCHANGE_MODE_LABEL',
                                        })}
                                    </Button>
                                )

                            case (formStore.isCrossExchangeAvailable && formStore.route !== undefined):
                                return (
                                    <Button
                                        size="xs"
                                        type="secondary"
                                        className="swap-price__exchange-mode-btn"
                                        disabled={formStore.isSwapping}
                                        onClick={formStore.toggleSwapExchangeMode}
                                    >
                                        {intl.formatMessage({
                                            id: !formStore.isEnoughLiquidity
                                                ? 'SWAP_PRICE_CROSS_EXCHANGE_AVAILABLE_LABEL'
                                                : 'SWAP_PRICE_CROSS_EXCHANGE_MODE_LABEL',
                                        })}
                                    </Button>
                                )

                            default:
                                return (
                                    <div
                                        className="btn btn-xs btn-secondary swap-price__exchange-mode-btn"
                                    >
                                        {intl.formatMessage({
                                            id: 'SWAP_PRICE_LABEL',
                                        })}
                                    </div>
                                )
                        }
                    }}
                </Observer>
            </div>
            <div className="swap-price-details">
                <Observer>
                    {() => {
                        const { isMultipleSwapMode, multipleSwap, nativeCoinSide } = formStore
                        const { isEnoughCoinBalance, isEnoughTokenBalance } = multipleSwap
                        const isCurrencyOnLeft = nativeCoinSide === 'leftToken'
                        const isCurrencyOnRight = nativeCoinSide === 'rightToken'
                        const leftSymbol = (
                            isCurrencyOnLeft
                            || (isMultipleSwapMode && !isEnoughTokenBalance && isEnoughCoinBalance)
                        )
                            ? formStore.coin.symbol
                            : formStore.leftToken?.symbol
                        const rightSymbol = isCurrencyOnRight
                            ? formStore.coin.symbol
                            : formStore.rightToken?.symbol

                        return formStore.priceDirection === SwapDirection.RTL ? (
                            <span
                                key={SwapDirection.RTL}
                                dangerouslySetInnerHTML={{
                                    __html: intl.formatMessage({
                                        id: 'SWAP_PRICE_RESULT',
                                    }, {
                                        value: formStore.priceLeftToRight !== undefined
                                            ? formattedTokenAmount(
                                                formStore.priceLeftToRight,
                                                formStore.leftToken?.decimals,
                                            )
                                            : '--',
                                        leftSymbol,
                                        rightSymbol,
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
                                        value: formStore.priceRightToLeft !== undefined
                                            ? formattedTokenAmount(
                                                formStore.priceRightToLeft,
                                                formStore.rightToken?.decimals,
                                            )
                                            : '--',
                                        leftSymbol: rightSymbol,
                                        rightSymbol: leftSymbol,
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
