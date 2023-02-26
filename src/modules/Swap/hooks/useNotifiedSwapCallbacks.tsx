import * as React from 'react'
import { useIntl } from 'react-intl'

import { notify, NotifyType } from '@/modules/Notification'
import {
    CrossSwapFailureReceipt,
    SwapFailureReceipt,
    SwapSuccessReceipt,
} from '@/modules/Swap/components/Notifications'
import type { SwapTransactionCallbacks } from '@/modules/Swap/types'


export function useNotifiedSwapCallbacks(props: SwapTransactionCallbacks): SwapTransactionCallbacks {
    const intl = useIntl()

    const {
        onTransactionFailure: onTransactionFailureCallback,
        onTransactionSuccess: onTransactionSuccessCallback,
        onSend: onSendCallback,
    } = props

    const onSend = React.useCallback<Required<SwapTransactionCallbacks>['onSend']>(
        (message, params) => {
            onSendCallback?.(message, params)
            notify(
                undefined,
                intl.formatMessage({ id: 'SWAP_NOTIFICATION_TRANSACTION_PENDING_TITLE' }),
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

    const onTransactionFailure = React.useCallback<Required<SwapTransactionCallbacks>['onTransactionFailure']>(
        (reason, receipt) => {
            onTransactionFailureCallback?.(reason, receipt)
            notify(
                receipt.isCrossExchangeCanceled
                    ? <CrossSwapFailureReceipt receipt={receipt} message={reason.message} />
                    : <SwapFailureReceipt receipt={receipt} message={reason.message} />,
                intl.formatMessage({
                    id: receipt.isCrossExchangeCanceled
                        ? 'SWAP_NOTIFICATION_CROSS_EXCHANGE_CANCELLED_TITLE'
                        : 'SWAP_NOTIFICATION_FAILURE_TITLE',
                }),
                {
                    isLoading: false,
                    toastId: reason.callId,
                    type: NotifyType.WARNING,
                    update: true,
                },
            )
        },
        [onTransactionFailureCallback],
    )

    const onTransactionSuccess = React.useCallback<Required<SwapTransactionCallbacks>['onTransactionSuccess']>(
        (result, receipt) => {
            onTransactionSuccessCallback?.(result, receipt)
            notify(
                <SwapSuccessReceipt receipt={receipt} />,
                intl.formatMessage({ id: 'SWAP_NOTIFICATION_SUCCESS_TITLE' }),
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
