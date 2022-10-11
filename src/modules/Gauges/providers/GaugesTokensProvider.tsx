import * as React from 'react'

import { GaugesTokensStore } from '@/modules/Gauges/stores/GaugesTokensStore'
import { useGaugesTokensStore } from '@/modules/Gauges/hooks/useGaugesTokensStore'
import { useTokensList } from '@/stores/TokensListService'

export const GaugesTokensContext = React.createContext<GaugesTokensStore | undefined>(undefined)
GaugesTokensContext.displayName = 'Tokens'

type Props = {
    children: React.ReactNode;
}

export function GaugesTokensProvider({
    children,
}: Props): JSX.Element | null {
    const tokenList = useTokensList()
    const tokensStore = useGaugesTokensStore(tokenList)

    return (
        <GaugesTokensContext.Provider value={tokensStore}>
            {children}
        </GaugesTokensContext.Provider>
    )
}
