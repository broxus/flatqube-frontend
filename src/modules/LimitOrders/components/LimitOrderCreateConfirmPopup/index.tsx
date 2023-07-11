import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { TokenIcon } from '@/components/common/TokenIcon'
import { useP2PFormStoreContext } from '@/modules/LimitOrders/context/P2PFormStoreContext'
import { LimitBill } from '@/modules/LimitOrders/components/LimitBill'
import { calcSwapDirection } from '@/modules/LimitOrders/utils'

import './index.scss'


function LimitOrderCreateConfirm(): JSX.Element {
    const intl = useIntl()

    const p2pFormStore = useP2PFormStoreContext()

    const [isWarning] = React.useState(false) // setWarning
    const [isChanged] = React.useState(false) // setChangedTo

    const onDismiss = (): void => {
        p2pFormStore.setState('isCreateConfirmationAwait', false)
    }

    const onSubmit = async (): Promise<void> => {
        p2pFormStore.setState('isCreateConfirmationAwait', false)
        await p2pFormStore.makeLimitOrder()
    }

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
                        id: 'SWAP_POPUP_CONFORMATION_TITLE',
                    })}
                </h2>

                <fieldset className="form-fieldset form-fieldset--small form-fieldset--dark">
                    <div className="form-fieldset__header">
                        <div>
                            {intl.formatMessage({
                                id: 'SWAP_FIELD_LABEL_LEFT',
                            })}
                        </div>
                    </div>
                    <div className="form-fieldset__main">
                        <input
                            className="form-input"
                            readOnly
                            type="text"
                            value={p2pFormStore.leftAmount}
                        />
                        <div className="btn form-drop form-drop-extra">
                            <span className="form-drop__logo">
                                <TokenIcon
                                    address={p2pFormStore.leftToken?.root}
                                    icon={p2pFormStore.leftToken?.icon}
                                    name={p2pFormStore.leftToken?.symbol}
                                    size="small"
                                />
                            </span>
                            <span className="form-drop__name">
                                {p2pFormStore.leftToken?.symbol}
                            </span>
                        </div>

                    </div>
                </fieldset>

                <fieldset className="form-fieldset form-fieldset--small form-fieldset--dark">
                    <div className="form-fieldset__header">
                        <div>
                            {intl.formatMessage({
                                id: 'SWAP_FIELD_LABEL_RIGHT',
                            })}
                        </div>
                    </div>
                    <div className="form-fieldset__main">
                        <input
                            className="form-input"
                            readOnly
                            type="text"
                            value={p2pFormStore.rightAmount}
                        />
                        <div className="btn form-drop form-drop-extra">
                            <span className="form-drop__logo">
                                <TokenIcon
                                    address={p2pFormStore.rightToken?.root}
                                    name={p2pFormStore.rightToken?.symbol}
                                    size="small"
                                    icon={p2pFormStore.rightToken?.icon}
                                />
                            </span>
                            <span className="form-drop__name">
                                {p2pFormStore.rightToken?.symbol}
                            </span>
                        </div>

                    </div>
                </fieldset>

                {/* {isChanged ? (
                    <div className="alert">
                        <div>
                            <strong>Update a rate to swap the tokens</strong>
                            <p>
                                The rate has changed. You can’t swap the tokens at the previous rate.
                            </p>
                        </div>
                        <div>
                            <Button
                                size="xs"
                                type="ghost"
                                onClick={onUpdate}
                            >
                                Update a rate
                            </Button>
                        </div>
                    </div>
                ) : (
                    <SwapBill
                        key="bill"
                        fee={formStore.swap.fee}
                        isCrossExchangeAvailable={formStore.isCrossExchangeAvailable}
                        isCrossExchangeMode={formStore.isCrossExchangeMode}
                        leftToken={formStore.leftToken}
                        minExpectedAmount={minExpectedAmount}
                        priceImpact={formStore.swap.priceImpact}
                        rightToken={formStore.rightToken}
                        slippage={formStore.swap.slippage}
                        tokens={formStore.route?.tokens}
                    />
                )} */}
                {isWarning
                    && (
                        <div className="alert">
                            <div>
                                <p>
                                    Are you sure you want to exchange tokens at this rate?
                                    Please note that it is too low compared to the market rate of the token.
                                </p>
                            </div>
                        </div>
                    )}
                <LimitBill
                    key="bill"
                    leftAmount={p2pFormStore.leftAmount}
                    leftToken={p2pFormStore.leftToken}
                    rightAmount={p2pFormStore.rightAmount}
                    rightToken={p2pFormStore.rightToken}
                    rateDirection={calcSwapDirection(false, p2pFormStore.rateDirection)}
                    toggleRateDirection={p2pFormStore.toggleRateDirection}
                />
                <Button
                    block
                    size="lg"
                    type="primary"
                    disabled={isChanged}
                    onClick={onSubmit}
                >
                    {intl.formatMessage({
                        id: 'SWAP_BTN_TEXT_CONFIRM_SUBMIT',
                    })}
                </Button>
            </div>
        </div>,
        document.body,
    )
}


export const LimitOrderCreateConfirmPopup = observer(LimitOrderCreateConfirm)
