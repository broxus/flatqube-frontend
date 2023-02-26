import * as React from 'react'

import { CurrenciesStore } from '@/modules/Currencies/stores/CurrenciesStore'
import { useTokensCache } from '@/stores/TokensCacheService'

export type CurrenciesStoreProviderProps = React.PropsWithChildren

// @ts-ignore
export const CurrenciesStoreContext = React.createContext<CurrenciesStore>()

export function useCurrenciesStoreContext(): CurrenciesStore {
    return React.useContext(CurrenciesStoreContext)
}

export function CurrenciesStoreProvider(props: CurrenciesStoreProviderProps): JSX.Element {
    const { children } = props

    const context = React.useMemo(() => new CurrenciesStore(useTokensCache()), [])

    return (
        <CurrenciesStoreContext.Provider value={context}>
            {children}
        </CurrenciesStoreContext.Provider>
    )
}
