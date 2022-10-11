import * as React from 'react'

import { GaugesAdminWithdrawStore } from '@/modules/Gauges/stores/GaugesAdminWithdrawStore'
import { useGaugesAdminWithdrawStore } from '@/modules/Gauges/hooks/useGaugesAdminWithdrawStore'
import { useWallet } from '@/stores/WalletService'
import { useContext } from '@/hooks/useContext'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'

export const GaugesAdminWithdrawContext = React.createContext<GaugesAdminWithdrawStore | undefined>(undefined)
GaugesAdminWithdrawContext.displayName = 'AdminWithdraw'

type Props = {
    children: React.ReactNode;
}

export function GaugesAdminWithdrawProvider({
    children,
}: Props): JSX.Element | null {
    const wallet = useWallet()
    const dataStore = useContext(GaugesDataStoreContext)
    const adminWithdrawStore = useGaugesAdminWithdrawStore(wallet, dataStore)

    return (
        <GaugesAdminWithdrawContext.Provider value={adminWithdrawStore}>
            {children}
        </GaugesAdminWithdrawContext.Provider>
    )
}
