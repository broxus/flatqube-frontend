import * as React from 'react'

import { PoolStore } from '@/modules/Pools/stores/PoolStore'
import { useTokensCache } from '@/stores/TokensCacheService'
import { useWallet } from '@/stores/WalletService'

export type PoolStoreProviderProps = React.PropsWithChildren<{ address: string }>

// @ts-ignore
export const PoolStoreContext = React.createContext<PoolStore>()

export function usePoolStoreContext(): PoolStore {
    return React.useContext(PoolStoreContext)
}

export function PoolStoreProvider(props: PoolStoreProviderProps): JSX.Element {
    const { address, children } = props

    const context = React.useMemo(() => new PoolStore(address, useWallet(), useTokensCache()), [address])

    return (
        <PoolStoreContext.Provider value={context}>
            {children}
        </PoolStoreContext.Provider>
    )
}
