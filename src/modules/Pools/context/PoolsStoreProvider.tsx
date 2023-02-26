import * as React from 'react'

import { PoolsStore, PoolsStoreCtorParams } from '@/modules/Pools/stores/PoolsStore'
import { useTokensCache } from '@/stores/TokensCacheService'
import { useWallet } from '@/stores/WalletService'

export type PoolsStoreProviderProps = React.PropsWithChildren<{
    params?: PoolsStoreCtorParams;
}>

// @ts-ignore
export const PoolsStoreContext = React.createContext<PoolsStore>()

export function usePoolsStoreContext(): PoolsStore {
    return React.useContext(PoolsStoreContext)
}

export function PoolsStoreProvider(props: PoolsStoreProviderProps): JSX.Element {
    const { children, params } = props

    const context = React.useMemo(() => new PoolsStore(useWallet(), useTokensCache(), params), [params])

    return (
        <PoolsStoreContext.Provider value={context}>
            {children}
        </PoolsStoreContext.Provider>
    )
}
