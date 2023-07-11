import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import classNames from 'classnames'
import BigNumber from 'bignumber.js'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { TokenIcon } from '@/components/common/TokenIcon'
import { useP2POrderListStoreContext } from '@/modules/LimitOrders/context/P2POrderListStoreContext'
import { LimitBill } from '@/modules/LimitOrders/components/LimitBill'
import { calcSwapDirection } from '@/modules/LimitOrders/utils'
import { useField } from '@/hooks/useField'
import { debug, isGoodBignumber } from '@/utils'

import './index.scss'

const formatOrderAmountToInputValue = (value?: string, decimals?: number): string => (
    new BigNumber(value ?? '')
        .shiftedBy(-(decimals ?? 0))
        .toFixed()
)


const disabledBtnText = (
    { isOverValuate, isEnoughWalletBalance }:
        { isOverValuate: boolean, isEnoughWalletBalance: boolean },
): string => {
    switch (true) {
        case isOverValuate:
            return 'P2P_LIMIT_ORDER_OVER_VALUE'
        case !isEnoughWalletBalance:
            return 'P2P_LIMIT_ORDER_WALLET_BALANCE_NOT_ENOUGH'
        default:
            return 'SWAP_BTN_TEXT_ENTER_AN_AMOUNT'
    }
}

