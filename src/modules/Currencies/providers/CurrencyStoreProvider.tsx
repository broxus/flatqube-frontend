import * as React from 'react'

import { CurrencyStore } from '@/modules/Currencies/stores/CurrencyStore'
import { useTokensCache } from '@/stores/TokensCacheService'
import { useWallet } from '@/stores/WalletService'

export type CurrencyStoreProviderProps = React.PropsWithChildren<{ address: string }>

// @ts-ignore
export const CurrencyStoreContext = React.createContext<CurrencyStore>()

export function useCurrencyStoreContext(): CurrencyStore {
    return React.useContext(CurrencyStoreContext)
}

export function CurrencyStoreProvider(props: CurrencyStoreProviderProps): JSX.Element {
    const { address, children } = props

    const context = React.useMemo(() => new CurrencyStore(address, useWallet(), useTokensCache()), [address])

    return (
        <CurrencyStoreContext.Provider value={context}>
            {children}
        </CurrencyStoreContext.Provider>
    )
}
