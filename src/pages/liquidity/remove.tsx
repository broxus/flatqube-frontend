import * as React from 'react'

import { RemoveLiquidity } from '@/modules/Liqudity/remove'
import { RemoveLiquidityFormStoreProvider } from '@/modules/Liqudity/context'

export default function Page(): JSX.Element {
    return (
        <div className="container container--small">
            <RemoveLiquidityFormStoreProvider>
                <RemoveLiquidity />
            </RemoveLiquidityFormStoreProvider>
        </div>
    )
}
