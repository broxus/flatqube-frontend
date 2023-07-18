import * as React from 'react'
import classNames from 'classnames'
import { reaction } from 'mobx'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { Link, useParams } from 'react-router-dom'

import { Icon } from '@/components/common/Icon'
import {
    ConversionSubmitButton,
    LiquidityStableSwapSubmitButton,
    MultiSwapConfirmationPopup,
    CustomTokensAlerts,
    SwapBill,
    SwapConfirmationPopup,
    SwapField,
    // SwapNotation,
    // SwapPrice,
    SwapSettings,
    SwapSubmitButton,
} from '@/modules/Swap/components'
import { useSwapFormStoreContext } from '@/modules/Swap/context'
import { DEFAULT_SLIPPAGE_VALUE } from '@/modules/Swap/constants'
import { useSwapForm } from '@/modules/Swap/hooks/useSwapForm'
import { TokensList } from '@/modules/TokensList'
import { TokenImportPopup } from '@/modules/TokensList/components'
import { appRoutes, URLTokensParams } from '@/routes'
import { NativeScrollArea } from '@/components/common/NativeScrollArea'
import { error, storage } from '@/utils'

import './index.scss'


export function Swap(): JSX.Element {
    const intl = useIntl()
    const { leftTokenRoot, rightTokenRoot } = useParams<URLTokensParams>()

    const formStore = useSwapFormStoreContext()
    const form = useSwapForm()

    const onLeftImportConfirm = React.useCallback((value: string) => {
        form.onLeftImportConfirm(value, rightTokenRoot)
    }, [leftTokenRoot, rightTokenRoot])

    const onRightImportConfirm = React.useCallback((value: string) => {
        if (leftTokenRoot) {
            form.onRightImportConfirm(leftTokenRoot, value)
        }
    }, [leftTokenRoot, rightTokenRoot])

    React.useEffect(() => {
        formStore.setState('isPreparing', formStore.wallet.isInitializing || !formStore.tokensCache.isReady)
        const tokensListDisposer = reaction(
            () => formStore.tokensCache.isReady,
            async isReady => {
                if (isReady) {
                    try {
                        formStore.setData('slippage', storage.get('slippage') ?? DEFAULT_SLIPPAGE_VALUE)
                        await form.resolveStateFromUrl(leftTokenRoot, rightTokenRoot)
                        await formStore.init()
                    }
                    catch (e) { }
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
            <div className="swap__sidebar">
                <div className="card swap-card">
                    <div className="card__wrap">
                        <header className="card__header">
                            <Observer>
                                {() => (
                                    <NativeScrollArea>
                                        <ul className="tabs">
                                            <li
                                                className="active"
                                                style={({
                                                    fontWeight: 500,
                                                    letterSpacing: '0.25px',
                                                    lineHeight: '20px',
                                                })}
                                            >
                                                {intl.formatMessage({
                                                    id: 'NAV_LINK_TEXT_SWAP',
                                                })}
                                            </li>
                                            <li>
                                                <Link
                                                    to={appRoutes.limit.makeUrl({
                                                        leftTokenRoot: formStore.leftToken?.root.toString(),
                                                        rightTokenRoot: formStore.leftToken?.root.toString()
                                                            ? formStore.rightToken?.root.toString()
                                                            : undefined,
                                                    })}
                                                    onClick={() => storage.set(
                                                        'amounts',
                                                        JSON.stringify({
                                                            leftAmount: formStore.leftAmount ?? '',
                                                            rightAmount: formStore.rightAmount ?? '',
                                                        }),
                                                    )}
                                                >
                                                    {/* <h4 className="card-title"> */}
                                                    {intl.formatMessage({ id: 'P2P_HEADER_TITLE' })}
                                                    {/* </h4> */}
                                                </Link>

                                            </li>

                                        </ul>
                                    </NativeScrollArea>

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
                                        disabled={formStore.isProcessing}
                                        id="leftField"
                                        isMultiple={formStore.isComboSwapMode}
                                        isValid={formStore.isProcessing || formStore.isLeftAmountValid}
                                        nativeCoin={(formStore.isComboSwapMode || formStore.coinSide === 'leftToken')
                                            ? formStore.wallet.coin
                                            : undefined}
                                        readOnly={(
                                            formStore.isPreparing
                                            || formStore.isSyncingPool
                                            || formStore.isProcessing
                                        )}
                                        showMaximizeButton={formStore.leftBalanceNumber.gt(0)}
                                        token={formStore.leftToken}
                                        value={formStore.leftAmount}
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
                                            disabled: formStore.isPreparing || formStore.isProcessing,
                                        })}
                                        onClick={formStore.isConversionMode
                                            ? form.toggleConversionDirection
                                            : form.toggleSwapDirection}
                                    >
                                        <Icon
                                            icon="reverse"
                                            ratio={2 / 3}
                                        />
                                    </div>
                                )}
                            </Observer>

                            <Observer>
                                {() => (
                                    <SwapField
                                        key="rightField"
                                        balance={formStore.formattedRightBalance}
                                        disabled={formStore.isProcessing}
                                        id="rightField"
                                        isValid={(
                                            formStore.isCalculating
                                            || formStore.isProcessing
                                            || formStore.isRightAmountValid
                                        )}
                                        nativeCoin={formStore.coinSide === 'rightToken' ? formStore.wallet.coin : undefined}
                                        readOnly={(
                                            formStore.isPreparing
                                            || formStore.isSyncingPool
                                            || formStore.isProcessing
                                        )}
                                        token={formStore.rightToken}
                                        value={formStore.rightAmount}
                                        onChange={form.onChangeRightAmount}
                                        onToggleTokensList={form.showTokensList('rightToken')}
                                    />
                                )}
                            </Observer>

                            <Observer>
                                {() => (
                                    formStore.leftToken !== undefined
                                    && formStore.rightToken !== undefined
                                    && formStore.hasCustomToken
                                        ? (
                                            <CustomTokensAlerts />
                                        ) : null)}
                            </Observer>

                            {/*
                            <Observer>
                                {() => {
                                    switch (true) {
                                        case formStore.route !== undefined:
                                        case formStore.isDepositOneCoinMode:
                                        case formStore.isWithdrawOneCoinMode:
                                            if (formStore.ltrPrice === undefined && formStore.rtlPrice === undefined) {
                                                return null
                                            }
                                            return <SwapPrice key="price" />

                                        default:
                                            return null
                                    }
                                }}
                            </Observer> */}

                            <Observer>
                                {/* {() => (!formStore.isConversionMode ? (
                                    <SwapBill key="bill" />
                                ) : null)} */}
                                {() => (
                                    <SwapBill key="bill" />
                                )}
                            </Observer>
                            <Observer>
                                {() => {
                                    switch (true) {
                                        case formStore.isDepositOneCoinMode || formStore.isWithdrawOneCoinMode:
                                            return <LiquidityStableSwapSubmitButton key="liquidityStableSwapSubmitButton" />

                                        case formStore.isConversionMode:
                                            return <ConversionSubmitButton key="conversionSubmitButton" />

                                        default:
                                            return <SwapSubmitButton key="submitButton" />
                                    }
                                }}
                            </Observer>
                        </div>
                    </div>
                </div>
                {/* <SwapNotation /> */}

            </div>

            <Observer>
                {/* eslint-disable-next-line no-nested-ternary */}
                {() => (formStore.isConfirmationAwait ? (
                    formStore.isComboSwapMode ? (
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
                    isMultiple={formStore.isComboSwapMode}
                    combinedTokenRoot={formStore.wrappedCoinTokenAddress.toString()}
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
                    isMultiple={formStore.isComboSwapMode}
                    combinedTokenRoot={formStore.wrappedCoinTokenAddress.toString()}
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
