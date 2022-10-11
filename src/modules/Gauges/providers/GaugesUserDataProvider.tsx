import * as React from 'react'
import { observer } from 'mobx-react-lite'

import { GaugesUserDataStore } from '@/modules/Gauges/stores/GaugesUserDataStore'
import { useGaugesUserDataStore } from '@/modules/Gauges/hooks/useGaugesUserDataStore'
import { useWallet } from '@/stores/WalletService'
import { useContext } from '@/hooks/useContext'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'
import { GaugesAutoResyncContext } from '@/modules/Gauges/providers/GaugesAutoResyncProvider'
import { GaugesPriceContext } from '@/modules/Gauges/providers/GaugesPriceProvider'

export const GaugesUserDataContext = React.createContext<GaugesUserDataStore | undefined>(undefined)
GaugesUserDataContext.displayName = 'UserData'

type Props = {
    children: React.ReactNode;
}

function GaugesUserDataProviderInner({
    children,
}: Props): JSX.Element | null {
    const wallet = useWallet()
    const price = useContext(GaugesPriceContext)
    const dataStore = useContext(GaugesDataStoreContext)
    const autoResync = useContext(GaugesAutoResyncContext)
    const userDataStore = useGaugesUserDataStore(wallet, dataStore, autoResync, price)

    React.useEffect(() => {
        userDataStore.init()

        return () => {
            userDataStore.dispose()
        }
    }, [])

    return (
        <GaugesUserDataContext.Provider value={userDataStore}>
            {children}
        </GaugesUserDataContext.Provider>
    )
}

export const GaugesUserDataProvider = observer(GaugesUserDataProviderInner)
