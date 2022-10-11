import * as React from 'react'

import { GaugesPriceStore } from '@/modules/Gauges/stores/GaugesPriceStore'
import { useGaugesPriceStore } from '@/modules/Gauges/hooks/useGaugesPriceStore'

export const GaugesPriceContext = React.createContext<GaugesPriceStore | undefined>(undefined)
GaugesPriceContext.displayName = 'Price'

type Props = {
    children?: React.ReactNode;
}

export function GaugesPriceProvider({
    children,
}: Props): JSX.Element {
    const priceStore = useGaugesPriceStore()

    return (
        <GaugesPriceContext.Provider value={priceStore}>
            {children}
        </GaugesPriceContext.Provider>
    )
}
