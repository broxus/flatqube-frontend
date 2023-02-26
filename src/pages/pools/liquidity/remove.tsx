import * as React from 'react'
import { useParams } from 'react-router-dom'

import { RemoveLiquidityFormStoreProvider } from '@/modules/Pools/context'
import { RemoveLiquidity } from '@/modules/Pools/remove-liquidity'
import type { URLAddressParam } from '@/routes'

export default function Page(): JSX.Element {
    const { address } = useParams<URLAddressParam>()

    return (
        <div className="container container--small">
            <RemoveLiquidityFormStoreProvider poolAddress={address}>
                <RemoveLiquidity />
            </RemoveLiquidityFormStoreProvider>
        </div>
    )
}
