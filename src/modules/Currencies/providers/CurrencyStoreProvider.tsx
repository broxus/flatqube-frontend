import * as React from 'react'

import { CurrencyStore } from '@/modules/Currencies/stores/CurrencyStore'
import { error } from '@/utils'


type Props = {
    address: string;
    children: React.ReactChild;
}


export const Context = React.createContext<CurrencyStore>(new CurrencyStore(''))

export function useCurrencyStore(): CurrencyStore {
    return React.useContext(Context)
}

export function CurrencyStoreProvider({ address, children }: Props): JSX.Element {
    const store = React.useMemo(() => new CurrencyStore(address), [address])

    React.useEffect(() => {
        try {
            store.load()
            store.loadPairs()
            store.loadTransactions()
        }
        catch (e) {
            error(e)
        }
    }, [address])

    return (
        <Context.Provider value={store}>
            {children}
        </Context.Provider>
    )
}
