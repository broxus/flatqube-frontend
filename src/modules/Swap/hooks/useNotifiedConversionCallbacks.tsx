import * as React from 'react'
import classNames from 'classnames'
import { useIntl } from 'react-intl'
import { toast } from 'react-toastify'

import { TransactionExplorerLink } from '@/components/common/TransactionExplorerLink'
import { notify, NotifyType } from '@/modules/Notification'
import { ConversionSuccessReceipt } from '@/modules/Swap/components/Notifications'
import type { ConversionTransactionCallbacks } from '@/modules/Swap/types'
import { isMobile, stopEventPropagate } from '@/utils'


export function useNotifiedConversionCallbacks(props: ConversionTransactionCallbacks): ConversionTransactionCallbacks {
    const intl = useIntl()

    const {
        onSend: onSendCallback,
        onTransactionFailure: onTransactionFailureCallback,
        onTransactionSuccess: onTransactionSuccessCallback,
    } = props

    const onSend = React.useCallback<Required<ConversionTransactionCallbacks>['onSend']>(
        (message, params) => {
            onSendCallback?.(message, params)
            let title = intl.formatMessage({ id: 'NOTIFICATION_MESSAGE_SENT_TITLE' })
            if (params.mode === 'wrap') {
                title = intl.formatMessage({ id: 'CONVERSION_NOTIFICATION_WRAP_PENDING_TITLE' })
            }
            else if (params.mode === 'unwrap') {
                title = intl.formatMessage({ id: 'CONVERSION_NOTIFICATION_UNWRAP_PENDING_TITLE' })
            }
            notify(
                undefined,
                title,
                {
                    autoClose: false,
                    isLoading: true,
                    toastId: params.callId,
                    type: NotifyType.INFO,
                },
            )
        },
        [onSendCallback],
    )
    const onTransactionFailure = React.useCallback<Required<ConversionTransactionCallbacks>['onTransactionFailure']>(reason => {
        onTransactionFailureCallback?.(reason)
        notify(
            <>
                <div className="notification-body">
                    {reason.message}
                </div>
                {reason?.transaction?.id.hash !== undefined && (
                    <div
                        className={classNames('notification-actions', {
                            'notification-actions--large': isMobile(navigator.userAgent),
                        })}
                    >
                        <TransactionExplorerLink
                            className={isMobile(navigator.userAgent) ? 'btn btn-link' : 'btn btn-secondary'}
                            id={reason?.transaction?.id.hash}
                            onClick={stopEventPropagate}
                        >
                            {intl.formatMessage({
                                id: 'LIQUIDITY_ADD_NOTIFICATION_TRANSACTION_DETAILS_LINK_TXT',
                            })}
                        </TransactionExplorerLink>
                    </div>
                )}
            </>,
            intl.formatMessage({ id: 'LIQUIDITY_ADD_NOTIFICATION_FAILURE_DEPOSIT_TOKEN_TITLE' }),
            {
                closeOnClick: true,
                isLoading: false,
                toastId: `toast__${reason.callId}`,
                type: NotifyType.WARNING,
                update: toast.isActive(`toast__${reason.callId}`),
            },
        )
    }, [onTransactionFailureCallback])

    const onTransactionSuccess = React.useCallback<Required<ConversionTransactionCallbacks>['onTransactionSuccess']>(
        result => {
            onTransactionSuccessCallback?.(result)
            let title: string | undefined
            if (result.direction === 'wrap') {
                title = intl.formatMessage({ id: 'CONVERSION_NOTIFICATION_WRAP_SUCCESS_TITLE' })
            }
            else if (result.direction === 'unwrap') {
                title = intl.formatMessage({ id: 'CONVERSION_NOTIFICATION_UNWRAP_SUCCESS_TITLE' })
            }
            notify(
                <ConversionSuccessReceipt result={result} />,
                title,
                {
                    isLoading: false,
                    toastId: result.callId,
                    type: NotifyType.SUCCESS,
                    update: true,
                },
            )
        },
        [onTransactionSuccessCallback],
    )

    return {
        onSend,
        onTransactionFailure,
        onTransactionSuccess,
    }
}
