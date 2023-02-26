import * as React from 'react'
import { useIntl } from 'react-intl'

import { OrderingSwitcher } from '@/components/common/OrderingSwitcher'
import { usePoolTransactionsStoreContext } from '@/modules/Pools/context/PoolTransactionsStoreProvider'
import { PoolTransactionsOrdering } from '@/modules/Pools/types'

export function TransactionsListHeader(): JSX.Element {
    const intl = useIntl()

    const transactionsStore = usePoolTransactionsStoreContext()

    const onSwitchOrdering = async (value: PoolTransactionsOrdering) => {
        transactionsStore.setState({
            ordering: value,
            pagination: {
                ...transactionsStore.pagination,
                currentPage: 1,
            },
        })
        await transactionsStore.fetch(true)
    }

    return (
        <div className="list__header">
            <div className="list__cell list__cell--left">
                {intl.formatMessage({ id: 'POOL_TRANSACTIONS_LIST_HEADER_TYPE_CELL' })}
            </div>
            <div className="list__cell list__cell--left">
                {intl.formatMessage({ id: 'POOL_TRANSACTIONS_LIST_HEADER_TOKENS_CELL' })}
            </div>
            <div className="list__cell list__cell--right">
                <OrderingSwitcher
                    ascending={PoolTransactionsOrdering.TvAscending}
                    descending={PoolTransactionsOrdering.TvDescending}
                    value={transactionsStore.ordering}
                    onSwitch={onSwitchOrdering}
                >
                    {intl.formatMessage(
                        { id: 'POOL_TRANSACTIONS_LIST_HEADER_TOTAL_VALUE_CELL' },
                    )}
                </OrderingSwitcher>
            </div>
            <div className="list__cell list__cell--right">
                {intl.formatMessage(
                    { id: 'POOL_TRANSACTIONS_LIST_HEADER_ACCOUNT_CELL' },
                )}
            </div>
            <div className="list__cell list__cell--right">
                <OrderingSwitcher
                    ascending={PoolTransactionsOrdering.BlockTimeAscending}
                    descending={PoolTransactionsOrdering.BlockTimeDescending}
                    value={transactionsStore.ordering}
                    onSwitch={onSwitchOrdering}
                >
                    {intl.formatMessage({ id: 'POOL_TRANSACTIONS_LIST_HEADER_DATE_CELL' })}
                </OrderingSwitcher>
            </div>
        </div>
    )
}