function LimitOrderCloseConfirm(): JSX.Element {
    const intl = useIntl()

    const p2pOrderList = useP2POrderListStoreContext()

    const {
        currentSpentAmount,
        receiveTokenRoot,
        spentTokenRoot,
        feeParams,
    } = p2pOrderList.currentLimitOrder || {
        currentReceiveAmount: undefined,
        currentSpentAmount: undefined,
    }
    const leftToken = p2pOrderList.tokensCache.get(receiveTokenRoot)
    const rightToken = p2pOrderList.tokensCache.get(spentTokenRoot)

    const initialOrderReceive = new BigNumber(currentSpentAmount ?? 0).shiftedBy(-(rightToken?.decimals ?? 0)).toFixed()

    const feePercent = feeParams
        ? new BigNumber(feeParams.numerator)
            .div(new BigNumber(feeParams.denominator))
            .times(100)
            .dp(2, BigNumber.ROUND_UP)
            .toFixed()
        : '-'


    const onDismiss = (): void => {
        p2pOrderList.setState('isCloseConfirmationAwait', false)
    }

    const isOverValuate = new BigNumber(p2pOrderList.currentLimitOrderSpent)
        .gt(new BigNumber(p2pOrderList.initialCurrentLimitOrderSpentMax ?? ''))
        || new BigNumber(p2pOrderList.currentLimitOrderReceive)
            .gt(new BigNumber(initialOrderReceive ?? ''))

    const isEnoughWalletBalance = leftToken?.balance
        ? !(new BigNumber(p2pOrderList.currentLimitOrderSpent)
            .gt(new BigNumber(leftToken?.balance ?? '')
                .shiftedBy(-(leftToken?.decimals || 0))))
        : true

    const onChangeLeftAmount = async (value: string): Promise<void> => {
        await p2pOrderList.changeLeftOrderAmount(value)
    }

    const isValidValue = isGoodBignumber(p2pOrderList.currentLimitOrderSpent, true)
    && isGoodBignumber(p2pOrderList.currentLimitOrderReceive, true)

    const onSubmit = async (): Promise<void> => {
        if (isOverValuate || !isEnoughWalletBalance || !isValidValue) {
            return
        }
        p2pOrderList.setState('isCloseConfirmationAwait', false)
        await p2pOrderList.acceptLimitOrder(new BigNumber(p2pOrderList.currentLimitOrderSpent)
            .shiftedBy(leftToken?.decimals || 0).toFixed())
    }

    const leftField = useField({
        decimals: leftToken?.decimals,
        onChange: async (value: string): Promise<void> => {
            await p2pOrderList.changeLeftOrderAmount(value)
        },
        value: p2pOrderList.currentLimitOrderSpent,
    })
    const rightField = useField({
        decimals: rightToken?.decimals,
        onChange: async (value: string) => {
            await p2pOrderList.changeRightOrderAmount(value)
        },
        value: p2pOrderList.currentLimitOrderReceive,
    })
    debug(
        '+++isOverValuate isEnoughWalletBalance isValidValue',
        isOverValuate,
        isEnoughWalletBalance,
        isValidValue,
        p2pOrderList.currentLimitOrderSpent,
        p2pOrderList.initialCurrentLimitOrderSpentMax,
        p2pOrderList.currentLimitOrderReceive,
        initialOrderReceive,
    )
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
                <fieldset
                    className={classNames('form-fieldset form-fieldset--dark', {
                        // checking: p2p.tokensCache.isTokenUpdatingBalance(token?.root) && !props.disabled,
                        invalid: isOverValuate
                            || !isEnoughWalletBalance
                            || !isGoodBignumber(p2pOrderList.currentLimitOrderSpent, true),
                    })}
                >
                    <div className="form-fieldset__header">
                        <div>
                            {intl.formatMessage({
                                id: 'P2P_FIELD_LABEL_LEFT',
                            })}
                        </div>
                        <div className="btn form-drop form-drop-extra">
                            <span className="form-drop__logo">
                                <TokenIcon
                                    address={leftToken?.root}
                                    icon={leftToken?.icon}
                                    name={leftToken?.symbol}
                                    size="small"
                                />
                            </span>
                            <span className="form-drop__name">
                                {leftToken?.symbol}
                            </span>
                        </div>
                    </div>
                    <div className="form-fieldset__main">
                        <input
                            autoComplete="off"
                            className="form-input"
                            type="text"
                            inputMode="decimal"
                            pattern="^[0-9]*[.]?[0-9]*$"
                            placeholder="0.0"
                            value={p2pOrderList.currentLimitOrderSpent}
                            onChange={leftField.onChange}
                            onBlur={leftField.onBlur}
                        />
                        <div className="form-fieldset__footer">
                            <div className="form-fieldset__footer-inner">
                                <Button
                                    key="max-button"
                                    className="form-btn-max"
                                    // disabled={props.disabled}
                                    size="xs"
                                    type="link"
                                    onClick={async () => {
                                        const balanceBN = new BigNumber(leftToken?.balance ?? 0)
                                        const initialCurrentLimitOrderSpent = new BigNumber(
                                            p2pOrderList.initialCurrentLimitOrderSpent ?? 0,
                                        )
                                        const newValue = balanceBN.lt(initialCurrentLimitOrderSpent)
                                            ? balanceBN.toFixed()
                                            : initialCurrentLimitOrderSpent.toFixed()
                                        await onChangeLeftAmount(newValue)
                                    }}
                                >
                                    Max
                                </Button>
                                <div key="token-balance" className="swap-field-balance truncate">
                                    {intl.formatMessage({
                                        id: 'SWAP_FIELD_TOKEN_WALLET_BALANCE',
                                    }, {
                                        balance: formatOrderAmountToInputValue(leftToken?.balance, leftToken?.decimals),
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </fieldset>

                <fieldset
                    className={classNames('form-fieldset form-fieldset--small form-fieldset--dark', {
                        invalid: isOverValuate || !new BigNumber(p2pOrderList.currentLimitOrderReceive).gt(0),
                    })}
                >
                    <div className="form-fieldset__header">
                        <div>
                            {intl.formatMessage({
                                id: 'P2P_FIELD_LABEL_RIGHT',
                            })}
                        </div>
                    </div>
                    <div className="form-fieldset__main">
                        <input
                            autoComplete="off"
                            className="form-input"
                            type="text"
                            inputMode="decimal"
                            pattern="^[0-9]*[.]?[0-9]*$"
                            placeholder="0.0"
                            value={p2pOrderList.currentLimitOrderReceive}
                            onChange={rightField.onChange}
                            onBlur={rightField.onBlur}
                        />
                        <div className="btn form-drop form-drop-extra">
                            <span className="form-drop__logo">
                                <TokenIcon
                                    address={rightToken?.root}
                                    icon={rightToken?.icon}
                                    name={rightToken?.symbol}
                                    size="small"
                                />
                            </span>
                            <span className="form-drop__name">
                                {rightToken?.symbol}
                            </span>
                        </div>

                    </div>
                </fieldset>

                {/* {isWarning
                    && (
                        <div className="alert">
                            <div>
                                <p>
                                    Are you sure you want to exchange tokens at this rate?
                                    Please note that it is too low compared to the market rate of the token.
                                </p>
                            </div>
                        </div>
                    )} */}
                <LimitBill
                    key="bill"
                    leftAmount={formatOrderAmountToInputValue(
                        p2pOrderList.currentLimitOrder?.expectedReceiveAmount,
                        leftToken?.decimals,
                    )}
                    leftToken={leftToken}
                    rightAmount={formatOrderAmountToInputValue(
                        p2pOrderList.currentLimitOrder?.currentSpentAmount,
                        rightToken?.decimals,
                    )}
                    rightToken={rightToken}
                    rateDirection={calcSwapDirection(
                        p2pOrderList.leftToken?.root !== leftToken?.root,
                        p2pOrderList.rateDirection,
                    )}
                    toggleRateDirection={p2pOrderList.toggleRateDirection}
                    fee={`${p2pOrderList.currentLimitOrderFee} ${leftToken?.symbol}`}
                    feePercent={feePercent}
                />
                {(isOverValuate || !isEnoughWalletBalance || !isValidValue)
                    ? (
                        <Button
                            block
                            size="lg"
                            type="primary"
                            disabled
                        >
                            {intl.formatMessage({
                                id: disabledBtnText({ isEnoughWalletBalance, isOverValuate }),
                            })}
                        </Button>
                    )
                    : (
                        <Button
                            block
                            size="lg"
                            type="primary"
                            // disabled={isChanged}
                            onClick={onSubmit}
                        >
                            {intl.formatMessage({
                                id: 'SWAP_BTN_TEXT_CONFIRM_SUBMIT',
                            })}
                        </Button>
                    )}
            </div>
        </div>,
        document.body,
    )
}


export const LimitOrderCloseConfirmPopup = observer(LimitOrderCloseConfirm)
