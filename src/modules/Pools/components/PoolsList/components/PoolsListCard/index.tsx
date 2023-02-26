import * as React from 'react'
import { useIntl } from 'react-intl'

import { FaveButton, PoolTokensBadge } from '@/modules/Pools/components/PoolsCommon'
import { PoolsListItemShareCell } from '@/modules/Pools/components/PoolsList/components/PoolsListItemShareCell'
import { usePoolsStoreContext } from '@/modules/Pools/context'
import type { PoolResponse } from '@/modules/Pools/types'
import { formattedAmount } from '@/utils'
import { RateChange } from '@/components/common/RateChange'


type Props = {
    pool: PoolResponse;
}

export function PoolsListCard({ pool }: Props): JSX.Element {
    const intl = useIntl()

    const poolsStore = usePoolsStoreContext()

    const items = React.useMemo(() => pool.meta.currencyAddresses.map((address, i) => {
        const token = poolsStore.tokensCache.get(address)
        return {
            address,
            icon: token?.icon,
            symbol: token?.symbol ?? pool.meta.currencies[i],
        }
    }), [])

    return (
        <div className="list__card">
            <div className="list-bill">
                <div className="list-bill__row margin-bottom">
                    <div className="list-bill__info">
                        <PoolTokensBadge items={items} poolAddress={pool.meta.poolAddress.toString()} />
                    </div>
                    <FaveButton poolAddress={pool.meta.poolAddress} iconRatio={0.8} />
                </div>
                <div className="list-bill__row" style={{ alignItems: 'flex-start' }}>
                    <div className="list-bill__info">
                        {intl.formatMessage({ id: 'POOLS_LIST_HEADER_TVL_CELL' })}
                    </div>
                    <div className="list-bill__val" style={{ height: 'auto' }}>
                        <RateChange size="sm" value={pool.tvlChange} />
                        &nbsp;
                        &nbsp;
                        {`$${formattedAmount(pool.tvl)}`}
                    </div>
                </div>
                <div className="list-bill__row" style={{ alignItems: 'flex-start' }}>
                    <div className="list-bill__info">
                        {intl.formatMessage({ id: 'POOLS_LIST_HEADER_VOLUME24H_CELL' })}
                    </div>
                    <div className="list-bill__val" style={{ height: 'auto' }}>
                        <RateChange size="sm" value={pool.volume24hChange} />
                        &nbsp;
                        &nbsp;
                        {`$${formattedAmount(pool.volume24h)}`}
                    </div>
                </div>
                <div className="list-bill__row" style={{ alignItems: 'flex-start' }}>
                    <div className="list-bill__info">
                        {intl.formatMessage({ id: 'POOLS_LIST_HEADER_VOLUME7D_CELL' })}
                    </div>
                    <div className="list-bill__val" style={{ height: 'auto' }}>
                        {`$${formattedAmount(pool.volume7d)}`}
                    </div>
                </div>
                <div className="list-bill__row" style={{ alignItems: 'flex-start' }}>
                    <div className="list-bill__info">
                        {intl.formatMessage({ id: 'POOLS_LIST_HEADER_USER_SHARE_CELL' })}
                    </div>
                    <div className="list-bill__val" style={{ height: 'auto' }}>
                        <PoolsListItemShareCell pool={pool} />
                    </div>
                </div>
            </div>
        </div>
    )
}
