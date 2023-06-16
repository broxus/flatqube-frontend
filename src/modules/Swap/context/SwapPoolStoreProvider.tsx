import * as React from 'react'

import { SwapPoolStore } from '@/modules/Swap/stores/SwapPoolStore'
import { useTokensCache } from '@/stores/TokensCacheService'
import { useWallet } from '@/stores/WalletService'

export type SwapPoolStoreProviderProps = React.PropsWithChildren<{ address: string }>

// @ts-ignore
export const SwapPoolStoreContext = React.createContext<SwapPoolStore>()

export function useSwapPoolStoreContext(): SwapPoolStore {
    return React.useContext(SwapPoolStoreContext)
}

export function SwapPoolStoreProvider(props: SwapPoolStoreProviderProps): JSX.Element {
    const { address, children } = props

    const context = React.useMemo(() => new SwapPoolStore(address, useWallet(), useTokensCache()), [address])

    return (
        <SwapPoolStoreContext.Provider value={context}>
            {children}
        </SwapPoolStoreContext.Provider>
    )
}
