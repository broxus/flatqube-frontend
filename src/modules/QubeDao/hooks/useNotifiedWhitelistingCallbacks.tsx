import * as React from 'react'
import classNames from 'classnames'
import type { DelayedMessageExecution } from 'everscale-inpage-provider'
import { useIntl } from 'react-intl'
import { toast } from 'react-toastify'

import { TransactionExplorerLink } from '@/components/common/TransactionExplorerLink'
import { notify, NotifyType } from '@/modules/Notification'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import type { QubeDaoWhitelistingCallbacks } from '@/modules/QubeDao/stores/QubeDaoWhitelistingFormStore'
import type {
    SendMessageCallbackParams,
    TransactionFailureReason,
    TransactionSuccessResult,
} from '@/modules/QubeDao/types'
import { isMobile } from '@/utils'
import { QubeDaoWhitelistingSuccessResult } from '@/modules/QubeDao/stores/QubeDaoWhitelistingFormStore'
import { Button } from '@/components/common/Button'
import { appRoutes } from '@/routes'


export function useNotifiedWhitelistingCallbacks(props: QubeDaoWhitelistingCallbacks): QubeDaoWhitelistingCallbacks {
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

    const onSend = React.useCallback((message: DelayedMessageExecution, params: SendMessageCallbackParams) => {
        onSendCallback?.(message, params)
        notify(
            <div className="notification-body">
                {intl.formatMessage({ id: 'QUBE_DAO_NOTIFICATION_PENDING_WHITELISTING_NOTE' })}
            </div>,
            intl.formatMessage(
                { id: 'QUBE_DAO_NOTIFICATION_PENDING_WHITELISTING_TITLE' },
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

    const onTransactionSuccess = React.useCallback(
        (result: TransactionSuccessResult<QubeDaoWhitelistingSuccessResult>) => {
            onTransactionSuccessCallback?.(result)
            notify(
                <>
                    <div className="notification-body">
                        {intl.formatMessage(
                            { id: 'QUBE_DAO_NOTIFICATION_SUCCESS_WHITELISTING_NOTE' },
                            {
                                name: result.input.gauge?.poolTokens.map(token => token.tokenSymbol).join('/'),
                            },
                        )}
                    </div>
                    <div
                        className={classNames('notification-actions', {
                            'notification-actions--large': isMobile(navigator.userAgent),
                        })}
                    >
                        <Button
                            link={appRoutes.daoEpoch.makeUrl({ epochNum: daoContext.currentEpochNum.toString() })}
                            type={isMobile(navigator.userAgent) ? 'link' : 'secondary'}
                            onClick={onClickActionButton}
                        >
                            {intl.formatMessage({ id: 'QUBE_DAO_NOTIFICATION_CURRENT_EPOCH_LINK_TXT' })}
                        </Button>
                        <Button
                            link={appRoutes.gaugesItem.makeUrl({ address: result.input.gauge?.address as string })}
                            type={isMobile(navigator.userAgent) ? 'link' : 'secondary'}
                            onClick={onClickActionButton}
                        >
                            {intl.formatMessage({ id: 'QUBE_DAO_NOTIFICATION_GAUGE_LINK_TXT' })}
                        </Button>
                    </div>
                </>,
                intl.formatMessage({ id: 'QUBE_DAO_NOTIFICATION_SUCCESS_WHITELISTING_TITLE' }),
                {
                    closeOnClick: true,
                    isLoading: false,
                    toastId: `toast__${result.callId}`,
                    type: NotifyType.SUCCESS,
                    update: toast.isActive(`toast__${result.callId}`),

                },
            )
        },
        [onTransactionSuccessCallback],
    )

    const onTransactionFailure = React.useCallback((reason: TransactionFailureReason) => {
        onTransactionFailureCallback?.(reason)
        const isReverted = reason.message === 'DepositRevert'
        notify(
            <>
                <div className="notification-body">
                    {isReverted ? intl.formatMessage({
                        id: 'QUBE_DAO_NOTIFICATION_FAILURE_WHITELISTING_REVERT_NOTE',
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
                    ? 'QUBE_DAO_NOTIFICATION_FAILURE_WHITELISTING_REVERT_TITLE'
                    : 'QUBE_DAO_NOTIFICATION_FAILURE_WHITELISTING_TITLE',
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
