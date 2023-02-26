import * as React from 'react'

import { useCurrencyStoreContext } from '@/modules/Currencies/providers/CurrencyStoreProvider'
import { CurrencyRelatedPoolsStore } from '@/modules/Currencies/stores/CurrencyRelatedPoolsStore'

export type CurrencyRelatedPoolsStoreProviderProps = React.PropsWithChildren

// @ts-ignore
export const CurrencyRelatedPoolsStoreContext = React.createContext<CurrencyRelatedPoolsStore>()

export function useCurrencyRelatedPoolsStoreContext(): CurrencyRelatedPoolsStore {
    return React.useContext(CurrencyRelatedPoolsStoreContext)
}

export function CurrencyRelatedPoolsStoreProvider(props: CurrencyRelatedPoolsStoreProviderProps): JSX.Element {
    const { children } = props

    const currencyStore = useCurrencyStoreContext()

    const context = React.useMemo(() => new CurrencyRelatedPoolsStore(currencyStore), [])

    return (
        <CurrencyRelatedPoolsStoreContext.Provider value={context}>
            {children}
        </CurrencyRelatedPoolsStoreContext.Provider>
    )
}
