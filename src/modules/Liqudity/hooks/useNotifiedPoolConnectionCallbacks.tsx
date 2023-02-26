import * as React from 'react'
import classNames from 'classnames'
import { useIntl } from 'react-intl'
import { toast } from 'react-toastify'

import { TransactionExplorerLink } from '@/components/common/TransactionExplorerLink'
import type { LiquidityPoolConnectCallbacks } from '@/misc'
import { notify, NotifyType } from '@/modules/Notification'
import { isMobile, stopEventPropagate } from '@/utils'


export function useNotifiedPoolConnectionCallbacks(
    props: LiquidityPoolConnectCallbacks,
): LiquidityPoolConnectCallbacks {
    const intl = useIntl()

    const {
        onSend: onSendCallback,
        onTransactionFailure: onTransactionFailureCallback,
        onTransactionSuccess: onTransactionSuccessCallback,
    } = props

    const onSend = React.useCallback<Required<LiquidityPoolConnectCallbacks>['onSend']>((message, params) => {
        onSendCallback?.(message, params)
        notify(
            <div className="notification-body">
                {intl.formatMessage({ id: 'LIQUIDITY_ADD_NOTIFICATION_PENDING_POOL_CONNECTING_NOTE' })}
            </div>,
            intl.formatMessage({ id: 'LIQUIDITY_ADD_NOTIFICATION_PENDING_POOL_CONNECTING_TITLE' }),
            {
                autoClose: false,
                closeOnClick: false,
                isLoading: true,
                toastId: `toast__${params.callId}`,
                type: NotifyType.INFO,
            },
        )
    }, [onSendCallback])

    const onTransactionSuccess = React.useCallback<Required<LiquidityPoolConnectCallbacks>['onTransactionSuccess']>(result => {
        onTransactionSuccessCallback?.(result)
        notify(
            <>
                <div className="notification-body">
                    {intl.formatMessage(
                        { id: 'LIQUIDITY_ADD_NOTIFICATION_SUCCESS_POOL_CONNECTING_NOTE' },
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
                        {intl.formatMessage({ id: 'LIQUIDITY_ADD_NOTIFICATION_TRANSACTION_DETAILS_LINK_TXT' })}
                    </TransactionExplorerLink>
                </div>
            </>,
            intl.formatMessage({ id: 'LIQUIDITY_ADD_NOTIFICATION_SUCCESS_POOL_CONNECTING_TITLE' }),
            {
                closeOnClick: true,
                isLoading: false,
                toastId: `toast__${result.callId}`,
                type: NotifyType.SUCCESS,
                update: toast.isActive(`toast__${result.callId}`),
            },
        )
    }, [onTransactionSuccessCallback])

    const onTransactionFailure = React.useCallback<Required<LiquidityPoolConnectCallbacks>['onTransactionFailure']>(reason => {
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
            intl.formatMessage({ id: 'LIQUIDITY_ADD_NOTIFICATION_FAILURE_POOL_CONNECTING_TITLE' }),
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
