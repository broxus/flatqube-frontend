import * as React from 'react'
import { reaction } from 'mobx'

import { usePoolStoreContext } from '@/modules/Pools/context/PoolStoreProvider'
import { PoolTransactionsStore } from '@/modules/Pools/stores/PoolTransactionsStore'

export type PoolTransactionsStoreProviderProps = React.PropsWithChildren

// @ts-ignore
export const PoolTransactionsStoreContext = React.createContext<PoolTransactionsStore>()

export function usePoolTransactionsStoreContext(): PoolTransactionsStore {
    return React.useContext(PoolTransactionsStoreContext)
}

export function PoolTransactionsStoreProvider(props: PoolTransactionsStoreProviderProps): JSX.Element {
    const { children } = props

    const poolStore = usePoolStoreContext()

    const context = React.useMemo(() => new PoolTransactionsStore(poolStore), [])

    React.useEffect(() => reaction(
        () => [poolStore.tokensCache.isReady, poolStore.pool?.meta.currencyAddresses],
        async ([isTokensCacheReady, currencyAddresses]) => {
            if (isTokensCacheReady && currencyAddresses !== undefined && (currencyAddresses as string[]).length > 0) {
                await context.fetch()
            }
        },
        { delay: 50, fireImmediately: true },
    ), [])

    return (
        <PoolTransactionsStoreContext.Provider value={context}>
            {children}
        </PoolTransactionsStoreContext.Provider>
    )
}
