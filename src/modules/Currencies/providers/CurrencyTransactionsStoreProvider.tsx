import * as React from 'react'
import { reaction } from 'mobx'

import { useCurrencyStoreContext } from '@/modules/Currencies/providers/CurrencyStoreProvider'
import { CurrencyTransactionsStore } from '@/modules/Currencies/stores/CurrencyTransactionsStore'

export type CurrencyTransactionsStoreProviderProps = React.PropsWithChildren

// @ts-ignore
export const CurrencyTransactionsStoreContext = React.createContext<CurrencyTransactionsStore>()

export function useCurrencyTransactionsStoreContext(): CurrencyTransactionsStore {
    return React.useContext(CurrencyTransactionsStoreContext)
}

export function CurrencyTransactionsStoreProvider(props: CurrencyTransactionsStoreProviderProps): JSX.Element {
    const { children } = props

    const currencyStore = useCurrencyStoreContext()

    const context = React.useMemo(() => new CurrencyTransactionsStore(currencyStore), [])

    React.useEffect(() => reaction(
        () => currencyStore.tokensCache.isReady,
        async isTokensCacheReady => {
            if (isTokensCacheReady) {
                await context.fetch()
            }
        },
        { delay: 50, fireImmediately: true },
    ), [])

    return (
        <CurrencyTransactionsStoreContext.Provider value={context}>
            {children}
        </CurrencyTransactionsStoreContext.Provider>
    )
}
