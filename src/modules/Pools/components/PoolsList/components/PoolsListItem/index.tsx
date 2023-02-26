import * as React from 'react'

import { RateChange } from '@/components/common/RateChange'
import { FaveButton, PoolTokensBadge } from '@/modules/Pools/components/PoolsCommon'
import { PoolsListItemShareCell } from '@/modules/Pools/components/PoolsList/components/PoolsListItemShareCell'
import { usePoolsStoreContext } from '@/modules/Pools/context'
import type { PoolResponse } from '@/modules/Pools/types'
import { formattedAmount } from '@/utils'

type Props = {
    idx: number;
    pool: PoolResponse;
}

export function PoolsListItem({ idx, pool }: Props): JSX.Element {
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
        <div className="list__row">
            <div className="list__cell list__cell--center">
                {idx}
            </div>
            <div className="list__cell list__cell--left">
                <div className=" list__cell-inner">
                    <FaveButton poolAddress={pool.meta.poolAddress} iconRatio={0.8} />
                    <PoolTokensBadge items={items} poolAddress={pool.meta.poolAddress.toString()} />
                </div>
            </div>
            <div className="list__cell list__cell--right">
                <PoolsListItemShareCell pool={pool} />
            </div>
            <div className="list__cell list__cell--right">
                {`$${formattedAmount(pool.volume24h)}`}
                <div>
                    <RateChange size="sm" value={pool.volume24hChange} />
                </div>
            </div>
            <div className="list__cell list__cell--right">
                {`$${formattedAmount(pool.volume7d)}`}
            </div>
            <div className="list__cell list__cell--right">
                {`$${formattedAmount(pool.tvl)}`}
                <div>
                    <RateChange size="sm" value={pool.tvlChange} />
                </div>
            </div>
        </div>
    )
}
