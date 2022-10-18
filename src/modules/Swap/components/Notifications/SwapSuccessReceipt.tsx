import * as React from 'react'
import classNames from 'classnames'
import { useIntl } from 'react-intl'

import { AccountExplorerLink } from '@/components/common/AccountExplorerLink'
import { TokenIcon } from '@/components/common/TokenIcon'
import { TransactionExplorerLink } from '@/components/common/TransactionExplorerLink'
import { SwapTransactionReceipt } from '@/modules/Swap/types'
import { formattedTokenAmount, isMobile } from '@/utils'


type Props = {
    receipt: SwapTransactionReceipt;
}


export function SwapSuccessReceipt(props: Props): JSX.Element {
    const intl = useIntl()

    const { receipt } = props

    const onClickButton = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.stopPropagation()
    }

    return (
        <>
            <div className="notification-body">
                <div className="notification_token-badge">
                    <TokenIcon
                        address={receipt.receivedRoot}
                        icon={receipt.receivedIcon}
                        size="small"
                    />
                    <div className="notification_token-badge__title">
                        {`+ ${formattedTokenAmount(
                            receipt.amount,
                            receipt.receivedDecimals,
                            { preserve: true },
                        )} ${receipt.receivedSymbol}`}
                    </div>
                </div>
            </div>

            {(receipt.receivedRoot !== undefined || receipt.hash !== undefined) && (
                <div
                    className={classNames('notification-actions', {
                        'notification-actions--large': isMobile(navigator.userAgent),
                    })}
                >
                    {receipt.hash !== undefined && (
                        <TransactionExplorerLink
                            className={!isMobile(navigator.userAgent) ? 'btn btn-secondary' : 'btn btn-link'}
                            id={receipt.hash}
                            onClick={onClickButton}
                        >
                            {intl.formatMessage({ id: 'SWAP_NOTIFICATION_RECEIPT_TRANSACTION_LINK_TEXT' })}
                        </TransactionExplorerLink>
                    )}
                    {receipt.receivedRoot !== undefined && (
                        <AccountExplorerLink
                            address={receipt.receivedRoot}
                            className={!isMobile(navigator.userAgent) ? 'btn btn-secondary' : 'btn btn-link'}
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
