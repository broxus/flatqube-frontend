import * as React from 'react'

import { GaugesAdminDepositStore } from '@/modules/Gauges/stores/GaugesAdminDepositStore'
import { useGaugesAdminDepositStore } from '@/modules/Gauges/hooks/useGaugesAdminDepositStore'
import { useWallet } from '@/stores/WalletService'
import { useContext } from '@/hooks/useContext'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'

export const GaugesAdminDepositContext = React.createContext<GaugesAdminDepositStore | undefined>(undefined)
GaugesAdminDepositContext.displayName = 'AdminDeposit'

type Props = {
    children: React.ReactNode;
}

export function GaugesAdminDepositProvider({
    children,
}: Props): JSX.Element | null {
    const wallet = useWallet()
    const dataStore = useContext(GaugesDataStoreContext)
    const adminDepositStore = useGaugesAdminDepositStore(wallet, dataStore)

    React.useEffect(() => {
        adminDepositStore.init()

        return () => {
            adminDepositStore.dispose()
        }
    }, [])

    return (
        <GaugesAdminDepositContext.Provider value={adminDepositStore}>
            {children}
        </GaugesAdminDepositContext.Provider>
    )
}
