import * as React from 'react'
import { reaction } from 'mobx'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import {
    AddLiquidityAddresses,
    AddLiquidityAnnotations,
    AddLiquidityField,
    AddLiquidityPoolData,
    AddLiquidityPoolsIcons,
    AddLiquiditySubmitButton,
    DexAccountData,
    FieldPlaceholder,
} from '@/modules/Pools/components'
import { useAddLiquidityFormStoreContext } from '@/modules/Pools/context'
import {
    error,
    formattedTokenAmount,
    isGoodBignumber,
    makeArray,
    uniqueId,
} from '@/utils'

export function AddLiquidity(): JSX.Element {
    const intl = useIntl()

    const formStore = useAddLiquidityFormStoreContext()

    React.useEffect(() => {
        const tokensListDisposer = reaction(
            () => formStore.tokensCache.isReady,
            async isReady => {
                formStore.setState('isPreparing', true)
                if (isReady) {
                    try {
                        await formStore.init()
                    }
                    catch (e) {
                        error('Add Liquidity Form Store initializing error', e)
                    }
                    finally {
                        formStore.setState('isPreparing', false)
                    }
                }
            },
            { fireImmediately: true },
        )

        return () => {
            tokensListDisposer()
            formStore.dispose().catch(reason => error(reason))
        }
    }, [])

    return (
        <>
            <div className="card">
                <div className="card__wrap">
                    <header className="card__header">
                        <h2 className="card-title">
                            {intl.formatMessage({
                                id: 'LIQUIDITY_ADD_HEADER_TITLE',
                            })}
                        </h2>
                        <AddLiquidityPoolsIcons />
                    </header>

                    <Observer>
                        {() => {
                            const isSyncingPool = formStore.isSyncingPool === undefined || formStore.isSyncingPool
                            return (
                                <div className="form">
                                    {isSyncingPool ? makeArray(3, uniqueId).map(key => (
                                        <FieldPlaceholder key={key} />
                                    )) : formStore.tokens?.map(token => {
                                        const address = token.address.toString()
                                        const balance = formStore.getCombinedBalance(address)
                                        return (
                                            <AddLiquidityField
                                                key={address}
                                                balance={formattedTokenAmount(
                                                    balance,
                                                    token.decimals,
                                                )}
                                                label={!formStore.isAmountValid(address) ? intl.formatMessage({
                                                    id: 'LIQUIDITY_ADD_INSUFFICIENT_TOKEN_BALANCE',
                                                }) : undefined}
                                                isValid={formStore.isAmountValid(address)}
                                                id={address}
                                                showMaximizeButton={isGoodBignumber(balance)}
                                                token={token}
                                                value={formStore.getAmount(address)}
                                            />
                                        )
                                    })}

                                    <Observer>
                                        {() => (formStore.isPoolDataAvailable
                                            ? <AddLiquidityPoolData key="poolData" />
                                            : null
                                        )}
                                    </Observer>

                                    <Observer>
                                        {() => (formStore.wallet.isReady
                                            ? <AddLiquidityAnnotations key="annotations" />
                                            : null
                                        )}
                                    </Observer>

                                    <AddLiquiditySubmitButton key="submitButton" />
                                </div>
                            )
                        }}
                    </Observer>
                </div>
            </div>

            <Observer>
                {() => (formStore.isDexAccountDataAvailable ? (
                    <DexAccountData key="dexAccount" />
                ) : null)}
            </Observer>

            <Observer>
                {() => ((formStore.isPoolDataAvailable || formStore.isDexAccountDataAvailable)
                    ? <AddLiquidityAddresses key="addresses" />
                    : null
                )}
            </Observer>

        </>
    )
}
