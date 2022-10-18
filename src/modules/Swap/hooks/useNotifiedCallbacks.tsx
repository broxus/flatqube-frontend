import * as React from 'react'
import type { DelayedMessageExecution } from 'everscale-inpage-provider'
import { useIntl } from 'react-intl'

import { notify, NotifyType } from '@/modules/Notification'
import {
    ConversionSuccessReceipt,
    CrossSwapFailureReceipt,
    SwapFailureReceipt,
    SwapSuccessReceipt,
} from '@/modules/Swap/components/Notifications'
import type { SwapFormStoreProviderProps } from '@/modules/Swap/context'
import type {
    CoinSwapFailureResult,
    CoinSwapSuccessResult,
    ConversionTransactionSuccessResult,
    CrossPairTransactionFailureResult,
    DirectTransactionFailureResult,
    DirectTransactionSuccessResult,
    SendMessageCallbackParams,
    SwapTransactionReceipt,
} from '@/modules/Swap/types'


export type SwapNotifiedCallbacks = Pick<
    SwapFormStoreProviderProps,
    | 'onConversionSuccess'
    | 'onCoinSwapFailure'
    | 'onCoinSwapSuccess'
    | 'onSend'
    | 'onSwapFailure'
    | 'onSwapSuccess'
>

export function useNotifiedCallbacks(props: SwapFormStoreProviderProps): SwapNotifiedCallbacks {
    const intl = useIntl()

    const {
        onConversionSuccess: onConversionSuccessCallback,
        onCoinSwapFailure: onCoinSwapFailureCallback,
        onCoinSwapSuccess: onCoinSwapSuccessCallback,
        onSend: onSendCallback,
        onSwapFailure: onSwapFailureCallback,
        onSwapSuccess: onSwapSuccessCallback,
    } = props

    const onSend = React.useCallback((message: DelayedMessageExecution, params: SendMessageCallbackParams) => {
        onSendCallback?.(message, params)
        let title = intl.formatMessage({ id: 'SWAP_NOTIFICATION_TRANSACTION_PENDING_TITLE' })
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
    }, [onSendCallback])

    const onSwapFailure = React.useCallback((
        reason: DirectTransactionFailureResult | CrossPairTransactionFailureResult,
        receipt: SwapTransactionReceipt,
    ) => {
        onSwapFailureCallback?.(reason, receipt)
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
    }, [onSwapFailureCallback])

    const onSwapSuccess = React.useCallback((
        result: DirectTransactionSuccessResult,
        receipt: SwapTransactionReceipt,
    ) => {
        onSwapSuccessCallback?.(result, receipt)
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
    }, [onSwapSuccessCallback])

    const onCoinSwapFailure = React.useCallback((
        reason: CoinSwapFailureResult,
        receipt: SwapTransactionReceipt,
    ) => {
        onCoinSwapFailureCallback?.(reason, receipt)
        notify(
            receipt.isCrossExchangeCanceled
                ? <CrossSwapFailureReceipt receipt={receipt} message={reason.message} />
                : <SwapFailureReceipt receipt={receipt} message={reason.message} />,
            intl.formatMessage({ id: 'SWAP_NOTIFICATION_FAILURE_TITLE' }),
            {
                isLoading: false,
                toastId: reason.callId,
                type: NotifyType.ERROR,
                update: true,
            },
        )
    }, [onCoinSwapFailureCallback])

    const onCoinSwapSuccess = React.useCallback((
        result: CoinSwapSuccessResult,
        receipt: SwapTransactionReceipt,
    ) => {
        onCoinSwapSuccessCallback?.(result, receipt)
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
    }, [onCoinSwapSuccessCallback])

    const onConversionSuccess = React.useCallback((result: ConversionTransactionSuccessResult) => {
        onConversionSuccessCallback?.(result)
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
    }, [onConversionSuccessCallback])

    return {
        onCoinSwapFailure,
        onCoinSwapSuccess,
        onConversionSuccess,
        onSend,
        onSwapFailure,
        onSwapSuccess,
    }
}
