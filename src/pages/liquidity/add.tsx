import * as React from 'react'

import { AddLiquidity } from '@/modules/Liqudity/add'
import { AddLiquidityFormStoreProvider } from '@/modules/Liqudity/context'

export default function Page(): JSX.Element {
    return (
        <div className="container container--small">
            <AddLiquidityFormStoreProvider>
                <AddLiquidity />
            </AddLiquidityFormStoreProvider>
        </div>
    )
}
