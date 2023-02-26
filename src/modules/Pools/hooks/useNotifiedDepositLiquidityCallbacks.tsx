import * as React from 'react'
import classNames from 'classnames'
import { useIntl } from 'react-intl'
import { toast } from 'react-toastify'

import { TransactionExplorerLink } from '@/components/common/TransactionExplorerLink'
import type { LiquidityStablePoolDepositCallbacks } from '@/misc'
import { TokensReceivedSuccess } from '@/modules/Liqudity/components/Notifications/TokensReceivedSuccess'
import { notify, NotifyType } from '@/modules/Notification'
import type { DepositLiquidityCallbacks } from '@/modules/Pools/types'
import { formattedTokenAmount, isMobile, stopEventPropagate } from '@/utils'


export function useNotifiedDepositLiquidityCallbacks(
    props: LiquidityStablePoolDepositCallbacks,
): DepositLiquidityCallbacks {
    const intl = useIntl()

    const {
        onSend: onSendCallback,
        onTransactionFailure: onTransactionFailureCallback,
        onTransactionSuccess: onTransactionSuccessCallback,
    } = props

    const onSend = React.useCallback<Required<DepositLiquidityCallbacks>['onSend']>((message, params) => {
        onSendCallback?.(message, params)
        notify(
            <div className="notification-body">
                {intl.formatMessage({ id: 'LIQUIDITY_ADD_NOTIFICATION_PENDING_DEPOSIT_LIQUIDITY_NOTE' })}
            </div>,
            intl.formatMessage({ id: 'LIQUIDITY_ADD_NOTIFICATION_PENDING_DEPOSIT_LIQUIDITY_TITLE' }),
            {
                autoClose: false,
                closeOnClick: false,
                isLoading: true,
                toastId: `toast__${params.callId}`,
                type: NotifyType.INFO,
            },
        )
    }, [onSendCallback])

    const onTransactionSuccess = React.useCallback<Required<DepositLiquidityCallbacks>['onTransactionSuccess']>((result, receipt) => {
        onTransactionSuccessCallback?.(result, receipt)

        const amount = receipt?.amount ?? result.input.result.lp_reward

        notify(
            receipt?.receivedRoot === undefined
                ? (
                    <>
                        <div className="notification-body">
                            {intl.formatMessage(
                                { id: 'LIQUIDITY_ADD_NOTIFICATION_SUCCESS_DEPOSIT_LIQUIDITY_NOTE' },
                                {
                                    amount: formattedTokenAmount(amount, receipt?.receivedDecimals),
                                    symbol: receipt?.receivedSymbol ?? '',
                                },
                            )}
                        </div>
                        <div
                            className={classNames('notification-actions', {
                                'notification-actions--large': isMobile(navigator.userAgent),
                            })}
                        >
                            <TransactionExplorerLink
                                className={isMobile(navigator.userAgent) ? 'btn btn-link' : 'btn btn-secondary'}
                                id={result.transaction.id.hash}
                                onClick={stopEventPropagate}
                            >
                                {intl.formatMessage({
                                    id: 'LIQUIDITY_ADD_NOTIFICATION_TRANSACTION_DETAILS_LINK_TXT',
                                })}
                            </TransactionExplorerLink>
                        </div>
                    </>
                ) : (
                    <TokensReceivedSuccess
                        address={receipt.receivedRoot}
                        amount={amount}
                        decimals={receipt.receivedDecimals}
                        icon={receipt.receivedIcon}
                        symbol={receipt.receivedSymbol}
                        txHash={receipt.hash ?? result.transaction.id.hash}
                    />
                ),
            intl.formatMessage({ id: 'LIQUIDITY_ADD_NOTIFICATION_SUCCESS_DEPOSIT_LIQUIDITY_TITLE' }),
            {
                closeOnClick: true,
                isLoading: false,
                toastId: `toast__${result.callId}`,
                type: NotifyType.SUCCESS,
                update: toast.isActive(`toast__${result.callId}`),
            },
        )
    }, [onTransactionSuccessCallback])

    const onTransactionFailure = React.useCallback<Required<DepositLiquidityCallbacks>['onTransactionFailure']>(reason => {
        onTransactionFailureCallback?.(reason)
        notify(
            <>
                <div className="notification-body">
                    {reason.message}
                </div>
                {reason.transaction?.id.hash !== undefined && (
                    <div
                        className={classNames('notification-actions', {
                            'notification-actions--large': isMobile(navigator.userAgent),
                        })}
                    >
                        <TransactionExplorerLink
                            className={isMobile(navigator.userAgent) ? 'btn btn-link' : 'btn btn-secondary'}
                            id={reason.transaction.id.hash}
                            onClick={stopEventPropagate}
                        >
                            {intl.formatMessage({
                                id: 'LIQUIDITY_ADD_NOTIFICATION_TRANSACTION_DETAILS_LINK_TXT',
                            })}
                        </TransactionExplorerLink>
                    </div>
                )}
            </>,
            intl.formatMessage({ id: 'LIQUIDITY_ADD_NOTIFICATION_FAILURE_DEPOSIT_LIQUIDITY_TITLE' }),
            {
                closeOnClick: true,
                isLoading: false,
                toastId: `toast__${reason.callId}`,
                type: NotifyType.WARNING,
                update: toast.isActive(`toast__${reason.callId}`),
            },
        )
    }, [onTransactionFailureCallback])

    return {
        onSend,
        onTransactionFailure,
        onTransactionSuccess,
    }
}
