import * as React from 'react'
import { useIntl } from 'react-intl'
import classNames from 'classnames'
import { Observer } from 'mobx-react-lite'
import { reaction } from 'mobx'
import { Link, useParams } from 'react-router-dom'

import { useLimitForm } from '@/modules/LimitOrders/hooks/useLimitForm'
import { TokensList } from '@/modules/TokensList'
import { TokenImportPopup } from '@/modules/TokensList/components'
import {
    error, debounce, debug, storage,
} from '@/utils'
import { Icon } from '@/components/common/Icon'
import { LimitField } from '@/modules/LimitOrders/components/LimitField'
import { MakeOrderButton } from '@/modules/LimitOrders/components/MakeOrderButton/MakeOrderButton'
import { LimitOrderCreateConfirmPopup } from '@/modules/LimitOrders/components/LimitOrderCreateConfirmPopup'
import { LimitFieldMarketPrice } from '@/modules/LimitOrders/components/LimitFieldMarketPrice'
import { LimitSettings } from '@/modules/LimitOrders/components/LimitSettings'
import { useP2PFormStoreContext } from '@/modules/LimitOrders/context/P2PFormStoreContext'
import { Side } from '@/modules/LimitOrders/types'
import { SwapDirection } from '@/modules/Swap/types'
import { NativeScrollArea } from '@/components/common/NativeScrollArea'
import { appRoutes, URLTokensParams } from '@/routes'
import { WEVERRootAddress } from '@/config'
import { LocalStorageSwapAmounts } from '@/misc'
import { CustomTokensAlerts } from '@/modules/LimitOrders/components/CustomTokensAlerts'

import './index.scss'

type Props = {
    onChangeLeftAmount?: (value: string, side?: Side) => void;
    onChangeRightAmount?: (value: string, side?: Side) => void;
}

