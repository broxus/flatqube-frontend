import * as React from 'react'

import { GaugesUserPerformanceStore } from '@/modules/Gauges/stores/GaugesUserPerformanceStore'
import { useGaugesUserPerformanceStore } from '@/modules/Gauges/hooks/useGaugesUserPerformanceStore'
import { useWallet } from '@/stores/WalletService'

export const GaugesUserPerformanceContext = React.createContext<GaugesUserPerformanceStore | undefined>(undefined)
GaugesUserPerformanceContext.displayName = 'UserPerformance'

type Props = {
    children: React.ReactNode;
}

export function GaugesUserPerformanceProvider({
    children,
}: Props): JSX.Element | null {
    const wallet = useWallet()
    const userPerformanceStore = useGaugesUserPerformanceStore()

    React.useEffect(() => {
        if (!wallet.address) {
            userPerformanceStore.setRoot()
        }
    }, [wallet.address])

    return (
        <GaugesUserPerformanceContext.Provider value={userPerformanceStore}>
            {children}
        </GaugesUserPerformanceContext.Provider>
    )
}
