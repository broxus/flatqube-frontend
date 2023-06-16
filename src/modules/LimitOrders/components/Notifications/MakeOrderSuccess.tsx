import * as React from 'react'
import classNames from 'classnames'
import { useIntl } from 'react-intl'

import { AccountExplorerLink } from '@/components/common/AccountExplorerLink'
import { TokenIcon } from '@/components/common/TokenIcon'
import { TransactionExplorerLink } from '@/components/common/TransactionExplorerLink'
import type { ConversionTransactionSuccessResult } from '@/modules/Swap/types'
import { formattedTokenAmount, isMobile } from '@/utils'


type Props = {
    result: ConversionTransactionSuccessResult;
}


export function MakeOrderSuccess(props: Props): JSX.Element {
    const intl = useIntl()

    const { result } = props // TODO interface for result

    const onClickButton = (event: React.MouseEvent<HTMLAnchorElement>): void => {
        event.stopPropagation()
    }

    return (
        <>
            <div className="notification-body">
                <div className="notification_token-badge">
                    <TokenIcon
                        key="wrap-icon"
                        address={result.receivedRoot}
                        icon={result.receivedIcon}
                        size="small"
                    />
                    <div className="notification_token-badge__title">
                        {`+ ${formattedTokenAmount(
                            result.amount,
                            result.receivedDecimals,
                            { preserve: true },
                        )} ${result.receivedSymbol}`}
                    </div>
                </div>
            </div>

            {(result.receivedRoot !== undefined || result.txHash !== undefined) && (
                <div
                    className={classNames('notification-actions', {
                        'notification-actions--large': isMobile(navigator.userAgent),
                    })}
                >
                    {result.txHash !== undefined && (
                        <TransactionExplorerLink
                            className={isMobile(navigator.userAgent) ? 'btn btn-link' : 'btn btn-secondary'}
                            id={result.txHash}
                            onClick={onClickButton}
                        >
                            {intl.formatMessage({ id: 'SWAP_NOTIFICATION_RECEIPT_TRANSACTION_LINK_TEXT' })}
                        </TransactionExplorerLink>
                    )}
                    {result.receivedRoot !== undefined && (
                        <AccountExplorerLink
                            address={result.receivedRoot}
                            className={isMobile(navigator.userAgent) ? 'btn btn-link' : 'btn btn-secondary'}
                            onClick={onClickButton}
                        >
                            {intl.formatMessage({
                                id: 'SWAP_NOTIFICATION_RECEIPT_TOKEN_ROOT_CONTRACT_LINK_TEXT',
                            })}
                        </AccountExplorerLink>
                    )}
                </div>
            )}
        </>
    )
}
