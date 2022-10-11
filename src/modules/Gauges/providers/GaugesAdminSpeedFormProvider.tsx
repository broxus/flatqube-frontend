import * as React from 'react'

import { GaugesAdminSpeedFormStore } from '@/modules/Gauges/stores/GaugesAdminSpeedFormStore'
import { useGaugesAdminSpeedFormStore } from '@/modules/Gauges/hooks/useGaugesAdminSpeedFormStore'
import { useContext } from '@/hooks/useContext'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'
import { useWallet } from '@/stores/WalletService'

export const GaugesAdminSpeedFormContext = React.createContext<GaugesAdminSpeedFormStore | undefined>(undefined)
GaugesAdminSpeedFormContext.displayName = 'AdminSpeedForm'

type Props = {
    children: React.ReactNode;
}

export function GaugesAdminSpeedFormProvider({
    children,
}: Props): JSX.Element | null {
    const data = useContext(GaugesDataStoreContext)
    const wallet = useWallet()
    const adminSpeedFormStore = useGaugesAdminSpeedFormStore(data, wallet)

    return (
        <GaugesAdminSpeedFormContext.Provider value={adminSpeedFormStore}>
            {children}
        </GaugesAdminSpeedFormContext.Provider>
    )
}
