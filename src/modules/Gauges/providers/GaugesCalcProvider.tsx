import * as React from 'react'

import { GaugesCalcStore } from '@/modules/Gauges/stores/GaugesCalcStore'
import { useGaugesCalcStore } from '@/modules/Gauges/hooks/useGaugesCalcStore'
import { useContext } from '@/hooks/useContext'
import { GaugesTokensContext } from '@/modules/Gauges/providers/GaugesTokensProvider'
import { GaugesFavoritesContext } from '@/modules/Gauges/providers/GaugesFavoritesProvider'
import { useWallet } from '@/stores/WalletService'

export const GaugesCalcContext = React.createContext<GaugesCalcStore | undefined>(undefined)
GaugesCalcContext.displayName = 'GaugesCalc'

type Props = {
    children: React.ReactNode;
}

export function GaugesCalcProvider({
    children,
}: Props): JSX.Element {
    const wallet = useWallet()
    const tokens = useContext(GaugesTokensContext)
    const favorites = useContext(GaugesFavoritesContext)
    const gaugesCalcStore = useGaugesCalcStore(tokens, favorites, wallet)

    React.useEffect(() => {
        gaugesCalcStore.init()

        return () => {
            gaugesCalcStore.dispose()
        }
    }, [])

    return (
        <GaugesCalcContext.Provider value={gaugesCalcStore}>
            {children}
        </GaugesCalcContext.Provider>
    )
}
