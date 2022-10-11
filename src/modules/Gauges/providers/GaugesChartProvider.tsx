import * as React from 'react'

import { GaugesChartStore } from '@/modules/Gauges/stores/GaugesChartStore'
import { useGaugesChartStore } from '@/modules/Gauges/hooks/useGaugesChartStore'

export const GaugesChartContext = React.createContext<GaugesChartStore | undefined>(undefined)
GaugesChartContext.displayName = 'Chart'

type Props = {
    id: string;
    children: React.ReactNode;
}

export function GaugesChartProvider({
    id,
    children,
}: Props): JSX.Element | null {
    const chart = useGaugesChartStore()

    React.useEffect(() => {
        chart.init(id)

        return () => {
            chart.dispose()
        }
    }, [])

    return (
        <GaugesChartContext.Provider value={chart}>
            {children}
        </GaugesChartContext.Provider>
    )
}
