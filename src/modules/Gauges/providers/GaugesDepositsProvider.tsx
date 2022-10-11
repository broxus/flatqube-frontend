import * as React from 'react'

import { GaugesDepositsStore } from '@/modules/Gauges/stores/GaugesDepositsStore'
import { useGaugesDepositsStore } from '@/modules/Gauges/hooks/useGaugesDepositsStore'
import { useContext } from '@/hooks/useContext'
import { GaugesAutoResyncContext } from '@/modules/Gauges/providers/GaugesAutoResyncProvider'

export const GaugesDepositsContext = React.createContext<GaugesDepositsStore | undefined>(undefined)
GaugesDepositsContext.displayName = 'Deposits'

type Props = {
    id?: string;
    user?: string;
    children: React.ReactNode;
}

export function GaugesDepositsProvider({
    id,
    user,
    children,
}: Props): JSX.Element {
    const autoResync = useContext(GaugesAutoResyncContext)
    const depositsStore = useGaugesDepositsStore(autoResync)

    React.useEffect(() => {
        if (id) {
            depositsStore.init(id, user)
        }
    }, [id, user])

    React.useEffect(() => () => (
        depositsStore.dispose()
    ), [])

    return (
        <GaugesDepositsContext.Provider value={depositsStore}>
            {children}
        </GaugesDepositsContext.Provider>
    )
}
