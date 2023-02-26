import * as React from 'react'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { useIntl } from 'react-intl'

import { AccountExplorerLink } from '@/components/common/AccountExplorerLink'
import { TokenIcon } from '@/components/common/TokenIcon'
import { TransactionExplorerLink } from '@/components/common/TransactionExplorerLink'
import {
    abbrNumber,
    formattedTokenAmount,
    isMobile,
    stopEventPropagate,
} from '@/utils'

type Props = {
    address: string;
    amount: string;
    decimals?: number;
    icon?: string;
    symbol?: string;
    txHash: string;
}

export function TokensReceivedSuccess(props: Props): JSX.Element {
    const intl = useIntl()

    const {
        address,
        amount,
        decimals,
        icon,
        symbol,
        txHash,
    } = props

    const [formattedAmount, formattedAmountAbbr] = abbrNumber(
        new BigNumber(amount).shiftedBy(-(decimals ?? 0)).toFixed(),
    )

    return (
        <>
            <div className="notification-body">
                <div className="notification_token-badge">
                    <TokenIcon
                        address={address}
                        icon={icon}
                        size="small"
                    />
                    <div className="notification_token-badge__title">
                        {`+ ${formattedTokenAmount(
                            formattedAmount,
                            undefined,
                        )}${formattedAmountAbbr} ${symbol ?? ''}`}
                    </div>
                </div>
            </div>
            <div
                className={classNames('notification-actions', {
                    'notification-actions--large': isMobile(navigator.userAgent),
                })}
            >
                <TransactionExplorerLink
                    className={isMobile(navigator.userAgent) ? 'btn btn-link' : 'btn btn-secondary'}
                    id={txHash}
                    onClick={stopEventPropagate}
                >
                    {intl.formatMessage({ id: 'LIQUIDITY_ADD_NOTIFICATION_TRANSACTION_DETAILS_LINK_TXT' })}
                </TransactionExplorerLink>
                <AccountExplorerLink
                    address={address}
                    className={!isMobile(navigator.userAgent) ? 'btn btn-secondary' : 'btn btn-link'}
                    onClick={stopEventPropagate}
                >
                    {intl.formatMessage({ id: 'LIQUIDITY_ADD_NOTIFICATION_TOKEN_ROOT_CONTRACT_LINK_TEXT' })}
                </AccountExplorerLink>
            </div>
        </>
    )
}
