import * as React from 'react'
import { useParams } from 'react-router-dom'

import { AddLiquidityFormStoreProvider } from '@/modules/Pools/context'
import { AddLiquidity } from '@/modules/Pools/add-liquidity'
import type { URLAddressParam } from '@/routes'

export default function Page(): JSX.Element {
    const { address } = useParams<URLAddressParam>()

    return (
        <div className="container container--small">
            <AddLiquidityFormStoreProvider poolAddress={address}>
                <AddLiquidity />
            </AddLiquidityFormStoreProvider>
        </div>
    )
}
