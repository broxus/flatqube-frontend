import * as React from 'react'
import * as ReactDOM from 'react-dom'
// import { reaction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import classNames from 'classnames'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { TokenIcon } from '@/components/common/TokenIcon'
import { useP2POrderListStoreContext } from '@/modules/LimitOrders/context/P2POrderListStoreContext'
import { formattedTokenAmount, sliceAddress } from '@/utils'
import { OrderRate } from '@/modules/LimitOrders/components/OrderRate'
import { BuySellSwitch } from '@/modules/LimitOrders/types'
import { calcSwapDirection } from '@/modules/LimitOrders/utils'

import './index.scss'

function LimitOrderCancelConfirm(): JSX.Element {
    const intl = useIntl()

    const p2pOrderList = useP2POrderListStoreContext()

    const {
        currentSpentAmount,
        currentReceiveAmount,
        receiveTokenRoot,
        spentTokenRoot,
        accountAddr,
        expectedReceiveAmount,
        initialSpentAmount,
    } = p2pOrderList.currentLimitOrder || {
        currentReceiveAmount: undefined,
        currentSpentAmount: undefined,
        ownerAddress: undefined,
    }
    const spentToken = p2pOrderList.tokensCache.get(spentTokenRoot)
    const receiveToken = p2pOrderList.tokensCache.get(receiveTokenRoot)

    const onDismiss = (): void => {
        p2pOrderList.setState('isCancelConfirmationAwait', false)
    }

    const onSubmit = async (): Promise<void> => {
        p2pOrderList.setState('isCancelConfirmationAwait', false)
        await p2pOrderList.cancelLimitOrder()
    }
    const orderType = p2pOrderList.leftToken?.root === spentTokenRoot ? BuySellSwitch.SELL : BuySellSwitch.BUY

    return ReactDOM.createPortal(
        <div className="popup">
            <div onClick={onDismiss} className="popup-overlay" />
            <div className="popup__wrap popup__wrap-confirm-p2p">
                <Button
                    type="icon"
                    onClick={onDismiss}
                    className="popup-close"
                >
                    <Icon icon="close" />
                </Button>
                <h2 className="popup-title">
                    {intl.formatMessage({
                        id: 'P2P_POPUP_ANNULATE_TITLE',
                    })}
                </h2>
                <div className="order-info">
                    <div className="list-bill__row">
                        <h3 className="order-title">
                            Order info
                        </h3>
                    </div>
                    <div key="hash" className="list-bill__row">
                        <div className="list-bill__info">
                            <span>
                                {intl.formatMessage({
                                    id: 'P2P_CONFIRM_LABEL_ADDRESS',
                                })}
                            </span>
                        </div>
                        <div className="list-bill__val">
                            <a
                                target="_blank"
                                href={`https://everscan.io/accounts/${accountAddr || ''}`} rel="noreferrer"
                            >
                                {sliceAddress(accountAddr)}
                            </a>
                        </div>
                    </div>
                    <div key="pair" className="list-bill__row">
                        <div className="list-bill__info">
                            <span>
                                {intl.formatMessage({
                                    id: 'P2P_CONFIRM_LABEL_PAIR',
                                })}
                            </span>
                            <span className="list-bill__icn">
                                <Icon icon="info" />
                            </span>
                        </div>
                        <div className="bill-flex-row">
                            <div className="list-bill__val">
                                {receiveToken?.symbol}
                                /
                                {spentToken?.symbol}
                                {' '}
                            </div>
                            <div className={classNames({
                                'icon-buy': orderType === BuySellSwitch.BUY,
                                'icon-sell': orderType === BuySellSwitch.SELL,
                            })}
                            >
                                {orderType === BuySellSwitch.BUY
                                    ? 'Buy'
                                    : 'Sell'}
                            </div>
                        </div>
                    </div>
                    <div key="price" className="list-bill__row">
                        <div className="list-bill__info">
                            <span>
                                {intl.formatMessage({
                                    id: 'P2P_BILL_LABEL_RATE',
                                })}
                            </span>
                            <span className="list-bill__icn">
                                <Icon icon="info" />
                            </span>
                        </div>
                        <OrderRate
                            leftAmount={currentSpentAmount} // new BigNumber(currentSpentAmount || '').shiftedBy(spentToken?.decimals || 0).toFixed()}
                            leftToken={spentToken}
                            rightAmount={currentReceiveAmount} // new BigNumber(currentReceiveAmount || '').shiftedBy(receiveToken?.decimals || 0).toFixed()}
                            rightToken={receiveToken}
                            inverse
                            rateDirection={calcSwapDirection(
                                p2pOrderList.leftToken?.root === spentToken?.root,
                                p2pOrderList.rateDirection,
                            )}
                            toggleRateDirection={p2pOrderList.toggleRateDirection}
                        />
                    </div>

                    <div key="sell" className="list-bill__row">
                        <div className="list-bill__info">
                            <span>
                                {intl.formatMessage({
                                    id: 'P2P_CONFIRM_LABEL_AMOUNT_YOU_SELL',
                                })}
                            </span>
                        </div>
                        <div className="list-bill__val">
                            {formattedTokenAmount(initialSpentAmount, spentToken?.decimals)}
                            {' '}
                            {spentToken?.symbol}
                        </div>
                    </div>
                    <div key="buy" className="list-bill__row">
                        <div className="list-bill__info">
                            <span>
                                {intl.formatMessage({
                                    id: 'P2P_CONFIRM_LABEL_AMOUNT_YOU_BUY',
                                })}
                            </span>
                        </div>
                        <div className="list-bill__val">
                            {formattedTokenAmount(expectedReceiveAmount, receiveToken?.decimals)}
                            {' '}
                            {receiveToken?.symbol}
                        </div>
                    </div>
                </div>
                <div className="order-info">
                    <div key="receive" className="list-bill__row">
                        <h2 className="popup-title">
                            {intl.formatMessage({
                                id: 'P2P_CONFIRM_LABEL_AMOUNT_YOU_RECEIVE',
                            })}
                        </h2>
                        <div className="bill-flex-row flex-gap">
                            <TokenIcon
                                address={spentToken?.root}
                                icon={spentToken?.icon}
                                name={spentToken?.symbol}
                                size="small"
                            />
                            {' '}
                            <h2 className="popup-title">
                                {formattedTokenAmount(currentSpentAmount, spentToken?.decimals)}
                                {' '}
                                {spentToken?.symbol}
                            </h2>
                        </div>
                    </div>
                </div>
                <div className="popup__wrap-confirm-p2p-flex-row">
                    <Button
                        block
                        size="lg"
                        type="secondary"
                        // disabled={isChanged}
                        onClick={onDismiss}
                    >
                        {intl.formatMessage({
                            id: 'ORDER_LIST_BUTTON_CANCEL_ORDER',
                        })}
                    </Button>
                    <Button
                        block
                        size="lg"
                        type="primary"
                        // disabled={isChanged}
                        onClick={onSubmit}
                        className="small"
                    >
                        {intl.formatMessage({
                            id: 'P2P_POPUP_ANNULATE_CONFIRM',
                        })}
                    </Button>

                </div>

            </div>
        </div>,
        document.body,
    )
}

export const LimitOrderCancelConfirmPopup = observer(LimitOrderCancelConfirm)
