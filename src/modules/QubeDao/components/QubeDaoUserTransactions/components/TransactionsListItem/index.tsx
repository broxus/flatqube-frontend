import * as React from 'react'
import { DateTime } from 'luxon'
import { useIntl } from 'react-intl'

import { TransactionExplorerLink } from '@/components/common/TransactionExplorerLink'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import type { QubeDaoTransactionResponse } from '@/modules/QubeDao/types'
import { formattedTokenAmount } from '@/utils'

type Props = {
    transaction: QubeDaoTransactionResponse;
}

export function TransactionsListItem({ transaction }: Props): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()

    return (
        <div className="list__row">
            <div className="list__cell list__cell--left">
                <TransactionExplorerLink id={transaction.transactionHash}>
                    {intl.formatMessage({
                        id: `QUBE_DAO_USER_TRANSACTIONS_KIND_${transaction.kind}`.toUpperCase(),
                    }, { symbol: daoContext.tokenSymbol })}
                </TransactionExplorerLink>
            </div>
            <div className="list__cell list__cell--right">
                {formattedTokenAmount(
                    transaction.amount,
                    daoContext.tokenDecimals,
                )}
            </div>
            <div className="list__cell list__cell--right">
                {formattedTokenAmount(
                    transaction.veAmount,
                    daoContext.veDecimals,
                )}
            </div>
            <div className="list__cell list__cell--right">
                <TransactionExplorerLink id={transaction.transactionHash}>
                    {DateTime.fromSeconds(transaction.transactionTime, {
                        locale: intl.locale,
                    }).toRelative()}
                </TransactionExplorerLink>
            </div>
        </div>
    )
}
