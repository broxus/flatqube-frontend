import * as React from 'react'
import { useIntl } from 'react-intl'
import classNames from 'classnames'

import { AccountExplorerLink } from '@/components/common/AccountExplorerLink'
import { TransactionExplorerLink } from '@/components/common/TransactionExplorerLink'
import type { SwapTransactionReceipt } from '@/modules/Swap/types'
import { isMobile, stopEventPropagate } from '@/utils'


type Props = {
    message?: string;
    receipt: SwapTransactionReceipt;
}


export function SwapFailureReceipt(props: Props): JSX.Element {
    const intl = useIntl()

    const { message = intl.formatMessage({ id: 'SWAP_NOTIFICATION_FAILURE_NOTE' }), receipt } = props

    return (
        <>
            {message && (
                <div className="notification-body">{message}</div>
            )}

            {(receipt.receivedRoot !== undefined || receipt.hash !== undefined) && (
                <div
                    className={classNames('notification-actions', {
                        'notification-actions--large': isMobile(navigator.userAgent),
                    })}
                >
                    {receipt.hash !== undefined && (
                        <TransactionExplorerLink
                            className={isMobile(navigator.userAgent) ? 'btn btn-link' : 'btn btn-secondary'}
                            id={receipt.hash}
                            onClick={stopEventPropagate}
                        >
                            {intl.formatMessage({ id: 'SWAP_NOTIFICATION_RECEIPT_TRANSACTION_LINK_TEXT' })}
                        </TransactionExplorerLink>
                    )}
                    {receipt.receivedRoot !== undefined && (
                        <AccountExplorerLink
                            address={receipt.receivedRoot}
                            className={isMobile(navigator.userAgent) ? 'btn btn-link' : 'btn btn-secondary'}
                            onClick={stopEventPropagate}
                        >
                            {intl.formatMessage({ id: 'SWAP_NOTIFICATION_RECEIPT_TOKEN_ROOT_CONTRACT_LINK_TEXT' })}
                        </AccountExplorerLink>
                    )}
                </div>
            )}
        </>
    )
}
