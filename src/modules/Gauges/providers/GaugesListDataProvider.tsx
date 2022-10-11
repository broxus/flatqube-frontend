import * as React from 'react'

import { GaugesListDataStore } from '@/modules/Gauges/stores/GaugesListDataStore'
import { useGaugesListDataStore } from '@/modules/Gauges/hooks/useGaugesListDataStore'
import { useWallet } from '@/stores/WalletService'
import { useContext } from '@/hooks/useContext'
import { GaugesTokensContext } from '@/modules/Gauges/providers/GaugesTokensProvider'

export const GaugesListDataContext = React.createContext<GaugesListDataStore | undefined>(undefined)
GaugesListDataContext.displayName = 'GaugesListData'

type Props = {
    children?: React.ReactNode;
}

export function GaugesListDataProvider({
    children,
}: Props): JSX.Element {
    const wallet = useWallet()
    const tokens = useContext(GaugesTokensContext)
    const gaugesDataStore = useGaugesListDataStore(wallet, tokens)

    React.useEffect(() => {
        gaugesDataStore.init()

        return () => {
            gaugesDataStore.dispose()
        }
    }, [])

    return (
        <GaugesListDataContext.Provider value={gaugesDataStore}>
            {children}
        </GaugesListDataContext.Provider>
    )
}
