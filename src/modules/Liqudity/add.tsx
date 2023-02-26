import * as React from 'react'
import BigNumber from 'bignumber.js'
import { reaction } from 'mobx'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'

import { Icon } from '@/components/common/Icon'
import {
    AddLiquidityAddresses,
    AddLiquidityAnnotations,
    AddLiquidityAutoChange,
    AddLiquidityField,
    AddLiquidityPoolData,
    AddLiquiditySubmitButton,
    DexAccountData,
    PoolsIcons,
} from '@/modules/Liqudity/components'
import { useAddLiquidityFormStoreContext } from '@/modules/Liqudity/context'
import { useAddLiquidityForm } from '@/modules/Liqudity/hooks'
import { TokensList } from '@/modules/TokensList'
import { TokenImportPopup } from '@/modules/TokensList/components'
import type { URLTokensParams } from '@/routes'
import { error, formattedTokenAmount, isGoodBignumber } from '@/utils'

import './add-liquidity.scss'

export function AddLiquidity(): JSX.Element {
    const intl = useIntl()
    const { leftTokenRoot, rightTokenRoot } = useParams<URLTokensParams>()

    const formStore = useAddLiquidityFormStoreContext()
    const form = useAddLiquidityForm()

    const maximizeLeftAmount = React.useCallback(async () => {
        await formStore.changeLeftAmount(
            new BigNumber(formStore.leftBalance).shiftedBy(-(formStore.leftDecimals ?? 0)).toFixed(),
        )
    }, [])

    const maximizeRightAmount = React.useCallback(async () => {
        await formStore.changeRightAmount(
            new BigNumber(formStore.rightBalance).shiftedBy(-(formStore.rightDecimals ?? 0)).toFixed(),
        )
    }, [])

    const onLeftImportConfirm = React.useCallback((value: string) => {
        form.onLeftImportConfirm(value, rightTokenRoot)
    }, [leftTokenRoot, rightTokenRoot])

    const onRightImportConfirm = React.useCallback((value: string) => {
        if (leftTokenRoot) {
            form.onRightImportConfirm(leftTokenRoot, value)
        }
    }, [leftTokenRoot, rightTokenRoot])

    React.useEffect(() => {
        const tokensListDisposer = reaction(
            () => formStore.tokensCache.isReady,
            async isReady => {
                formStore.setState('isPreparing', true)
                if (isReady) {
                    try {
                        await form.resolveStateFromUrl(leftTokenRoot, rightTokenRoot)
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
                        <PoolsIcons />
                    </header>

                    <div className="form">
                        <Observer>
                            {() => (
                                <AddLiquidityField
                                    key="leftField"
                                    balance={formattedTokenAmount(formStore.leftBalance, formStore.leftDecimals)}
                                    label={formStore.isInsufficientLeftBalance ? intl.formatMessage({
                                        id: 'LIQUIDITY_ADD_INSUFFICIENT_TOKEN_BALANCE',
                                    }) : undefined}
                                    id="leftField"
                                    isCaution={formStore.isAutoExchangeEnabled && !formStore.isStablePool}
                                    isValid={formStore.wallet.isReady ? (
                                        formStore.isDepositingLeft
                                        || formStore.isDepositingLiquidity
                                        || !formStore.isInsufficientLeftBalance
                                    ) : true}
                                    showMaximizeButton={isGoodBignumber(formStore.leftBalance)}
                                    token={formStore.leftToken}
                                    value={formStore.leftAmount}
                                    readOnly={
                                        formStore.isDepositingLiquidity
                                        || formStore.isDepositingLeft
                                        || formStore.isDepositingRight
                                    }
                                    onChange={form.onChangeLeftAmount}
                                    onMaximize={maximizeLeftAmount}
                                    onToggleTokensList={form.showTokensList('leftToken')}
                                />
                            )}
                        </Observer>

                        <div className="add-liquidity-linkage">
                            <Icon icon="link" ratio={1.8} />
                        </div>

                        <Observer>
                            {() => (
                                <AddLiquidityField
                                    key="rightField"
                                    balance={formattedTokenAmount(formStore.rightBalance, formStore.rightDecimals)}
                                    label={formStore.isInsufficientRightBalance ? intl.formatMessage({
                                        id: 'LIQUIDITY_ADD_INSUFFICIENT_TOKEN_BALANCE',
                                    }) : undefined}
                                    id="rightField"
                                    isCaution={formStore.isAutoExchangeEnabled && !formStore.isStablePool}
                                    isValid={formStore.wallet.isReady ? (
                                        formStore.isDepositingRight
                                            || formStore.isDepositingLiquidity
                                            || !formStore.isInsufficientRightBalance
                                    ) : true}
                                    showMaximizeButton={isGoodBignumber(formStore.rightBalance)}
                                    token={formStore.rightToken}
                                    value={formStore.rightAmount}
                                    readOnly={
                                        formStore.isDepositingLiquidity
                                            || formStore.isDepositingLeft
                                            || formStore.isDepositingRight
                                    }
                                    onChange={form.onChangeRightAmount}
                                    onMaximize={maximizeRightAmount}
                                    onToggleTokensList={form.showTokensList('rightToken')}
                                />
                            )}
                        </Observer>

                        <Observer>
                            {() => ((formStore.isAutoExchangeAvailable && !formStore.isStablePool)
                                ? <AddLiquidityAutoChange key="autoExchange" />
                                : null)}
                        </Observer>

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

            {(form.isTokenListShown && form.tokenSide === 'leftToken') && (
                <TokensList
                    key="leftTokensList"
                    currentToken={formStore.leftToken}
                    onDismiss={form.hideTokensList}
                    onSelectToken={form.onSelectLeftToken}
                />
            )}

            {(form.isTokenListShown && form.tokenSide === 'rightToken') && (
                <TokensList
                    key="rightTokensList"
                    currentToken={formStore.rightToken}
                    onDismiss={form.hideTokensList}
                    onSelectToken={form.onSelectRightToken}
                />
            )}

            <Observer>
                {() => (
                    <>
                        {(formStore.tokensCache.isImporting && form.tokenSide === 'leftToken') && (
                            <TokenImportPopup
                                key="tokenImportLeft"
                                onImportConfirm={onLeftImportConfirm}
                            />
                        )}
                        {(formStore.tokensCache.isImporting && form.tokenSide === 'rightToken') && (
                            <TokenImportPopup
                                key="tokenImportRight"
                                onImportConfirm={onRightImportConfirm}
                            />
                        )}
                        {(formStore.tokensCache.isImporting && form.tokenSide === undefined) && (
                            <TokenImportPopup key="tokenImportUrl" />
                        )}
                    </>
                )}
            </Observer>
        </>
    )
}
