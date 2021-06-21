import * as React from 'react'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Icon } from '@/components/common/Icon'
import { useBalanceValidation } from '@/hooks/useBalanceValidation'
import {
    PoolAutoExchange,
    PoolData,
    PoolDepositLiquidityTransaction,
    PoolDexAccountData,
    PoolField,
    PoolPairIcons,
    PoolRootsInfo,
    PoolShareData,
    PoolStepsAnnotations,
    PoolSubmitButton,
} from '@/modules/Pool/components'
import { usePoolForm } from '@/modules/Pool/hooks/usePoolForm'
import { usePool } from '@/modules/Pool/stores/PoolStore'
import { PoolStoreDataProp } from '@/modules/Pool/types'
import { TokensList } from '@/modules/TokensList'
import { useWallet } from '@/stores/WalletService'

import './index.scss'


export function Pool(): JSX.Element {
    const intl = useIntl()
    const pool = usePool()
    const poolForm = usePoolForm()
    const wallet = useWallet()

    return (
        <>
            <div className="card">
                <div className="card__wrap">
                    <div className="card__header">
                        <h2 className="card-title">
                            {intl.formatMessage({
                                id: 'POOL_HEADER_TITLE',
                            })}
                        </h2>
                        {pool.pair && (
                            <PoolPairIcons key="pair-icons" />
                        )}
                    </div>

                    <div className="form">
                        <Observer>
                            {() => (
                                <PoolField
                                    key="leftField"
                                    dexAccountBalance={pool.dexLeftBalance}
                                    label={intl.formatMessage({
                                        id: 'POOL_FIELD_LABEL_LEFT',
                                    })}
                                    isCaution={pool.isAutoExchangeEnable}
                                    isValid={useBalanceValidation(
                                        pool.leftToken,
                                        pool.leftAmount,
                                        pool.dexLeftBalance,
                                    )}
                                    token={pool.leftToken}
                                    value={pool.leftAmount}
                                    onChange={poolForm.onChangeData(PoolStoreDataProp.LEFT_AMOUNT)}
                                    onToggleTokensList={poolForm.showTokensList(PoolStoreDataProp.LEFT_TOKEN)}
                                />

                            )}
                        </Observer>

                        <Observer>
                            {() => (
                                <div className="pool-linkage">
                                    <Icon icon="link" ratio={1.8} />
                                </div>
                            )}
                        </Observer>

                        <Observer>
                            {() => (
                                <PoolField
                                    key="rightField"
                                    dexAccountBalance={pool.dexRightBalance}
                                    label={intl.formatMessage({
                                        id: 'POOL_FIELD_LABEL_RIGHT',
                                    })}
                                    isCaution={pool.isAutoExchangeEnable}
                                    isValid={useBalanceValidation(
                                        pool.rightToken,
                                        pool.rightAmount,
                                        pool.dexRightBalance,
                                    )}
                                    token={pool.rightToken}
                                    value={pool.rightAmount}
                                    onChange={poolForm.onChangeData(PoolStoreDataProp.RIGHT_AMOUNT)}
                                    onToggleTokensList={poolForm.showTokensList(PoolStoreDataProp.RIGHT_TOKEN)}
                                />
                            )}
                        </Observer>

                        <Observer>
                            {() => (pool.isAutoExchangeAvailable
                                ? <PoolAutoExchange key="autoExchange" />
                                : null
                            )}
                        </Observer>

                        <Observer>
                            {() => (pool.isPoolDataAvailable
                                ? <PoolData key="poolData" />
                                : null
                            )}
                        </Observer>

                        <Observer>
                            {() => (pool.isPoolShareDataAvailable
                                ? <PoolShareData key="poolShareData" />
                                : null
                            )}
                        </Observer>

                        <Observer>
                            {() => (wallet.account ? (
                                <PoolStepsAnnotations key="annotations" />
                            ) : null)}
                        </Observer>

                        <PoolSubmitButton key="submitButton" />
                    </div>
                </div>

                {pool.isDexAccountDataAvailable && (
                    <PoolDexAccountData key="dexAccount" />
                )}

                <PoolRootsInfo key="rootsInfo" />
            </div>

            <PoolDepositLiquidityTransaction
                key="transaction"
                onDismiss={poolForm.onDismissTransactionReceipt}
            />

            {(poolForm.isTokenListShown && poolForm.tokenSide) && (
                <TokensList
                    key="tokensList"
                    currentToken={pool[poolForm.tokenSide]}
                    onDismiss={poolForm.hideTokensList}
                    onSelectToken={poolForm.onSelectToken}
                />
            )}
        </>
    )
}