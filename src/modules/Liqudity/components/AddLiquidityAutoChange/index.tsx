import * as React from 'react'
import BigNumber from 'bignumber.js'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { useAddLiquidityFormStoreContext } from '@/modules/Liqudity/context'
import { stripHtmlTags } from '@/utils'

import './index.scss'


export function AddLiquidityAutoChange(): JSX.Element {
    const intl = useIntl()

    const formStore = useAddLiquidityFormStoreContext()

    const onChange = async () => {
        await formStore.toggleAutoExchange()
    }

    return (
        <Observer>
            {() => {
                const rightAmount = new BigNumber(formStore.rightPrice ?? 0)
                    .times(formStore.leftAmount || 0)
                    .dp(formStore.rightDecimals ?? 0, BigNumber.ROUND_DOWN)

                let leftSymbol = formStore.leftToken?.symbol ?? formStore.pool?.left.symbol ?? '',
                    rightSymbol = formStore.rightToken?.symbol ?? formStore.pool?.right.symbol ?? ''

                if (rightAmount.lt(formStore.rightAmount || 0)) {
                    leftSymbol = formStore.rightToken?.symbol ?? formStore.pool?.right.symbol ?? ''
                    rightSymbol = formStore.leftToken?.symbol ?? formStore.pool?.left.symbol ?? ''
                }

                return (
                    <div className="add-liquidity-auto-change">
                        <div className="add-liquidity-auto-change__wrap">
                            <label className="pool-switcher switcher">
                                <input
                                    type="checkbox"
                                    checked={formStore.isAutoExchangeEnabled}
                                    onChange={onChange}
                                />
                                <span className="switcher__handle" />
                            </label>
                            <div className="add-liquidity-auto-change__inner">
                                <div className="add-liquidity-auto-change__title">
                                    {intl.formatMessage({ id: 'LIQUIDITY_ADD_AUTO_CHANGE_TITLE' })}
                                </div>
                                <div
                                    className="add-liquidity-auto-change__note"
                                    dangerouslySetInnerHTML={{
                                        __html: intl.formatMessage({
                                            id: 'LIQUIDITY_ADD_AUTO_CHANGE_NOTE',
                                        }, {
                                            leftSymbol: stripHtmlTags(leftSymbol),
                                            rightSymbol: stripHtmlTags(rightSymbol),
                                        }, { ignoreTag: true }),
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )
            }}
        </Observer>
    )
}
