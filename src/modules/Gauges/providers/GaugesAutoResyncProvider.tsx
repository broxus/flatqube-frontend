import * as React from 'react'

import { GaugesAutoResyncStore } from '@/modules/Gauges/stores/GaugesAutoResyncStore'
import { useGaugesAutoResyncStore } from '@/modules/Gauges/hooks/useGaugesAutoResyncStore'

export const GaugesAutoResyncContext = React.createContext<GaugesAutoResyncStore | undefined>(undefined)
GaugesAutoResyncContext.displayName = 'AutoResync'

type Props = {
    children: React.ReactNode;
}

export function GaugesAutoResyncProvider({
    children,
}: Props): JSX.Element {
    const autoResyncStore = useGaugesAutoResyncStore()

    React.useEffect(() => {
        autoResyncStore.start()

        return () => {
            autoResyncStore.stop()
        }
    }, [])

    return (
        <GaugesAutoResyncContext.Provider value={autoResyncStore}>
            {children}
        </GaugesAutoResyncContext.Provider>
    )
}
