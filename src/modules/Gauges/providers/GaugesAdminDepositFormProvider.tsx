import * as React from 'react'

import { GaugesAdminDepositFormStore } from '@/modules/Gauges/stores/GaugesAdminDepositFormStore'
import { useGaugesAdminDepositFormStore } from '@/modules/Gauges/hooks/useGaugesAdminDepositFormStore'
import { useWallet } from '@/stores/WalletService'
import { useContext } from '@/hooks/useContext'
import { GaugesAdminDepositContext } from '@/modules/Gauges/providers/GaugesAdminDepositProvider'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'

export const GaugesAdminDepositFormContext = React.createContext<GaugesAdminDepositFormStore | undefined>(undefined)
GaugesAdminDepositFormContext.displayName = 'AdminDepositForm'

type Props = {
    extraTokenIndex: number;
    children: React.ReactNode;
}

export function GaugesAdminDepositFormProvider({
    extraTokenIndex,
    children,
}: Props): JSX.Element | null {
    const wallet = useWallet()
    const data = useContext(GaugesDataStoreContext)
    const adminDeposit = useContext(GaugesAdminDepositContext)
    const adminDepositFormStore = useGaugesAdminDepositFormStore(adminDeposit, data, wallet)

    React.useEffect(() => {
        adminDepositFormStore.sync(extraTokenIndex)
    }, [extraTokenIndex])

    return (
        <GaugesAdminDepositFormContext.Provider value={adminDepositFormStore}>
            {children}
        </GaugesAdminDepositFormContext.Provider>
    )
}
