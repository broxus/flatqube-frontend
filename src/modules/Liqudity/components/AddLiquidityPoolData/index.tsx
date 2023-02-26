import * as React from 'react'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Placeholder } from '@/components/common/Placeholder'
import { useAddLiquidityFormStoreContext } from '@/modules/Liqudity/context'
import { formattedTokenAmount } from '@/utils'


export function AddLiquidityPoolData(): JSX.Element {
    const intl = useIntl()
    const formStore = useAddLiquidityFormStoreContext()

    return (
        <Observer>
            {() => {
                const isSyncingPool = formStore.isSyncingPool === undefined || formStore.isSyncingPool
                return (
                    <div className="form-rows">
                        <div className="form-row">
                            <div>
                                {intl.formatMessage({
                                    id: 'LIQUIDITY_ADD_DATA_SUBTITLE_CURRENT_STATE',
                                })}
                            </div>
                        </div>
                        <div className="form-row">
                            <div>
                                {formStore.leftToken?.symbol ?? formStore.pool?.left.symbol}
                            </div>
                            <div>
                                {isSyncingPool ? (
                                    <Placeholder height={20} width={80} />
                                ) : formattedTokenAmount(
                                    formStore.isInverted
                                        ? formStore.pool?.right.balance
                                        : formStore.pool?.left.balance,
                                    formStore.leftDecimals,
                                )}
                            </div>
                        </div>
                        <div className="form-row">
                            <div>
                                {formStore.rightToken?.symbol ?? formStore.pool?.right.symbol}
                            </div>
                            <div>
                                {isSyncingPool ? (
                                    <Placeholder height={20} width={80} />
                                ) : formattedTokenAmount(
                                    formStore.isInverted
                                        ? formStore.pool?.left.balance
                                        : formStore.pool?.right.balance,
                                    formStore.rightDecimals,
                                )}
                            </div>
                        </div>
                        <div className="form-row">
                            <div>
                                {intl.formatMessage({
                                    id: 'LIQUIDITY_ADD_DATA_LABEL_LP_SUPPLY',
                                })}
                            </div>
                            <div>
                                {isSyncingPool ? (
                                    <Placeholder height={20} width={80} />
                                ) : formattedTokenAmount(formStore.pool?.lp.balance, formStore.pool?.lp.decimals)}
                            </div>
                        </div>
                        {/*
                        <div className="form-row">
                            <div>
                                {intl.formatMessage({
                                    id: 'LIQUIDITY_ADD_DATA_LABEL_LEFT_PRICE',
                                }, {
                                    leftSymbol: formStore.leftToken?.symbol,
                                    rightSymbol: formStore.rightToken?.symbol,
                                })}
                            </div>
                            <div>
                                {isSyncingPool ? (
                                    <Placeholder height={20} width={80} />
                                ) : formattedTokenAmount(formStore.leftPrice)}
                            </div>
                        </div>
                        <div className="form-row">
                            <div>
                                {intl.formatMessage({
                                    id: 'LIQUIDITY_ADD_DATA_LABEL_RIGHT_PRICE',
                                }, {
                                    leftSymbol: formStore.leftToken?.symbol,
                                    rightSymbol: formStore.rightToken?.symbol,
                                })}
                            </div>
                            <div>
                                {isSyncingPool ? (
                                    <Placeholder height={20} width={80} />
                                ) : formattedTokenAmount(formStore.rightPrice)}
                            </div>
                        </div>
                        <div className="form-row">
                            <div>
                                {intl.formatMessage({
                                    id: 'LIQUIDITY_ADD_DATA_LABEL_FEE',
                                })}
                            </div>
                            <div>
                                {isSyncingPool ? (
                                    <Placeholder height={20} width={80} />
                                ) : '0.3%'}
                            </div>
                        </div>
                        */}
                    </div>
                )
            }}
        </Observer>
    )
}
