import * as React from 'react'
import { useIntl } from 'react-intl'
import classNames from 'classnames'

import { AccountExplorerLink } from '@/components/common/AccountExplorerLink'
import { TokenIcon } from '@/components/common/TokenIcon'
import { TransactionExplorerLink } from '@/components/common/TransactionExplorerLink'
import type { SwapTransactionReceipt } from '@/modules/Swap/types'
import { formattedAmount, formattedTokenAmount, isMobile } from '@/utils'


type Props = {
    message?: string;
    receipt: SwapTransactionReceipt;
}


export function CrossSwapFailureReceipt(props: Props): JSX.Element {
    const intl = useIntl()

    const { message, receipt } = props

    const onClickButton = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.stopPropagation()
    }

    return (
        <>
            <div className="notification-body">
                <p>
                    {message ?? intl.formatMessage({
                        id: 'SWAP_NOTIFICATION_CROSS_EXCHANGE_CANCELLED_NOTE',
                    }, {
                        leftSymbol: receipt.spentSymbol || '',
                        rightSymbol: receipt.receivedSymbol || '',
                        slippage: formattedAmount(receipt.slippage || '0'),
                    })}
                </p>

                <div className="notification_token-badge">
                    <TokenIcon
                        address={receipt.spentRoot}
                        icon={receipt.spentIcon}
                        size="small"
                    />
                    <div className="notification_token-badge__title">
                        {`+ ${formattedTokenAmount(
                            receipt.amount,
                            receipt.spentDecimals,
                            { preserve: true },
                        )} ${receipt.spentSymbol}`}
                    </div>
                </div>
            </div>

            {(receipt.spentRoot !== undefined || receipt.hash !== undefined) && (
                <div
                    className={classNames('notification-actions', {
                        'notification-actions--large': isMobile(navigator.userAgent),
                    })}
                >
                    {receipt.hash !== undefined && (
                        <TransactionExplorerLink
                            className={isMobile(navigator.userAgent) ? 'btn btn-link' : 'btn btn-secondary'}
                            id={receipt.hash}
                            onClick={onClickButton}
                        >
                            {intl.formatMessage({ id: 'SWAP_NOTIFICATION_RECEIPT_TRANSACTION_LINK_TEXT' })}
                        </TransactionExplorerLink>
                    )}
                    {receipt.spentRoot !== undefined && (
                        <AccountExplorerLink
                            address={receipt.spentRoot}
                            className={isMobile(navigator.userAgent) ? 'btn btn-link' : 'btn btn-secondary'}
                            onClick={onClickButton}
                        >
                            {intl.formatMessage({ id: 'SWAP_NOTIFICATION_RECEIPT_TOKEN_ROOT_CONTRACT_LINK_TEXT' })}
                        </AccountExplorerLink>
                    )}
                </div>
            )}
        </>
    )
}
