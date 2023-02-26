import * as React from 'react'

import { RateChange } from '@/components/common/RateChange'
import { PoolTokensBadge } from '@/modules/Currencies/components/CurrenciesCommon/PoolTokensBadge'
import { useCurrencyStoreContext } from '@/modules/Currencies/providers'
import type { PoolResponse } from '@/modules/Pools/types'
import { formattedAmount } from '@/utils'
import {
    RelatedPoolsListItemShareCell,
} from '@/modules/Currencies/components/CurrencyRelatedPools/components/RelatedPoolsListItemShareCell'

type Props = {
    idx: number;
    pool: PoolResponse;
}

export function RelatedPoolsListItem({ idx, pool }: Props): JSX.Element {
    const currencyStore = useCurrencyStoreContext()

    const items = React.useMemo(() => pool.meta.currencyAddresses.map((address, i) => {
        const token = currencyStore.tokensCache.get(address)
        return {
            address,
            icon: token?.icon,
            symbol: token?.symbol ?? pool.meta.currencies[i],
        }
    }), [])

    return (
        <div className="list__row">
            <div className="list__cell list__cell--center">
                {idx}
            </div>
            <div className="list__cell list__cell--left">
                <PoolTokensBadge
                    poolAddress={pool.meta.poolAddress}
                    items={items}
                />
            </div>
            <div className="list__cell list__cell--right">
                <RelatedPoolsListItemShareCell pool={pool} />
            </div>
            <div className="list__cell list__cell--right">
                <div>{`$${formattedAmount(pool.volume24h)}`}</div>
                <RateChange size="sm" value={formattedAmount(pool.volume24hChange)} />
            </div>
            <div className="list__cell list__cell--right">
                <div>{`$${formattedAmount(pool.volume7d)}`}</div>
            </div>
            <div className="list__cell list__cell--right">
                <div>{`$${formattedAmount(pool.tvl)}`}</div>
                <RateChange size="sm" value={formattedAmount(pool.tvlChange)} />
            </div>
        </div>
    )
}
