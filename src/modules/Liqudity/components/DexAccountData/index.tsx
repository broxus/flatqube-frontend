import * as React from 'react'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { Placeholder } from '@/components/common/Placeholder'
import { useAddLiquidityFormStoreContext } from '@/modules/Liqudity/context'
import { useNotifiedWithdrawLiquidityCallbacks, useNotifiedWithdrawTokenCallbacks } from '@/modules/Liqudity/hooks'
import { formattedAmount, formattedTokenAmount, isGoodBignumber } from '@/utils'


export function DexAccountData(): JSX.Element {
    const intl = useIntl()
    const formStore = useAddLiquidityFormStoreContext()
    const withdrawTokenCallbacks = useNotifiedWithdrawTokenCallbacks({})
    const withdrawLiquidityCallbacks = useNotifiedWithdrawLiquidityCallbacks({})

    const onWithdrawLeftToken = async () => {
        if (formStore.isWithdrawingLeftToken || formStore.isDepositingLiquidity) {
            return
        }

        if (formStore.leftToken && formStore.dexLeftBalance) {
            await formStore.withdrawLeftToken(withdrawTokenCallbacks)
        }
    }

    const onWithdrawRightToken = async () => {
        if (formStore.isWithdrawingRightToken || formStore.isDepositingLiquidity) {
            return
        }

        if (formStore.rightToken && formStore.dexRightBalance) {
            await formStore.withdrawRightToken(withdrawTokenCallbacks)
        }
    }

    const onWithdrawLiquidity = async () => {
        if (formStore.isWithdrawingLiquidity) {
            return
        }

        await formStore.withdrawLiquidity(withdrawLiquidityCallbacks)
    }

    return (
        <Observer>
            {() => {
                const isSyncingPool = formStore.isSyncingPool === undefined || formStore.isSyncingPool
                const isCheckingDexAccount = (
                    formStore.isCheckingDexAccount === undefined
                    || formStore.isCheckingDexAccount
                )

                return (
                    <div className="list-bill list-bill--pool">
                        <div className="list-bill__row">
                            <div className="list-bill__info">
                                {intl.formatMessage({
                                    id: 'LIQUIDITY_ADD_DATA_SUBTITLE_DEX_ACCOUNT',
                                })}
                            </div>
                        </div>

                        {formStore.leftToken !== undefined && (
                            <div key="dexLeftBalance" className="list-bill__row">
                                <div className="list-bill__info">
                                    <span>
                                        {formStore.leftToken.symbol ?? formStore.pool?.left.symbol}
                                    </span>
                                    {isGoodBignumber(formStore.dexLeftBalance ?? 0) && (
                                        <Button
                                            disabled={(
                                                formStore.isWithdrawingLeftToken
                                                || formStore.isDepositingLiquidity
                                            )}
                                            size="xs"
                                            type="link"
                                            title="Withdraw"
                                            style={{ height: 20, lineHeight: 1, minHeight: 1 }}
                                            onClick={onWithdrawLeftToken}
                                        >
                                            {formStore.isWithdrawingLeftToken ? (
                                                <Icon icon="loader" ratio={0.6} className="spin" />
                                            ) : (
                                                <Icon icon="push" ratio={0.6} />
                                            )}
                                        </Button>
                                    )}
                                </div>
                                <div className="list-bill__val">
                                    {isCheckingDexAccount ? (
                                        <Placeholder height={20} width={80} />
                                    ) : formattedTokenAmount(formStore.dexLeftBalance, formStore.leftDecimals, {
                                        preserve: true,
                                    })}
                                </div>
                            </div>
                        )}

                        {formStore.rightToken !== undefined && (
                            <div key="dexRightBalance" className="list-bill__row">
                                <div className="list-bill__info">
                                    <span>
                                        {formStore.rightToken.symbol ?? formStore.pool?.right.symbol}
                                    </span>
                                    {isGoodBignumber(formStore.dexRightBalance ?? 0) && (
                                        <Button
                                            disabled={(
                                                formStore.isWithdrawingRightToken
                                                || formStore.isDepositingLiquidity
                                            )}
                                            size="xs"
                                            type="link"
                                            title="Withdraw"
                                            style={{ height: 20, lineHeight: 1, minHeight: 1 }}
                                            onClick={onWithdrawRightToken}
                                        >
                                            {formStore.isWithdrawingRightToken ? (
                                                <Icon icon="loader" ratio={0.6} className="spin" />
                                            ) : (
                                                <Icon icon="push" ratio={0.6} />
                                            )}
                                        </Button>
                                    )}
                                </div>
                                <div className="list-bill__val">
                                    {isCheckingDexAccount ? (
                                        <Placeholder height={20} width={80} />
                                    ) : formattedTokenAmount(formStore.dexRightBalance, formStore.rightDecimals, {
                                        preserve: true,
                                    })}
                                </div>
                            </div>
                        )}

                        {(
                            formStore.leftToken !== undefined
                            && formStore.rightToken !== undefined
                            && (isSyncingPool || (formStore.isSyncingPool === false && formStore.isPoolConnected))
                        ) && (
                            <>
                                <div key="lpWalletBalance" className="list-bill__row">
                                    <div className="list-bill__info">
                                        <span>
                                            {intl.formatMessage({
                                                id: 'LIQUIDITY_ADD_DEX_DATA_LABEL_LP_TOKENS',
                                            })}
                                        </span>
                                        {formStore.isWithdrawLiquidityAvailable && (
                                            <Button
                                                key="withdrawLiquidity"
                                                size="xs"
                                                type="link"
                                                title="Withdraw Liquidity"
                                                style={{ height: 20, lineHeight: 1, minHeight: 1 }}
                                                onClick={onWithdrawLiquidity}
                                            >
                                                {formStore.isWithdrawingLiquidity ? (
                                                    <Icon icon="loader" ratio={0.6} className="spin" />
                                                ) : (
                                                    <Icon icon="push" ratio={0.6} />
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                    <div className="list-bill__val">
                                        {isSyncingPool ? (
                                            <Placeholder height={20} width={80} />
                                        ) : formattedTokenAmount(
                                            formStore.pool?.lp.userBalance,
                                            formStore.pool?.lp.decimals,
                                        )}
                                    </div>
                                </div>

                                <div key="currentSharePercent" className="list-bill__row">
                                    <div className="list-bill__info">
                                        <span>
                                            {intl.formatMessage({
                                                id: 'LIQUIDITY_ADD_DEX_DATA_LABEL_CURRENT_SHARE',
                                            })}
                                        </span>
                                    </div>
                                    <div className="list-bill__val">
                                        {isSyncingPool ? (
                                            <Placeholder height={20} width={80} />
                                        ) : intl.formatMessage(
                                            { id: 'LIQUIDITY_ADD_DEX_DATA_RESULT_CURRENT_SHARE' },
                                            { value: formattedAmount(formStore.currentSharePercent) },
                                        )}
                                    </div>
                                </div>

                                <div key="currentShareLeft" className="list-bill__row">
                                    <div className="list-bill__info"> </div>
                                    <div className="list-bill__val">
                                        {isSyncingPool ? (
                                            <Placeholder height={20} width={80} />
                                        ) : intl.formatMessage({
                                            id: 'LIQUIDITY_ADD_DEX_DATA_RESULT_CURRENT_SHARE_LEFT',
                                        }, {
                                            symbol: formStore.isInverted
                                                ? formStore.rightToken?.symbol
                                                : formStore.leftToken?.symbol,
                                            value: formattedTokenAmount(formStore.currentShareLeft),
                                        })}
                                    </div>
                                </div>

                                <div key="currentShareRight" className="list-bill__row">
                                    <div className="list-bill__info"> </div>
                                    <div className="list-bill__val">
                                        {isSyncingPool ? (
                                            <Placeholder height={20} width={80} />
                                        ) : intl.formatMessage({
                                            id: 'LIQUIDITY_ADD_DEX_DATA_RESULT_CURRENT_SHARE_RIGHT',
                                        }, {
                                            symbol: formStore.isInverted
                                                ? formStore.leftToken?.symbol
                                                : formStore.rightToken?.symbol,
                                            value: formattedTokenAmount(formStore.currentShareRight),
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )
            }}
        </Observer>
    )
}
