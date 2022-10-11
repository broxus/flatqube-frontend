import * as React from 'react'

import { GaugesClaimRewardStore } from '@/modules/Gauges/stores/GaugesClaimRewardStore'
import { WalletService } from '@/stores/WalletService'
import { GaugesDataStore } from '@/modules/Gauges/stores/GaugesDataStore'
import { GaugesUserDataStore } from '@/modules/Gauges/stores/GaugesUserDataStore'

export function useGaugesClaimRewardStore(
    wallet: WalletService,
    data: GaugesDataStore,
    userData: GaugesUserDataStore,
): GaugesClaimRewardStore {
    const ref = React.useRef<GaugesClaimRewardStore>()
    ref.current = ref.current || new GaugesClaimRewardStore(wallet, data, userData)
    return ref.current
}
