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
import { truncateDecimals } from '@/utils'
import { calcSwapDirection } from '@/modules/LimitOrders/utils'

import './index.scss'

const formatOrderAmountToInputValue = (value?: string, decimals?: number): string => (
    new BigNumber(value ?? '')
        .shiftedBy(-(decimals ?? 0))
        .toFixed()
)


const disabledBtnText = (
    { isOverValuate, isWalletBalanceNotEnough }:
        { isOverValuate: boolean, isWalletBalanceNotEnough: boolean },
): string => {
    switch (true) {
        case isOverValuate:
            return 'P2P_LIMIT_ORDER_OVER_VALUE'
        case isWalletBalanceNotEnough:
            return 'P2P_LIMIT_ORDER_WALLET_BALANCE_NOT_ENOUGH'
        default:
            return 'SWAP_BTN_TEXT_ENTER_AN_AMOUNT'
    }
}

function LimitOrderCloseConfirm(): JSX.Element {
    const intl = useIntl()

    const p2pOrderList = useP2POrderListStoreContext()

    const [isWarning] = React.useState(false) // setWarning
    const [isChanged] = React.useState(false) // setIsChanged

    const {
        currentSpentAmount: currentRightAmount,
        currentReceiveAmount: currentLeftAmount,
        receiveTokenRoot,
        spentTokenRoot,
    } = p2pOrderList.currentLimitOrder || {
        currentReceiveAmount: undefined,
        currentSpentAmount: undefined,
    }
    const leftToken = p2pOrderList.tokensCache.get(receiveTokenRoot)
    const [leftAmount, setLeftAmount] = React.useState(
        formatOrderAmountToInputValue(currentLeftAmount, leftToken?.decimals),
    )

    const rightToken = p2pOrderList.tokensCache.get(spentTokenRoot)
    const [rightAmount, setRightAmount] = React.useState(
        formatOrderAmountToInputValue(currentRightAmount, rightToken?.decimals),
    )

    const calcBuyBySell = (sell?: string): BigNumber => new BigNumber(sell ?? '')
        .shiftedBy(leftToken?.decimals || 0)
        .dividedBy(currentLeftAmount ?? 1)
        .times(currentRightAmount ?? 1)
        .shiftedBy(-1 * (rightToken?.decimals || 0))
        .dp((rightToken?.decimals || 0), BigNumber.ROUND_HALF_DOWN)

    const calcSellByBuy = (buy?: string): BigNumber => new BigNumber(buy ?? '')
        .shiftedBy(rightToken?.decimals || 0)
        .dividedBy(currentRightAmount ?? 1)
        .times(currentLeftAmount ?? 1)
        .shiftedBy(-1 * (leftToken?.decimals || 0))
        .dp(leftToken?.decimals || 0, BigNumber.ROUND_HALF_DOWN)

    const onDismiss = (): void => {
        p2pOrderList.setState('isCloseConfirmationAwait', false)
    }

    const isOverValuate = new BigNumber(leftAmount)
        .gt(new BigNumber(currentLeftAmount ?? '')
            .shiftedBy(-(leftToken?.decimals || 0)))
        || new BigNumber(rightAmount)
            .gt(new BigNumber(currentRightAmount ?? '')
                .shiftedBy(-(rightToken?.decimals || 0)))

    const isWalletBalanceNotEnough = leftToken?.balance
        ? new BigNumber(leftAmount)
            .gt(new BigNumber(leftToken?.balance ?? '')
                .shiftedBy(-(leftToken?.decimals || 0)))
        : true


    const isInvalidValue = !new BigNumber(leftAmount).gt(0) || !new BigNumber(rightAmount).gt(0)

    const onSubmit = async (): Promise<void> => {
        if (isOverValuate || isWalletBalanceNotEnough || isInvalidValue) {
            return
        }
        p2pOrderList.setState('isCloseConfirmationAwait', false)
        await p2pOrderList.acceptLimitOrder(new BigNumber(leftAmount).shiftedBy(leftToken?.decimals || 0).toFixed())
    }

    const onBlur = (event: React.BaseSyntheticEvent, decimals?: number): void => {
        const { value } = event.target
        if (value.length === 0) {
            return
        }
        const validatedAmount = truncateDecimals(value, decimals)
        if (value !== validatedAmount && validatedAmount != null) {
            // eslint-disable-next-line no-param-reassign
            event.target.value = validatedAmount
        }
        else if (validatedAmount == null) {
            // eslint-disable-next-line no-param-reassign
            event.target.value = ''
        }
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

                <fieldset
                    className={classNames('form-fieldset form-fieldset--small form-fieldset--dark', {
                        // checking: p2p.tokensCache.isTokenUpdatingBalance(token?.root) && !props.disabled,
                        invalid: isOverValuate || isWalletBalanceNotEnough || !new BigNumber(leftAmount).gt(0),
                    })}
                >
                    <div className="form-fieldset__header">
                        <div>
                            {intl.formatMessage({
                                id: 'P2P_FIELD_LABEL_LEFT',
                            })}
                        </div>
                    </div>
                    <div className="form-fieldset__main">
                        <input
                            className="form-input"
                            type="number"
                            value={leftAmount}
                            onChange={e => {
                                setLeftAmount(e.target.value)
                                const newVal = new BigNumber(e.target.value)
                                    .dp(leftToken?.decimals || 0, BigNumber.ROUND_HALF_DOWN)
                                    .toFixed()
                                const calcOtherSide = calcBuyBySell(newVal)
                                setRightAmount(Number.isNaN(calcOtherSide) ? '' : calcOtherSide.toFixed())
                            }}
                            onBlur={e => onBlur(e, leftToken?.decimals)}
                        />
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
                </fieldset>

                <fieldset
                    className={classNames('form-fieldset form-fieldset--small form-fieldset--dark', {
                        invalid: isOverValuate || !new BigNumber(rightAmount).gt(0),
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
                            className="form-input"
                            type="number"
                            value={rightAmount}
                            onChange={e => {
                                setRightAmount(e.target.value)
                                const newVal = new BigNumber(e.target.value)
                                    .dp(rightToken?.decimals || 0, BigNumber.ROUND_HALF_DOWN)
                                    .toFixed()
                                const calcOtherSide = calcSellByBuy(newVal)
                                setLeftAmount(Number.isNaN(calcOtherSide) ? '' : calcOtherSide.toFixed())
                            }}
                            onBlur={e => onBlur(e, rightToken?.decimals)}
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
                    leftAmount={leftAmount}
                    leftToken={leftToken}
                    rightAmount={rightAmount}
                    rightToken={rightToken}
                    rateDirection={calcSwapDirection(
                        p2pOrderList.leftToken?.root !== leftToken?.root,
                        p2pOrderList.rateDirection,
                    )}
                    toggleRateDirection={p2pOrderList.toggleRateDirection}
                />
                {(isOverValuate || isWalletBalanceNotEnough || isInvalidValue)
                    ? (
                        <Button
                            block
                            size="lg"
                            type="primary"
                            disabled
                        >
                            {intl.formatMessage({
                                id: disabledBtnText({ isOverValuate, isWalletBalanceNotEnough }),
                            })}
                        </Button>
                    )
                    : (
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
                    )}
            </div>
        </div>,
        document.body,
    )
}


export const LimitOrderCloseConfirmPopup = observer(LimitOrderCloseConfirm)
