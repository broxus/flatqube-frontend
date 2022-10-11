import * as React from 'react'

import { FavoritePairs } from '@/stores/FavoritePairs'
import { useGaugesFavoritePairs } from '@/modules/Gauges/hooks/useGaugesFavoritePairs'
import { useWallet } from '@/stores/WalletService'

export const GaugesFavoritesContext = React.createContext<FavoritePairs | undefined>(undefined)
GaugesFavoritesContext.displayName = 'Favorites'

type Props = {
    children: React.ReactNode;
}

export function GaugesFavoritesProvider({
    children,
}: Props): JSX.Element | null {
    const wallet = useWallet()
    const favorites = useGaugesFavoritePairs(wallet)

    return (
        <GaugesFavoritesContext.Provider value={favorites}>
            {children}
        </GaugesFavoritesContext.Provider>
    )
}
