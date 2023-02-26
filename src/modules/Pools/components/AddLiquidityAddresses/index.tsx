import * as React from 'react'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { AccountExplorerLink } from '@/components/common/AccountExplorerLink'
import { useAddLiquidityFormStoreContext } from '@/modules/Pools/context'
import { Placeholder } from '@/components/common/Placeholder'


export function AddLiquidityAddresses(): JSX.Element {
    const intl = useIntl()
    const formStore = useAddLiquidityFormStoreContext()

    return (
        <Observer>
            {() => {
                const isSyncingPool = formStore.isSyncingPool === undefined || formStore.isSyncingPool
                const isCheckingDexAccount = (
                    formStore.isCheckingDexAccount === undefined
                    || formStore.isCheckingDexAccount
                )

                return (
                    <div className="list-bill">
                        <div key="dexAddress" className="list-bill__row">
                            <div className="list-bill__info">
                                <span>
                                    {intl.formatMessage({
                                        id: 'LIQUIDITY_ADD_ROOTS_INFO_LABEL_DEX_ADDRESS',
                                    })}
                                </span>
                            </div>
                            <div className="list-bill__val">
                                {/* eslint-disable-next-line no-nested-ternary */}
                                {isCheckingDexAccount ? (
                                    <Placeholder height={18} width={80} />
                                ) : formStore.dex.address === undefined ? <>&mdash;</> : (
                                    <AccountExplorerLink address={formStore.dex.address.toString()} />
                                )}
                            </div>
                        </div>
                        <div key="lpRoot" className="list-bill__row">
                            <div className="list-bill__info">
                                <span>
                                    {intl.formatMessage({
                                        id: 'LIQUIDITY_ADD_ROOTS_INFO_LABEL_LP_ROOT',
                                    })}
                                </span>
                            </div>
                            <div className="list-bill__val">
                                {/* eslint-disable-next-line no-nested-ternary */}
                                {isSyncingPool ? (
                                    <Placeholder height={18} width={80} />
                                ) : formStore.pool?.lp.address === undefined ? <>&mdash;</> : (
                                    <AccountExplorerLink address={formStore.pool.lp.address.toString()} />
                                )}
                            </div>
                        </div>
                        <div key="pairRoot" className="list-bill__row">
                            <div className="list-bill__info">
                                <span>
                                    {intl.formatMessage({
                                        id: 'LIQUIDITY_ADD_ROOTS_INFO_LABEL_PAIR_ROOT',
                                    })}
                                </span>
                            </div>
                            <div className="list-bill__val">
                                <AccountExplorerLink address={formStore.poolAddress.toString()} />
                            </div>
                        </div>
                    </div>
                )
            }}
        </Observer>
    )
}

