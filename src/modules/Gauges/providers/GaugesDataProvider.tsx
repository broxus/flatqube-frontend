import * as React from 'react'
import { observer } from 'mobx-react-lite'

import { GaugesDataStore } from '@/modules/Gauges/stores/GaugesDataStore'
import { useGaugesDataStore } from '@/modules/Gauges/hooks/useGaugesDataStore'
import { useContext } from '@/hooks/useContext'
import { GaugesTokensContext } from '@/modules/Gauges/providers/GaugesTokensProvider'
import { GaugesAutoResyncContext } from '@/modules/Gauges/providers/GaugesAutoResyncProvider'
import { GaugesPriceContext } from '@/modules/Gauges/providers/GaugesPriceProvider'

export const GaugesDataStoreContext = React.createContext<GaugesDataStore | undefined>(undefined)
GaugesDataStoreContext.displayName = 'DataStore'

type Props = {
    id: string;
    children: React.ReactNode;
}

function GaugesDataProviderInner({
    id,
    children,
}: Props): JSX.Element | null {
    const tokens = useContext(GaugesTokensContext)
    const price = useContext(GaugesPriceContext)
    const autoResync = useContext(GaugesAutoResyncContext)
    const dataStore = useGaugesDataStore(tokens, autoResync, price)

    React.useEffect(() => {
        dataStore.init(id)

        return () => {
            dataStore.dispose()
        }
    }, [id])

    return (
        <GaugesDataStoreContext.Provider value={dataStore}>
            {children}
        </GaugesDataStoreContext.Provider>
    )
}

export const GaugesDataProvider = observer(GaugesDataProviderInner)
