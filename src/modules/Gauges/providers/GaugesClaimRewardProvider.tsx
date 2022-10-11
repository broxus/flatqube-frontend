import * as React from 'react'

import { GaugesClaimRewardStore } from '@/modules/Gauges/stores/GaugesClaimRewardStore'
import { useGaugesClaimRewardStore } from '@/modules/Gauges/hooks/useGaugesClaimRewardStore'
import { useWallet } from '@/stores/WalletService'
import { useContext } from '@/hooks/useContext'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'
import { GaugesUserDataContext } from '@/modules/Gauges/providers/GaugesUserDataProvider'

export const GaugesClaimRewardContext = React.createContext<GaugesClaimRewardStore | undefined>(undefined)
GaugesClaimRewardContext.displayName = 'ClaimReward'

type Props = {
    children: React.ReactNode;
}

export function GaugesClaimRewardProvider({
    children,
}: Props): JSX.Element {
    const wallet = useWallet()
    const data = useContext(GaugesDataStoreContext)
    const userData = useContext(GaugesUserDataContext)
    const claimRewardStore = useGaugesClaimRewardStore(wallet, data, userData)

    return (
        <GaugesClaimRewardContext.Provider value={claimRewardStore}>
            {children}
        </GaugesClaimRewardContext.Provider>
    )
}
