import * as React from 'react'

import { GaugesTransactionsStore } from '@/modules/Gauges/stores/GaugesTransactionsStore'
import { useGaugesTransactionsStore } from '@/modules/Gauges/hooks/useGaugesTransactionsStore'
import { useContext } from '@/hooks/useContext'
import { GaugesAutoResyncContext } from '@/modules/Gauges/providers/GaugesAutoResyncProvider'
import { GaugesTokensContext } from '@/modules/Gauges/providers/GaugesTokensProvider'
import { GaugesPriceContext } from '@/modules/Gauges/providers/GaugesPriceProvider'

export const GaugesTransactionsContext = React.createContext<GaugesTransactionsStore | undefined>(undefined)
GaugesTransactionsContext.displayName = 'Transactions'

type Props = {
    id?: string;
    user?: string;
    children: React.ReactNode;
}

export function GaugesTransactionsProvider({
    id,
    user,
    children,
}: Props): JSX.Element {
    const autoResync = useContext(GaugesAutoResyncContext)
    const tokens = useContext(GaugesTokensContext)
    const price = useContext(GaugesPriceContext)
    const transactionsStore = useGaugesTransactionsStore(autoResync, tokens, price)

    React.useEffect(() => {
        if (id) {
            transactionsStore.init(id)

            return () => {
                transactionsStore.dispose()
            }
        }
        return undefined
    }, [id])

    React.useEffect(() => {
        transactionsStore.setUser(user)
    }, [user])

    return (
        <GaugesTransactionsContext.Provider value={transactionsStore}>
            {children}
        </GaugesTransactionsContext.Provider>
    )
}
