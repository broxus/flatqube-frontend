import * as React from 'react'
import { useIntl } from 'react-intl'

import { OrderingSwitcher } from '@/components/common/OrderingSwitcher'
import { useSwapPoolTransactionsStoreContext } from '@/modules/Swap/context/SwapPoolTransactionsStoreProvider'
import { PoolTransactionsOrdering } from '@/modules/Pools/types'

export function SwapTransactionsListHeader(): JSX.Element {
    const intl = useIntl()

    const swapTransactionsStore = useSwapPoolTransactionsStoreContext()

    const onSwitchOrdering = async (value: PoolTransactionsOrdering) => {
        swapTransactionsStore.setState({
            ordering: value,
            pagination: {
                ...swapTransactionsStore.pagination,
                currentPage: 1,
            },
        })
        await swapTransactionsStore.fetch(true)
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
                    value={swapTransactionsStore.ordering}
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
                    value={swapTransactionsStore.ordering}
                    onSwitch={onSwitchOrdering}
                >
                    {intl.formatMessage({ id: 'POOL_TRANSACTIONS_LIST_HEADER_DATE_CELL' })}
                </OrderingSwitcher>
            </div>
        </div>
    )
}
