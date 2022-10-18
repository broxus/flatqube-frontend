import * as React from 'react'
import classNames from 'classnames'
import type { DelayedMessageExecution } from 'everscale-inpage-provider'
import { useIntl } from 'react-intl'
import { toast } from 'react-toastify'

import { TransactionExplorerLink } from '@/components/common/TransactionExplorerLink'
import { notify, NotifyType } from '@/modules/Notification'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import type {
    QubeDaoDepositCallbacks,
    QubeDaoDepositSendCallbackParams,
    QubeDaoDepositSuccessResult,
} from '@/modules/QubeDao/stores/QubeDaoStore'
import type {
    SendMessageCallbackParams,
    TransactionFailureReason,
    TransactionSuccessResult,
} from '@/modules/QubeDao/types'
import { formattedTokenAmount, isMobile } from '@/utils'


export function useNotifiedDepositCallbacks(props: QubeDaoDepositCallbacks): QubeDaoDepositCallbacks {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()

    const {
        onSend: onSendCallback,
        onTransactionFailure: onTransactionFailureCallback,
        onTransactionSuccess: onTransactionSuccessCallback,
    } = props

    const onClickActionButton = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.stopPropagation()
    }

    const onSend = React.useCallback((
        message: DelayedMessageExecution,
        params: SendMessageCallbackParams<QubeDaoDepositSendCallbackParams>,
    ) => {
        onSendCallback?.(message, params)
        notify(
            <div className="notification-body">
                {intl.formatMessage({ id: 'QUBE_DAO_NOTIFICATION_PENDING_DEPOSIT_NOTE' })}
            </div>,
            intl.formatMessage(
                { id: 'QUBE_DAO_NOTIFICATION_PENDING_DEPOSIT_TITLE' },
                {
                    amount: formattedTokenAmount(params.amount, daoContext.tokenDecimals),
                    symbol: daoContext.tokenSymbol,
                    veAmount: formattedTokenAmount(params.veAmount, daoContext.tokenDecimals),
                    veSymbol: daoContext.veSymbol,
                },
            ),
            {
                autoClose: false,
                closeOnClick: false,
                isLoading: true,
                toastId: `toast__${params.callId}`,
                type: NotifyType.INFO,
            },
        )
    }, [onSendCallback])

    const onTransactionSuccess = React.useCallback((result: TransactionSuccessResult<QubeDaoDepositSuccessResult>) => {
        onTransactionSuccessCallback?.(result)
        notify(
            <>
                <div className="notification-body">
                    {intl.formatMessage(
                        { id: 'QUBE_DAO_NOTIFICATION_SUCCESS_DEPOSIT_NOTE' },
                        {
                            amount: formattedTokenAmount(result.input.amount, daoContext.tokenDecimals),
                            symbol: daoContext.tokenSymbol,
                            veAmount: formattedTokenAmount(result.input.veAmount, daoContext.veDecimals),
                            veSymbol: daoContext.veSymbol,
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
                        onClick={onClickActionButton}
                    >
                        {intl.formatMessage({ id: 'QUBE_DAO_NOTIFICATION_TRANSACTION_DETAILS_LINK_TXT' })}
                    </TransactionExplorerLink>
                </div>
            </>,
            intl.formatMessage({ id: 'QUBE_DAO_NOTIFICATION_SUCCESS_DEPOSIT_TITLE' }),
            {
                closeOnClick: true,
                isLoading: false,
                toastId: `toast__${result.callId}`,
                type: NotifyType.SUCCESS,
                update: toast.isActive(`toast__${result.callId}`),

            },
        )
    }, [onTransactionSuccessCallback])

    const onTransactionFailure = React.useCallback((reason: TransactionFailureReason) => {
        onTransactionFailureCallback?.(reason)
        const isReverted = reason.message === 'DepositRevert'
        notify(
            <>
                <div className="notification-body">
                    {isReverted ? intl.formatMessage({
                        id: 'QUBE_DAO_NOTIFICATION_FAILURE_DEPOSIT_REVERT_NOTE',
                    }) : reason.message}
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
                            onClick={onClickActionButton}
                        >
                            {intl.formatMessage({
                                id: 'QUBE_DAO_NOTIFICATION_TRANSACTION_DETAILS_LINK_TXT',
                            })}
                        </TransactionExplorerLink>
                    </div>
                )}
            </>,
            intl.formatMessage({
                id: isReverted
                    ? 'QUBE_DAO_NOTIFICATION_FAILURE_DEPOSIT_REVERT_TITLE'
                    : 'QUBE_DAO_NOTIFICATION_FAILURE_DEPOSIT_TITLE',
            }),
            {
                closeOnClick: true,
                isLoading: false,
                toastId: `toast__${reason.callId}`,
                type: isReverted ? NotifyType.WARNING : NotifyType.ERROR,
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
