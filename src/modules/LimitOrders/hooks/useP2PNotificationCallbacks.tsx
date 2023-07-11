import * as React from 'react'
import { useIntl } from 'react-intl'

import { notify, NotifyType } from '@/modules/Notification'
import { LimitOrderCancelCallbackResult, LimitOrderExchangeSuccessCallbackResult, P2PStoreProviderProps } from '@/modules/LimitOrders/types'
import { OrderStateCancelled } from '@/modules/LimitOrders/components/Notifications/OrderStateCancelled'
import { OrderExchangeSuccess } from '@/modules/LimitOrders/components/Notifications/OrderExchangeSuccess'
import { debug } from '@/utils'

export type P2PNotifiedCallbacks = Pick<
    P2PStoreProviderProps,
    | 'onTransactionWait'
    | 'onTransactionEnded'
    | 'onOrderRootCreateSuccess'
    | 'onOrderRootCreateReject'
    | 'onOrderCloseSuccess'
    | 'onOrderCreateOrderSuccess'
    | 'onOrderCreateOrderReject'
    | 'onOrderPartExchangeSuccess'
    | 'onOrderStateFilled'
    | 'onOrderStateCancelled'
    | 'onOrderExchangeFail'
    | 'onError'
>

const autoClose = 15000

export function useP2PNotificationCallbacks(): P2PNotifiedCallbacks {
    const intl = useIntl()
    const waitNotifyRef = React.useRef<Set<string>>(new Set())

    const onTransactionWait = React.useCallback(({ callId }: {callId: string}) => {
        const title = intl.formatMessage({ id: 'P2P_NOTIFICATION_TRANSACTION_PENDING_TITLE' })
        if (waitNotifyRef.current.has(`w${callId}`)) {
            return
        }
        waitNotifyRef.current.add(notify(
            undefined,
            title,
            {
                autoClose: 500,
                isLoading: true,
                toastId: `w${callId}`,
                type: NotifyType.INFO,
            },
        ).toString())
        debug('onTransactionWait', callId)
    }, [])

    const onTransactionEnded = React.useCallback(({ callId }: {callId: string}) => {
        if (!waitNotifyRef.current.has(`w${callId}`)) {
            return
        }
        debug('onTransactionEnded', callId, waitNotifyRef.current.has(`w${callId}`))
        waitNotifyRef.current.delete(callId)
        notify(
            undefined,
            undefined,
            {
                dismiss: true,
                toastId: `w${callId}`,
                type: NotifyType.INFO,
            },
        )
    }, [])

    const onOrderRootCreateSuccess = React.useCallback(({ callId }: {callId: string}) => {

        debug('onOrderRootCreateSuccess', callId)
        const title = intl.formatMessage({ id: 'P2P_NOTIFICATION_ORDER_ROOT_CREATE_SUCCESSFUL_TITLE' })

        notify(
            undefined,
            title,
            {
                autoClose,
                toastId: callId,
                type: NotifyType.SUCCESS,
            },
        )
    }, [])

    const onOrderRootCreateReject = React.useCallback(({ callId }: {callId: string}) => {

        debug('onOrderRootCreateReject args', callId)
        const title = intl.formatMessage({ id: 'P2P_NOTIFICATION_ORDER_ROOT_CREATE_FAIL_TITLE' })

        notify(
            undefined,
            title,
            {
                autoClose,
                toastId: callId,
                type: NotifyType.ERROR,
            },
        )
    }, [])

    const onOrderCreateOrderSuccess = React.useCallback(({
        callId,
        input,
        transaction,
    }: {
        callId: string,
        input: any,
        transaction?: any,
    }) => {

        debug('onOrderCreateOrderSuccess args', callId, input, transaction)
        const title = intl.formatMessage({ id: 'P2P_NOTIFICATION_ORDER_CREATE_SUCCESSFUL_TITLE' })
        notify(
            undefined,
            title,
            {
                autoClose,
                toastId: callId,
                type: NotifyType.SUCCESS,
            },
        )
    }, [])

    const onOrderCreateOrderReject = React.useCallback(({
        callId,
        input,
        reason,
    }: {callId: string, input?: any, reason?: any}) => {

        debug('onOrderCreateOrderReject args', reason, callId, input)
        const title = intl.formatMessage({ id: 'P2P_NOTIFICATION_ORDER_CREATE_FAIL_TITLE' })
        notify(
            undefined,
            title,
            {
                autoClose,
                toastId: callId,
                type: NotifyType.ERROR,
            },
        )
    }, [])

    const onOrderPartExchangeSuccess = React.useCallback(({ callId, result }:
        {
            callId: string,
            result: LimitOrderExchangeSuccessCallbackResult,
        }) => {

        debug('onOrderPartExchangeSuccess args', result, callId)
        const title = intl.formatMessage({ id: 'P2P_NOTIFICATION_ORDER_PARTIAL_EXCHANGE_SUCCESS_TITLE' })
        notify(
            <OrderExchangeSuccess
                result={result}
            />,
            title,
            {
                autoClose,
                toastId: callId,
                type: NotifyType.SUCCESS,
            },
        )
    }, [])

    const onOrderExchangeFail = React.useCallback(({ callId }: {callId: string}) => {

        debug('onOrderPartExchangeFail', callId)
        const title = intl.formatMessage({ id: 'P2P_NOTIFICATION_ORDER_EXCHANGE_FAIL_TITLE' })
        notify(
            undefined,
            title,
            {
                autoClose,
                toastId: callId,
                type: NotifyType.ERROR,
            },
        )
    }, [])

    const onOrderStateFilled = React.useCallback(({ callId, result }:
        {
            callId: string,
            result: LimitOrderExchangeSuccessCallbackResult,
        }) => {

        debug('onOrderStateFilled args', result, callId)
        const title = intl.formatMessage({ id: 'P2P_NOTIFICATION_ORDER_FILLED_SUCCESS_TITLE' })
        notify(
            <OrderExchangeSuccess
                result={result}
            />,
            title,
            {
                autoClose,
                toastId: callId,
                type: NotifyType.SUCCESS,
            },
        )
    }, [])

    const onOrderCloseSuccess = React.useCallback(({ callId, result }:
        {
            callId: string,
            result: LimitOrderExchangeSuccessCallbackResult,
        }) => {

        debug('onOrderCloseSuccess args', result, callId)
        const title = intl.formatMessage({ id: 'P2P_NOTIFICATION_ORDER_EXCHANGE_SUCCESS_TITLE' })
        notify(
            <OrderExchangeSuccess
                result={result}
            />,
            title,
            {
                autoClose,
                toastId: callId,
                type: NotifyType.SUCCESS,
            },
        )
    }, [])


    const onOrderStateCancelled = React.useCallback(({ callId, result }:
        {
            callId: string,
            result: LimitOrderCancelCallbackResult,
        }) => {

        debug('onOrderStateCancelled result', result, callId)
        const title = intl.formatMessage({ id: 'P2P_NOTIFICATION_ORDER_CANCELED_TITLE' })
        notify(
            <OrderStateCancelled
                result={result}
            />,
            title,
            {
                autoClose,
                toastId: callId,
                type: NotifyType.SUCCESS,
            },
        )
    }, [])

    const onError = React.useCallback(({
        callId,
        reason,
    }: {callId: string, reason?: any}) => {

        debug('onOrderCreateOrderReject args', reason, callId)
        const title = intl.formatMessage({ id: 'P2P_NOTIFICATION_ORDER_COMMON_ERROR_TITLE' })
        notify(
            undefined,
            title,
            {
                autoClose,
                toastId: callId,
                type: NotifyType.ERROR,
            },
        )
    }, [])

    return {
        onError,
        onOrderCloseSuccess,
        onOrderCreateOrderReject,
        onOrderCreateOrderSuccess,
        onOrderExchangeFail,
        onOrderPartExchangeSuccess,
        onOrderRootCreateReject,
        onOrderRootCreateSuccess,
        onOrderStateCancelled,
        onOrderStateFilled,
        onTransactionEnded,
        onTransactionWait,
    }
}
