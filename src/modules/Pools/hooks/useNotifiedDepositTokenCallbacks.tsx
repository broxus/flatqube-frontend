import * as React from 'react'
import classNames from 'classnames'
import { useIntl } from 'react-intl'
import { toast } from 'react-toastify'

import { TransactionExplorerLink } from '@/components/common/TransactionExplorerLink'
import type { DexAccountDepositTokenCallbacks, LiquidityStablePoolTokenData } from '@/misc'
import { TokensReceivedSuccess } from '@/modules/Liqudity/components'
import type { DepositTokenCallbacks } from '@/modules/Liqudity/types'
import { notify, NotifyType } from '@/modules/Notification'
import { useAddLiquidityFormStoreContext } from '@/modules/Pools/context'
import type { TokenCache } from '@/stores/TokensCacheService'
import { formattedTokenAmount, isMobile, stopEventPropagate } from '@/utils'


export function useNotifiedDepositTokenCallbacks(props: DexAccountDepositTokenCallbacks): DepositTokenCallbacks {
    const intl = useIntl()
    const formStore = useAddLiquidityFormStoreContext()

    const {
        onSend: onSendCallback,
        onTransactionFailure: onTransactionFailureCallback,
        onTransactionSuccess: onTransactionSuccessCallback,
    } = props

    const onSend = React.useCallback<Required<DepositTokenCallbacks>['onSend']>((message, params) => {
        const token: TokenCache | undefined = formStore.tokensCache.get(params.tokenAddress?.toString())
        const poolToken: LiquidityStablePoolTokenData | undefined = params.tokenAddress !== undefined
            ? formStore.tokensMap.get(params.tokenAddress.toString())
            : undefined

        onSendCallback?.(message, params)

        notify(
            <div className="notification-body">
                {intl.formatMessage({ id: 'LIQUIDITY_ADD_NOTIFICATION_PENDING_DEPOSIT_TOKEN_NOTE' })}
            </div>,
            intl.formatMessage(
                { id: 'LIQUIDITY_ADD_NOTIFICATION_PENDING_DEPOSIT_TOKEN_TITLE' },
                {
                    amount: formattedTokenAmount(params.amount, token?.decimals ?? poolToken?.decimals),
                    symbol: token?.symbol ?? poolToken?.symbol ?? '',
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

    const onTransactionSuccess = React.useCallback<Required<DepositTokenCallbacks>['onTransactionSuccess']>((result, receipt) => {
        onTransactionSuccessCallback?.(result)
        notify(
            <TokensReceivedSuccess
                address={result.input.tokenAddress.toString()}
                amount={receipt?.amount ?? result.input.amount}
                decimals={receipt?.receivedDecimals}
                icon={receipt?.receivedIcon}
                symbol={receipt?.receivedSymbol ?? ''}
                txHash={receipt?.hash ?? result.transaction.id.hash}
            />,
            intl.formatMessage({ id: 'LIQUIDITY_ADD_NOTIFICATION_SUCCESS_DEPOSIT_TOKEN_TITLE' }),
            {
                closeOnClick: true,
                isLoading: false,
                toastId: `toast__${result.callId}`,
                type: NotifyType.SUCCESS,
                update: toast.isActive(`toast__${result.callId}`),
            },
        )
    }, [onTransactionSuccessCallback])

    const onTransactionFailure = React.useCallback<Required<DepositTokenCallbacks>['onTransactionFailure']>(reason => {
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

    return {
        onSend,
        onTransactionFailure,
        onTransactionSuccess,
    }
}
