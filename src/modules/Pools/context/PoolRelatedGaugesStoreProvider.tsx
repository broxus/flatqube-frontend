import * as React from 'react'

import { usePoolStoreContext } from '@/modules/Pools/context/PoolStoreProvider'
import { PoolRelatedGaugesStore } from '@/modules/Pools/stores/PoolRelatedGaugesStore'

export type PoolRelatedGaugesStoreProviderProps = React.PropsWithChildren

// @ts-ignore
export const PoolRelatedGaugesStoreContext = React.createContext<PoolRelatedGaugesStore>()

export function usePoolRelatedGaugesStoreContext(): PoolRelatedGaugesStore {
    return React.useContext(PoolRelatedGaugesStoreContext)
}

export function PoolRelatedGaugesStoreProvider(props: PoolRelatedGaugesStoreProviderProps): JSX.Element {
    const { children } = props

    const poolStore = usePoolStoreContext()

    const context = React.useMemo(() => new PoolRelatedGaugesStore(poolStore), [])

    return (
        <PoolRelatedGaugesStoreContext.Provider value={context}>
            {children}
        </PoolRelatedGaugesStoreContext.Provider>
    )
}
