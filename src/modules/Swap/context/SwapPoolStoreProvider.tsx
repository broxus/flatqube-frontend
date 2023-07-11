import * as React from 'react'

import { SwapPoolStore } from '@/modules/Swap/stores/SwapPoolStore'
import { useTokensCache } from '@/stores/TokensCacheService'
import { useWallet } from '@/stores/WalletService'

export type SwapPoolStoreProviderProps = React.PropsWithChildren<{
    beforeInit?: (store: SwapPoolStore) => Promise<void>;
}>

// @ts-ignore
export const SwapPoolStoreContext = React.createContext<SwapPoolStore>()

export function useSwapPoolStoreContext(): SwapPoolStore {
    return React.useContext(SwapPoolStoreContext)
}

export function SwapPoolStoreProvider(props: SwapPoolStoreProviderProps): JSX.Element {
    const { beforeInit, children } = props

    const context = React.useMemo(() => new SwapPoolStore(useWallet(), useTokensCache()), [])

    React.useEffect(() => {
        beforeInit?.(context)
    }, [context])

    return (
        <SwapPoolStoreContext.Provider value={context}>
            {children}
        </SwapPoolStoreContext.Provider>
    )
}
