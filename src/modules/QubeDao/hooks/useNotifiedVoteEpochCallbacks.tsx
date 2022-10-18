import * as React from 'react'
import classNames from 'classnames'
import { useIntl } from 'react-intl'
import { toast } from 'react-toastify'

import { TransactionExplorerLink } from '@/components/common/TransactionExplorerLink'
import { notify, NotifyType } from '@/modules/Notification'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import type { QubeDaoVoteEpochCallbacks, QubeDaoVoteEpochSuccessResult } from '@/modules/QubeDao/stores/QubeDaoStore'
import type { TransactionFailureReason, TransactionSuccessResult } from '@/modules/QubeDao/types'
import { isMobile } from '@/utils'


export function useNotifiedVoteEpochCallbacks(props: QubeDaoVoteEpochCallbacks): QubeDaoVoteEpochCallbacks {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()

    const {
        onTransactionFailure: onTransactionFailureCallback,
        onTransactionSuccess: onTransactionSuccessCallback,
    } = props

    const onClickActionButton = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.stopPropagation()
    }

    const onTransactionSuccess = React.useCallback((
        result: TransactionSuccessResult<QubeDaoVoteEpochSuccessResult>,
    ) => {
        onTransactionSuccessCallback?.(result)
        notify(
            <>
                <div className="notification-body">
                    {intl.formatMessage({ id: 'QUBE_DAO_NOTIFICATION_SUCCESS_VOTE_NOTE' })}
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
            intl.formatMessage({ id: 'QUBE_DAO_NOTIFICATION_SUCCESS_VOTE_TITLE' }),
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
        const isReverted = reason.message === 'VoteRevert'
        const isAlreadyVoted = reason.message === 'AlreadyVoted'
        notify(
            <>
                <div className="notification-body">
                    {/* eslint-disable-next-line no-nested-ternary */}
                    {isReverted
                        ? intl.formatMessage({
                            id: 'QUBE_DAO_NOTIFICATION_FAILURE_VOTE_REVERT_NOTE',
                        }, { veSymbol: daoContext.veSymbol })
                        : isAlreadyVoted
                            ? intl.formatMessage({
                                id: 'QUBE_DAO_NOTIFICATION_FAILURE_VOTE_ALREADY_VOTED_NOTE',
                            })
                            : reason.message}
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
                // eslint-disable-next-line no-nested-ternary
                id: isReverted
                    ? 'QUBE_DAO_NOTIFICATION_FAILURE_VOTE_REVERT_TITLE'
                    : isAlreadyVoted
                        ? 'QUBE_DAO_NOTIFICATION_FAILURE_VOTE_ALREADY_VOTED_TITLE'
                        : 'QUBE_DAO_NOTIFICATION_FAILURE_VOTE_TITLE',
            }),
            {
                closeOnClick: true,
                isLoading: false,
                toastId: `toast__${reason.callId}`,
                type: (isAlreadyVoted || isReverted) ? NotifyType.WARNING : NotifyType.ERROR,
                update: toast.isActive(`toast__${reason.callId}`),

            },
        )
    }, [onTransactionFailureCallback])

    return { onTransactionFailure, onTransactionSuccess }
}
