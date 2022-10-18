import * as React from 'react'
import classNames from 'classnames'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Icon } from '@/components/common/Icon'
import {
    ConversionSubmitButton,
    CrossExchangeSubmitButton,
    MultiSwapConfirmationPopup,
    SwapBill,
    SwapConfirmationPopup,
    SwapField,
    SwapNotation,
    SwapPrice,
    SwapSettings,
    SwapSubmitButton,
} from '@/modules/Swap/components'
import { useSwapFormStoreContext } from '@/modules/Swap/context'
import { useSwapForm } from '@/modules/Swap/hooks/useSwapForm'
import { SwapDirection } from '@/modules/Swap/types'
import { TokensList } from '@/modules/TokensList'
import { TokenImportPopup } from '@/modules/TokensList/components'

import './index.scss'


export function Swap(): JSX.Element {
    const intl = useIntl()
    const formStore = useSwapFormStoreContext()
    const form = useSwapForm()

    return (
        <>
            <div className="swap-container">
                <SwapNotation />
                <div className="card swap-card">
                    <div className="card__wrap">
                        <header className="card__header">
                            <Observer>
                                {() => (
                                    <h2 className="card-title">
                                        {intl.formatMessage({
                                            id: 'SWAP_HEADER_TITLE',
                                        })}
                                    </h2>
                                )}
                            </Observer>

                            <SwapSettings />
                        </header>

                        <div className="form">
                            <Observer>
                                {() => (
                                    <SwapField
                                        key="leftField"
                                        balance={formStore.formattedLeftBalance}
                                        disabled={formStore.isLoading || formStore.isSwapping}
                                        id="leftField"
                                        isMultiple={formStore.isMultipleSwapMode}
                                        isValid={(
                                            formStore.isLoading
                                                || formStore.isSwapping
                                                || formStore.isLeftAmountValid
                                        )}
                                        nativeCoin={(formStore.isMultipleSwapMode || formStore.coinSide === 'leftToken')
                                            ? formStore.wallet.coin
                                            : undefined}
                                        readOnly={(
                                            formStore.isPreparing
                                                || formStore.isPairChecking
                                                || formStore.isSwapping
                                        )}
                                        showMaximizeButton={formStore.leftBalanceNumber.gt(0)}
                                        token={formStore.leftToken}
                                        value={(
                                            formStore.isCrossExchangeMode
                                                && formStore.direction === SwapDirection.RTL
                                        ) ? formStore.crossPairSwap.leftAmount : formStore.leftAmount}
                                        onChange={form.onChangeLeftAmount}
                                        onMaximize={formStore.maximizeLeftAmount}
                                        onToggleTokensList={form.showTokensList('leftToken')}
                                    />
                                )}
                            </Observer>

                            <Observer>
                                {() => (
                                    <div
                                        className={classNames('swap-icon', {
                                            disabled: (
                                                formStore.isPreparing
                                                || formStore.isLoading
                                                || formStore.isSwapping
                                            ),
                                        })}
                                        onClick={formStore.isConversionMode
                                            ? form.toggleConversionDirection
                                            : form.toggleSwapDirection}
                                    >
                                        <Icon icon="reverse" />
                                    </div>
                                )}
                            </Observer>

                            <Observer>
                                {() => (
                                    <SwapField
                                        key="rightField"
                                        balance={formStore.formattedRightBalance}
                                        disabled={formStore.isLoading || formStore.isSwapping}
                                        id="rightField"
                                        isValid={(
                                            formStore.isCalculating
                                            || formStore.isLoading
                                            || formStore.isSwapping
                                            || formStore.isRightAmountValid
                                        )}
                                        nativeCoin={formStore.coinSide === 'rightToken' ? formStore.wallet.coin : undefined}
                                        readOnly={(
                                            formStore.isPreparing
                                            || formStore.isPairChecking
                                            || formStore.isSwapping
                                        )}
                                        token={formStore.rightToken}
                                        value={(
                                            formStore.isCrossExchangeMode
                                                && formStore.direction === SwapDirection.LTR
                                        ) ? formStore.crossPairSwap.rightAmount : formStore.rightAmount}
                                        onChange={form.onChangeRightAmount}
                                        onToggleTokensList={form.showTokensList('rightToken')}
                                    />
                                )}
                            </Observer>

                            <Observer>
                                {() => ((
                                    formStore.wallet.isConnected
                                    && !formStore.isPreparing
                                    && !formStore.isConversionMode
                                )
                                    ? <SwapPrice key="price" />
                                    : null)}
                            </Observer>

                            <Observer>
                                {() => {
                                    switch (true) {
                                        case formStore.isConversionMode:
                                            return <ConversionSubmitButton key="conversionSubmitButton" />

                                        case formStore.isCrossExchangeMode:
                                            return <CrossExchangeSubmitButton key="crossExchangeSubmitButton" />

                                        default:
                                            return <SwapSubmitButton key="submitButton" />
                                    }
                                }}
                            </Observer>
                        </div>
                    </div>
                </div>
            </div>

            <Observer>
                {() => (!formStore.isConversionMode ? (
                    <SwapBill
                        key="bill"
                        fee={formStore.swap.fee}
                        isCrossExchangeAvailable={formStore.isCrossExchangeAvailable}
                        isCrossExchangeMode={formStore.isCrossExchangeMode}
                        leftToken={formStore.coinSide === 'leftToken' ? formStore.wallet.coin : formStore.leftToken}
                        minExpectedAmount={formStore.swap.minExpectedAmount}
                        priceImpact={formStore.swap.priceImpact}
                        rightToken={formStore.coinSide === 'rightToken' ? formStore.wallet.coin : formStore.rightToken}
                        slippage={formStore.swap.slippage}
                        tokens={formStore.route?.tokens}
                    />
                ) : null)}
            </Observer>

            <Observer>
                {/* eslint-disable-next-line no-nested-ternary */}
                {() => (formStore.isConfirmationAwait ? (
                    formStore.isMultipleSwapMode ? (
                        <MultiSwapConfirmationPopup key="multiSwapConfirmationPopup" />
                    ) : (
                        <SwapConfirmationPopup key="confirmationPopup" />
                    )
                ) : null
                )}
            </Observer>

            {(form.isTokenListShown && form.tokenSide === 'leftToken') && (
                <TokensList
                    key="leftTokensList"
                    allowMultiple
                    currentToken={formStore.leftToken}
                    currentTokenSide="leftToken"
                    isMultiple={formStore.isMultipleSwapMode}
                    combinedTokenRoot={formStore.multipleSwapTokenRoot}
                    nativeCoin={formStore.wallet.coin}
                    nativeCoinSide={formStore.coinSide}
                    onDismiss={form.hideTokensList}
                    onSelectMultipleSwap={form.onSelectMultipleSwap}
                    onSelectNativeCoin={form.onSelectLeftNativeCoin}
                    onSelectToken={form.onSelectLeftToken}
                />
            )}

            {(form.isTokenListShown && form.tokenSide === 'rightToken') && (
                <TokensList
                    key="rightTokensList"
                    allowMultiple={false}
                    currentToken={formStore.rightToken}
                    currentTokenSide="rightToken"
                    isMultiple={formStore.isMultipleSwapMode}
                    combinedTokenRoot={formStore.multipleSwapTokenRoot}
                    nativeCoin={formStore.wallet.coin}
                    nativeCoinSide={formStore.coinSide}
                    onDismiss={form.hideTokensList}
                    onSelectNativeCoin={form.onSelectRightNativeCoin}
                    onSelectToken={form.onSelectRightToken}
                />
            )}

            <Observer>
                {() => (
                    <>
                        {(formStore.tokensCache.isImporting && form.tokenSide === 'leftToken') && (
                            <TokenImportPopup
                                key="tokenImportLeft"
                                onImportConfirm={form.onLeftImportConfirm}
                            />
                        )}
                        {(formStore.tokensCache.isImporting && form.tokenSide === 'rightToken') && (
                            <TokenImportPopup
                                key="tokenImportRight"
                                onImportConfirm={form.onRightImportConfirm}
                            />
                        )}
                        {(formStore.tokensCache.isImporting && form.tokenSide === undefined) && (
                            <TokenImportPopup
                                key="tokenImportUrl"
                            />
                        )}
                    </>
                )}
            </Observer>
        </>
    )
}
