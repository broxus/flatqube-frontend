import * as React from 'react'

import { GaugesTokensSpeedStore } from '@/modules/Gauges/stores/GaugesTokensSpeedStore'
import { useGaugesTokensSpeedStore } from '@/modules/Gauges/hooks/useGaugesTokensSpeedStore'
import { useContext } from '@/hooks/useContext'
import { GaugesAutoResyncContext } from '@/modules/Gauges/providers/GaugesAutoResyncProvider'
import { GaugesTokensContext } from '@/modules/Gauges/providers/GaugesTokensProvider'

export const GaugesTokensSpeedContext = React.createContext<GaugesTokensSpeedStore | undefined>(undefined)
GaugesTokensSpeedContext.displayName = 'TokensSpeed'

type Props = {
    id: string;
    children: React.ReactNode;
}

export function GaugesTokensSpeedProvider({
    id,
    children,
}: Props): JSX.Element {
    const autoResync = useContext(GaugesAutoResyncContext)
    const tokens = useContext(GaugesTokensContext)
    const tokensSpeedStore = useGaugesTokensSpeedStore(autoResync, tokens)

    React.useEffect(() => {
        if (id) {
            tokensSpeedStore.init(id)

            return () => {
                tokensSpeedStore.dispose()
            }
        }
        return undefined
    }, [id])

    return (
        <GaugesTokensSpeedContext.Provider value={tokensSpeedStore}>
            {children}
        </GaugesTokensSpeedContext.Provider>
    )
}