export function LimitOrderForm({
    onChangeLeftAmount,
    onChangeRightAmount,
}: Props): JSX.Element {
    const intl = useIntl()

    const p2pFormStore = useP2PFormStoreContext()
    const form = useLimitForm()
    const { leftTokenRoot, rightTokenRoot } = useParams<URLTokensParams>()

    const onLeftImportConfirm = React.useCallback((value: string) => {
        form.onLeftImportConfirm(value, rightTokenRoot)
    }, [leftTokenRoot, rightTokenRoot])

    const onRightImportConfirm = React.useCallback((value: string) => {
        if (leftTokenRoot) {
            form.onRightImportConfirm(leftTokenRoot, value)
        }
    }, [leftTokenRoot, rightTokenRoot])

    React.useEffect(() => {
        p2pFormStore.setState('isPreparing', p2pFormStore.wallet.isInitializing || !p2pFormStore.tokensCache.isReady)
        const tokensListDisposer = reaction(
            () => p2pFormStore.tokensCache.isReady,
            async isReady => {
                if (isReady) {
                    try {
                        await form.resolveStateFromUrl(leftTokenRoot, rightTokenRoot)
                        await p2pFormStore.init()
                    }
                    catch (e) { }
                }
            },
            { fireImmediately: true },
        )

        return () => {
            tokensListDisposer()
            p2pFormStore.dispose().catch(error)
        }
    }, [])
    const onToggleTokens = debounce(() => form.toggleSwapDirection?.(), 300)
    const handleChangeAmount = (value: string, side: Side): void => {
        p2pFormStore.setState('lastAmountChangeSide', side)
        if (side === Side.LEFT) {
            if (onChangeLeftAmount) {
                onChangeLeftAmount(value)
            }
            else {
                p2pFormStore.changeLeftAmount(value)
            }
        }
        else if (onChangeRightAmount) {
            onChangeRightAmount(value)
        }
        else {
            p2pFormStore.changeRightAmount(value)
        }
    }
    const handleChangePrice = (price: string): void => {
        p2pFormStore.changePriceAmount(price)
    }
    return (
        <>
            <header className="card__header">
                <Observer>
                    {() => {
                        const isCombined = WEVERRootAddress.toString() === p2pFormStore.leftToken?.root
                            .toString()
                        const swapRoute = appRoutes.swap.makeUrl({
                            leftTokenRoot: isCombined ? 'combined' : p2pFormStore.leftToken?.root.toString(),
                            rightTokenRoot: p2pFormStore.leftToken?.root.toString()
                                ? p2pFormStore.rightToken?.root.toString()
                                : undefined,
                        })
                        return (
                            <NativeScrollArea>
                                <ul className="tabs">
                                    <li>
                                        <Link
                                            to={swapRoute}
                                            onClick={() => {
                                                const storageData: LocalStorageSwapAmounts = {
                                                    side: p2pFormStore.lastAmountChangeSide === Side.LEFT ? 'ltr' : 'rtl',
                                                    ...p2pFormStore.lastAmountChangeSide === Side.LEFT
                                                        ? { leftAmount: p2pFormStore.leftAmount ?? '' }
                                                        : { rightAmount: p2pFormStore.rightAmount ?? '' },
                                                }
                                                debug('storageData', storageData)
                                                storage.set(
                                                    'amounts',
                                                    JSON.stringify(storageData),
                                                )
                                            }}
                                        >
                                            {intl.formatMessage({ id: 'NAV_LINK_TEXT_SWAP' })}
                                        </Link>
                                    </li>
                                    <li
                                        className="active"
                                        style={({
                                            fontWeight: 500,
                                            letterSpacing: '0.25px',
                                            lineHeight: '20px',
                                        })}
                                    >
                                        {intl.formatMessage({
                                            id: 'P2P_HEADER_TITLE',
                                        })}
                                    </li>
                                </ul>
                            </NativeScrollArea>
                        )
                    }}
                </Observer>
                <LimitSettings />
            </header>
            <div className="form">
                <Observer>
                    {() => (
                        <LimitField
                            key="leftField"
                            balance={p2pFormStore.formattedLeftBalance}
                            disabled={p2pFormStore.isLoading || p2pFormStore.isLimitOrderCreating}
                            id="leftField"
                            isValid={(
                                p2pFormStore.isFetching
                                    || p2pFormStore.isLeftAmountValid
                            )}
                            nativeCoin={undefined}
                            readOnly={(
                                p2pFormStore.isPreparing
                                    || p2pFormStore.isLimitOrderCreating
                            )}
                            showMaximizeButton={p2pFormStore.leftBalanceNumber.gt(0)}
                            token={p2pFormStore.leftToken}
                            value={p2pFormStore.leftAmount}
                            onChange={(val: string) => handleChangeAmount(val, Side.LEFT)}
                            onMaximize={p2pFormStore.maximizeLeftAmount}
                            onToggleTokensList={form.showTokensList('leftToken')}
                        />
                    )}
                </Observer>
                <Observer>
                    {() => (
                        <div
                            className={classNames('limit-icon', {
                                disabled: (
                                    p2pFormStore.isLimitOrderCreating
                                    || p2pFormStore.isLoading
                                ),
                            })}
                            onClick={onToggleTokens}
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
                        <LimitField
                            key="rightField"
                            balance={p2pFormStore.formattedRightBalance}
                            disabled={p2pFormStore.isFetching || p2pFormStore.isLimitOrderCreating}
                            id="rightField"
                            isValid={p2pFormStore.isRightAmountLteTotalSupply}
                            readOnly={(
                                p2pFormStore.isPreparing
                                || p2pFormStore.isLimitOrderCreating
                            )}
                            token={p2pFormStore.rightToken}
                            value={p2pFormStore.rightAmount}
                            onChange={(val: string) => handleChangeAmount(val, Side.RIGHT)}
                            onToggleTokensList={form.showTokensList('rightToken')}
                        />
                    )}
                </Observer>
                <Observer>
                    {() => (
                        <LimitFieldMarketPrice
                            key="marketPrice"
                            disabled={p2pFormStore.isLoading || p2pFormStore.isLimitOrderCreating}
                            id="marketPrice"
                            readOnly={(
                                p2pFormStore.isPreparing
                                || p2pFormStore.isLimitOrderCreating
                            )}
                            value={p2pFormStore.rateDirection === SwapDirection.LTR
                                ? p2pFormStore?.ltrPrice ?? ''
                                : p2pFormStore?.rtlPrice ?? ''}
                            onChange={handleChangePrice}
                            onMarketPrice={async () => {
                                await p2pFormStore.fetchCurrencies()
                                if (p2pFormStore.lastAmountChangeSide === Side.LEFT) {
                                    p2pFormStore.changeLeftAmount(p2pFormStore.leftAmount)
                                }
                                else {
                                    p2pFormStore.changeRightAmount(p2pFormStore.rightAmount)
                                }
                            }}
                        />
                    )}
                </Observer>
                <Observer>
                    {() => (p2pFormStore.hasCustomToken ? (
                        <CustomTokensAlerts />
                    ) : null)}
                </Observer>
                <Observer>
                    {() => (!p2pFormStore.isLimitOrderRootDeployed
                        && p2pFormStore.wallet.isConnected
                        && p2pFormStore.isLimitOrderRootLoading !== undefined
                        && !p2pFormStore.isLimitOrderRootLoading
                        && !p2pFormStore.isBusy
                        && p2pFormStore.leftToken !== undefined
                        ? (
                            <div className="info">
                                <div>
                                    <p>
                                        {p2pFormStore.leftToken?.symbol}
                                        {' '}
                                        token should be deployed
                                        to have an opportunity to make limit orders.
                                    </p>
                                </div>
                            </div>
                        )
                        : <div className="empty-info" />)}
                </Observer>
                <Observer key="MakeOrderButton">
                    {() => <MakeOrderButton />}
                </Observer>
                <Observer>
                    {() => (p2pFormStore.isCreateConfirmationAwait ? (
                        <LimitOrderCreateConfirmPopup key="isCreateConfirmationAwait" />
                    ) : null
                    )}
                </Observer>


            </div>
            {(form.isTokenListShown && form.tokenSide === 'leftToken') && (
                <TokensList
                    key="leftTokensList"
                    currentToken={p2pFormStore.leftToken}
                    currentTokenSide="leftToken"
                    onDismiss={form.hideTokensList}
                    onSelectToken={form.onSelectLeftToken}
                />
            )}

            {(form.isTokenListShown && form.tokenSide === 'rightToken') && (
                <TokensList
                    key="rightTokensList"
                    allowMultiple={false}
                    currentToken={p2pFormStore.rightToken}
                    currentTokenSide="rightToken"
                    onDismiss={form.hideTokensList}
                    onSelectToken={form.onSelectRightToken}
                />
            )}

            <Observer>
                {() => (
                    <>
                        {(p2pFormStore.tokensCache.isImporting && form.tokenSide === 'leftToken') && (
                            <TokenImportPopup
                                key="tokenImportLeft"
                                onImportConfirm={onLeftImportConfirm}
                            />
                        )}
                        {(p2pFormStore.tokensCache.isImporting && form.tokenSide === 'rightToken') && (
                            <TokenImportPopup
                                key="tokenImportRight"
                                onImportConfirm={onRightImportConfirm}
                            />
                        )}
                        {(p2pFormStore.tokensCache.isImporting && form.tokenSide === undefined) && (
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
