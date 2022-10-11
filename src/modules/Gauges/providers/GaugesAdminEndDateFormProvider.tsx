import * as React from 'react'

import { GaugesAdminEndDateFormStore } from '@/modules/Gauges/stores/GaugesAdminEndDateFormStore'
import { useGaugesAdminEndDateFormStore } from '@/modules/Gauges/hooks/useGaugesAdminEndDateFormStore'
import { useContext } from '@/hooks/useContext'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'
import { useWallet } from '@/stores/WalletService'

export const GaugesAdminEndDateFormContext = React.createContext<GaugesAdminEndDateFormStore | undefined>(undefined)
GaugesAdminEndDateFormContext.displayName = 'AdminEndDateForm'

type Props = {
    children: React.ReactNode;
}

export function GaugesAdminEndDateFormProvider({
    children,
}: Props): JSX.Element | null {
    const data = useContext(GaugesDataStoreContext)
    const wallet = useWallet()
    const adminEndDateFormStore = useGaugesAdminEndDateFormStore(data, wallet)

    return (
        <GaugesAdminEndDateFormContext.Provider value={adminEndDateFormStore}>
            {children}
        </GaugesAdminEndDateFormContext.Provider>
    )
}
