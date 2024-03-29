import * as React from 'react'
import { reaction, toJS } from 'mobx'

import { useSwapPoolStoreContext } from '@/modules/Swap/context/SwapPoolStoreProvider'
import { SwapPoolTransactionsStore } from '@/modules/Swap/stores/SwapPoolTransactionsStore'

export type SwapPoolTransactionsStoreProviderProps = React.PropsWithChildren

// @ts-ignore
export const SwapPoolTransactionsStoreContext = React.createContext<SwapPoolTransactionsStore>()

export function useSwapPoolTransactionsStoreContext(): SwapPoolTransactionsStore {
    return React.useContext(SwapPoolTransactionsStoreContext)
}

export function SwapPoolTransactionsStoreProvider(props: SwapPoolTransactionsStoreProviderProps): JSX.Element {
    const { children } = props

    const swapPoolStore = useSwapPoolStoreContext()

    const context = React.useMemo(() => new SwapPoolTransactionsStore(swapPoolStore), [])

    React.useEffect(() => reaction(
        () => toJS(swapPoolStore?.pool?.meta.poolAddress),
        async poolAddress => {
            const currencyAddresses = swapPoolStore?.pool?.meta.currencyAddresses
            if (swapPoolStore.tokensCache.isReady && swapPoolStore.pool?.meta.currencyAddresses !== undefined
                    && (swapPoolStore.pool?.meta.currencyAddresses as string[]).length > 0) {
                context.setData({
                    currencyAddresses: currencyAddresses ?? [],
                    poolAddress: poolAddress ?? '',
                })
                await context.fetch()
            }
        },
        { delay: 50, fireImmediately: true },
    ), [])

    return (
        <SwapPoolTransactionsStoreContext.Provider value={context}>
            {children}
        </SwapPoolTransactionsStoreContext.Provider>
    )
}
