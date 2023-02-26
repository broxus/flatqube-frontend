import * as React from 'react'

import { AllPools } from '@/modules/Pools/containers/AllPools'
import { FavoritesPools } from '@/modules/Pools/containers/FavoritesPools'

export function Pools(): JSX.Element {
    return (
        <>
            <FavoritesPools />
            <AllPools />
        </>
    )
}
