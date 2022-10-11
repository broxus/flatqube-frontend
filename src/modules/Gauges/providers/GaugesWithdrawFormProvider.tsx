import * as React from 'react'

import { GaugesWithdrawFormStore } from '@/modules/Gauges/stores/GaugesWithdrawFormStore'
import { useGaugesWithdrawFormStore } from '@/modules/Gauges/hooks/useGaugesWithdrawFormStore'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'
import { useContext } from '@/hooks/useContext'
import { GaugesUserDataContext } from '@/modules/Gauges/providers/GaugesUserDataProvider'
import { useWallet } from '@/stores/WalletService'

export const GaugesWithdrawFormContext = React.createContext<GaugesWithdrawFormStore | undefined>(undefined)
GaugesWithdrawFormContext.displayName = 'WithdrawForm'

type Props = {
    children: React.ReactNode;
}

export function GaugesWithdrawFormProvider({
    children,
}: Props): JSX.Element | null {
    const wallet = useWallet()
    const data = useContext(GaugesDataStoreContext)
    const userData = useContext(GaugesUserDataContext)
    const withdrawFormStore = useGaugesWithdrawFormStore(wallet, data, userData)

    return (
        <GaugesWithdrawFormContext.Provider value={withdrawFormStore}>
            {children}
        </GaugesWithdrawFormContext.Provider>
    )
}
