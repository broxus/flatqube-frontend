import * as React from 'react'

import { GaugesQubeSpeedStore } from '@/modules/Gauges/stores/GaugesQubeSpeedStore'
import { useGaugesQubeSpeedStore } from '@/modules/Gauges/hooks/useGaugesQubeSpeedStore'
import { useContext } from '@/hooks/useContext'
import { GaugesAutoResyncContext } from '@/modules/Gauges/providers/GaugesAutoResyncProvider'
import { GaugesTokensContext } from '@/modules/Gauges/providers/GaugesTokensProvider'

export const GaugesQubeSpeedContext = React.createContext<GaugesQubeSpeedStore | undefined>(undefined)
GaugesQubeSpeedContext.displayName = 'QubeSpeed'

type Props = {
    id: string;
    children: React.ReactNode;
}

export function GaugesQubeSpeedProvider({
    id,
    children,
}: Props): JSX.Element {
    const autoResync = useContext(GaugesAutoResyncContext)
    const tokens = useContext(GaugesTokensContext)
    const qubeSpeedStore = useGaugesQubeSpeedStore(autoResync, tokens)

    React.useEffect(() => {
        if (id) {
            qubeSpeedStore.init(id)

            return () => {
                qubeSpeedStore.dispose()
            }
        }
        return undefined
    }, [id])

    return (
        <GaugesQubeSpeedContext.Provider value={qubeSpeedStore}>
            {children}
        </GaugesQubeSpeedContext.Provider>
    )
}
