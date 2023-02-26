import * as React from 'react'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { Placeholder } from '@/components/common/Placeholder'
import { useNotifiedWithdrawLiquidityCallbacks, useNotifiedWithdrawTokenCallbacks } from '@/modules/Pools/hooks'
import { useAddLiquidityFormStoreContext } from '@/modules/Pools/context'
import {
    formattedAmount,
    formattedTokenAmount,
    isGoodBignumber,
    makeArray,
    uniqueId,
} from '@/utils'


export function DexAccountData(): JSX.Element {
    const intl = useIntl()
    const formStore = useAddLiquidityFormStoreContext()
    const withdrawTokenCallbacks = useNotifiedWithdrawTokenCallbacks({})
    const withdrawLiquidityCallbacks = useNotifiedWithdrawLiquidityCallbacks({})

    const onWithdrawToken = (address: string) => async () => {
        if (formStore.isTokenWithdrawing(address)) {
            return
        }

        await formStore.withdrawToken(address, withdrawTokenCallbacks)
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

                        {isSyncingPool ? makeArray(3, uniqueId).map(key => (
                            <div key={key} className="list-bill__row">
                                <div className="list-bill__info">
                                    <Placeholder height={20} width={80} />
                                </div>
                                <div className="list-bill__val">
                                    <Placeholder height={20} width={80} />
                                </div>
                            </div>
                        )) : formStore.tokens.map(token => {
                            const address = token.address.toString()
                            const balance = formStore.getDexBalance(address)
                            return (
                                <div key={`dexBalance${address}`} className="list-bill__row">
                                    <div className="list-bill__info">
                                        <span>{token.symbol}</span>
                                        {isGoodBignumber(balance) && (
                                            <Button
                                                size="xs"
                                                type="link"
                                                title="Withdraw"
                                                style={{ height: 20, lineHeight: 1, minHeight: 1 }}
                                                onClick={onWithdrawToken(address)}
                                            >
                                                {formStore.isTokenWithdrawing(address) ? (
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
                                        ) : formattedTokenAmount(
                                            formStore.getDexBalance(token.address.toString()),
                                            token.decimals,
                                            { preserve: true },
                                        )}
                                    </div>
                                </div>
                            )
                        })}

                        {(isSyncingPool || (formStore.isSyncingPool === false && formStore.isPoolConnected)) && (
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

                                {isSyncingPool ? makeArray(3, uniqueId).map(key => (
                                    <div key={key} className="list-bill__row">
                                        <div className="list-bill__info"> </div>
                                        <div className="list-bill__val">
                                            <Placeholder height={20} width={80} />
                                        </div>
                                    </div>
                                )) : formStore.tokens.map(token => (
                                    <div
                                        key={`currentShare${token.address.toString()}`}
                                        className="list-bill__row"
                                    >
                                        <div className="list-bill__info"> </div>
                                        <div className="list-bill__val">
                                            {isSyncingPool ? (
                                                <Placeholder height={20} width={80} />
                                            ) : intl.formatMessage({
                                                id: 'LIQUIDITY_ADD_DEX_DATA_RESULT_CURRENT_SHARE_LEFT',
                                            }, {
                                                symbol: token.symbol,
                                                value: formattedTokenAmount(
                                                    formStore.currentTokenShare(token.address.toString()),
                                                ),
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                )
            }}
        </Observer>
    )
}
