import * as React from 'react'
import { useParams } from 'react-router-dom'

import { Pool } from '@/modules/Pools/pool'
import { PoolStoreProvider } from '@/modules/Pools/context'

export default function Page(): JSX.Element {
    const params = useParams<{ address: string }>()

    return (
        <div className="container container--large">
            <PoolStoreProvider address={params.address}>
                <Pool />
            </PoolStoreProvider>
        </div>
    )
}
