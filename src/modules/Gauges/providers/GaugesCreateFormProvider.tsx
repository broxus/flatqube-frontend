import * as React from 'react'

import { GaugesCreateFormStore } from '@/modules/Gauges/stores/GaugesCreateFormStore'
import { useGaugesCreateFormStore } from '@/modules/Gauges/hooks/useGaugesCreateFormStore'
import { useContext } from '@/hooks/useContext'
import { GaugesTokensContext } from '@/modules/Gauges/providers/GaugesTokensProvider'
import { useWallet } from '@/stores/WalletService'
import { GaugesFavoritesContext } from '@/modules/Gauges/providers/GaugesFavoritesProvider'

export const GaugesCreateFormContext = React.createContext<GaugesCreateFormStore | undefined>(undefined)
GaugesCreateFormContext.displayName = 'CreateForm'

type Props = {
    children: React.ReactNode;
}

export function GaugesCreateFormProvider({
    children,
}: Props): JSX.Element | null {
    const wallet = useWallet()
    const tokens = useContext(GaugesTokensContext)
    const favorites = useContext(GaugesFavoritesContext)
    const createFormStore = useGaugesCreateFormStore(tokens, wallet, favorites)

    React.useEffect(() => {
        createFormStore.init()

        return () => {
            createFormStore.dispose()
        }
    }, [])

    return (
        <GaugesCreateFormContext.Provider value={createFormStore}>
            {children}
        </GaugesCreateFormContext.Provider>
    )
}
