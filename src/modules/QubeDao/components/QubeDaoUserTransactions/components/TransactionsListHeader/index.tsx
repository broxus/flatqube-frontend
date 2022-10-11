import * as React from 'react'
import { useIntl } from 'react-intl'

import { OrderingSwitcher } from '@/components/common/OrderingSwitcher'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { useQubeDaoTransactionsStore } from '@/modules/QubeDao/providers/QubeDaoTransactionsStoreProvider'
import type { Direction, QubeDaoTransactionColumn } from '@/modules/QubeDao/types'

export function TransactionsListHeader(): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()
    const transactionsStore = useQubeDaoTransactionsStore()

    const onSwitchOrdering = async (value: string) => {
        const [column, direction] = value.split('_') as [k: QubeDaoTransactionColumn, d: Direction]
        transactionsStore.setState('ordering', { column, direction })
        await transactionsStore.fetch(true)
    }

    return (
        <div className="list__header">
            <div className="list__cell list__cell--left">
                {intl.formatMessage({ id: 'QUBE_DAO_USER_TRANSACTIONS_LIST_HEADER_KIND_CELL' })}
            </div>
            <div className="list__cell list__cell--right">
                <OrderingSwitcher
                    ascending="amount_ASC"
                    descending="amount_DESC"
                    value={`${transactionsStore.ordering.column}_${transactionsStore.ordering.direction}`}
                    onSwitch={onSwitchOrdering}
                >
                    {intl.formatMessage(
                        { id: 'QUBE_DAO_USER_TRANSACTIONS_LIST_HEADER_AMOUNT_CELL' },
                        { symbol: daoContext.tokenSymbol },
                    )}
                </OrderingSwitcher>
            </div>
            <div className="list__cell list__cell--right">
                <OrderingSwitcher
                    ascending="veAmount_ASC"
                    descending="veAmount_DESC"
                    value={`${transactionsStore.ordering.column}_${transactionsStore.ordering.direction}`}
                    onSwitch={onSwitchOrdering}
                >
                    {intl.formatMessage(
                        { id: 'QUBE_DAO_USER_TRANSACTIONS_LIST_HEADER_AMOUNT_CELL' },
                        { symbol: daoContext.veSymbol },
                    )}
                </OrderingSwitcher>
            </div>
            <div className="list__cell list__cell--right">
                <OrderingSwitcher
                    ascending="createdAt_ASC"
                    descending="createdAt_DESC"
                    value={`${transactionsStore.ordering.column}_${transactionsStore.ordering.direction}`}
                    onSwitch={onSwitchOrdering}
                >
                    {intl.formatMessage({ id: 'QUBE_DAO_USER_TRANSACTIONS_LIST_HEADER_DATE_CELL' })}
                </OrderingSwitcher>
            </div>
        </div>
    )
}
