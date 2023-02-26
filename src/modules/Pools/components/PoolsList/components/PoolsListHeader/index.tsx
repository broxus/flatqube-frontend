import * as React from 'react'
import { useIntl } from 'react-intl'

import { OrderingSwitcher } from '@/components/common/OrderingSwitcher'
import { usePoolsStoreContext } from '@/modules/Pools/context/PoolsStoreProvider'
import { PoolsOrdering } from '@/modules/Pools/types'

export function PoolsListHeader(): JSX.Element {
    const intl = useIntl()

    const poolsStore = usePoolsStoreContext()

    const onSwitchOrdering = async (value: PoolsOrdering) => {
        poolsStore.setState({
            ordering: value,
            pagination: {
                ...poolsStore.pagination,
                currentPage: 1,
            },
        })
        await poolsStore.fetch()
    }

    return (
        <div className="list__header">
            <div className="list__cell list__cell--center">
                {intl.formatMessage({ id: 'POOLS_LIST_HEADER_POOL_NUMBER_CELL' })}
            </div>
            <div className="list__cell list__cell--left">
                {intl.formatMessage({ id: 'POOLS_LIST_HEADER_POOL_CELL' })}
            </div>
            <div className="list__cell list__cell--right">
                {intl.formatMessage({ id: 'POOLS_LIST_HEADER_USER_SHARE_CELL' })}
            </div>
            <div className="list__cell list__cell--right">
                <OrderingSwitcher<PoolsOrdering>
                    ascending={PoolsOrdering.Volume24hAscending}
                    descending={PoolsOrdering.Volume24hDescending}
                    value={poolsStore.ordering}
                    onSwitch={onSwitchOrdering}
                >
                    {intl.formatMessage({ id: 'POOLS_LIST_HEADER_VOLUME24H_CELL' })}
                </OrderingSwitcher>
            </div>
            <div className="list__cell list__cell--right">
                <OrderingSwitcher<PoolsOrdering>
                    ascending={PoolsOrdering.Volume7dAscending}
                    descending={PoolsOrdering.Volume7dDescending}
                    value={poolsStore.ordering}
                    onSwitch={onSwitchOrdering}
                >
                    {intl.formatMessage({ id: 'POOLS_LIST_HEADER_VOLUME7D_CELL' })}
                </OrderingSwitcher>
            </div>
            <div className="list__cell list__cell--right">
                <OrderingSwitcher<PoolsOrdering>
                    ascending={PoolsOrdering.TvlAscending}
                    descending={PoolsOrdering.TvlDescending}
                    value={poolsStore.ordering}
                    onSwitch={onSwitchOrdering}
                >
                    {intl.formatMessage({ id: 'POOLS_LIST_HEADER_TVL_CELL' })}
                </OrderingSwitcher>
            </div>
        </div>
    )
}
