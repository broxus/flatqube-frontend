import * as React from 'react'
import { DateTime } from 'luxon'
import { useIntl } from 'react-intl'

import { AccountExplorerLink } from '@/components/common/AccountExplorerLink'
import { TransactionExplorerLink } from '@/components/common/TransactionExplorerLink'
import { SwapTokensCell } from '@/modules/Swap/components/SwapPoolTransactions/components/TokensCell'
import type { PoolTransactionResponse } from '@/modules/Pools/types'
import { formattedAmount, sliceAddress } from '@/utils'

type Props = {
    transaction: PoolTransactionResponse;
}

export function SwapTransactionsListItem({ transaction }: Props): JSX.Element {
    const intl = useIntl()

    return (
        <div className="list__row">
            <div className="list__cell list__cell--left">
                <TransactionExplorerLink id={transaction.transactionHash}>
                    {intl.formatMessage({
                        id: `POOL_TRANSACTION_EVENT_${transaction.eventType}`.toUpperCase(),
                    })}
                </TransactionExplorerLink>
            </div>
            <div className="list__cell list__cell--left">
                <SwapTokensCell transaction={transaction} />
            </div>
            <div className="list__cell list__cell--right">
                {`$${formattedAmount(transaction.tv)}`}
            </div>
            <div className="list__cell list__cell--right">
                <AccountExplorerLink address={transaction.userAddress}>
                    {sliceAddress(transaction.userAddress)}
                </AccountExplorerLink>
            </div>
            <div className="list__cell list__cell--right">
                <TransactionExplorerLink id={transaction.transactionHash}>
                    {DateTime.fromSeconds(transaction.timestampBlock, {
                        locale: intl.locale,
                    }).toRelative()}
                </TransactionExplorerLink>
            </div>
        </div>
    )
}
