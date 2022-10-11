import * as React from 'react'
import { observer } from 'mobx-react-lite'

import { GaugesDepositFormStore } from '@/modules/Gauges/stores/GaugesDepositFormStore'
import { useGaugesDepositFormStore } from '@/modules/Gauges/hooks/useGaugesDepositFormStore'
import { useWallet } from '@/stores/WalletService'
import { useContext } from '@/hooks/useContext'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'
import { GaugesUserDataContext } from '@/modules/Gauges/providers/GaugesUserDataProvider'

export const GaugesDepositFormContext = React.createContext<GaugesDepositFormStore | undefined>(undefined)
GaugesDepositFormContext.displayName = 'DepositForm'

type Props = {
    children: React.ReactNode;
}

function GaugesDepositFormProviderInner({
    children,
}: Props): JSX.Element | null {
    const wallet = useWallet()
    const data = useContext(GaugesDataStoreContext)
    const userData = useContext(GaugesUserDataContext)
    const depositFormStore = useGaugesDepositFormStore(wallet, data, userData)

    React.useEffect(() => {
        depositFormStore.init()

        return () => {
            depositFormStore.dispose()
        }
    }, [])

    return (
        <GaugesDepositFormContext.Provider value={depositFormStore}>
            {children}
        </GaugesDepositFormContext.Provider>
    )
}

export const GaugesDepositFormProvider = observer(GaugesDepositFormProviderInner)
