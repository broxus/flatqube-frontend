import * as React from 'react'

import { GaugesWithdrawFormStore } from '@/modules/Gauges/stores/GaugesWithdrawFormStore'
import { WalletService } from '@/stores/WalletService'
import { GaugesDataStore } from '@/modules/Gauges/stores/GaugesDataStore'
import { GaugesUserDataStore } from '@/modules/Gauges/stores/GaugesUserDataStore'

export function useGaugesWithdrawFormStore(
    wallet: WalletService,
    data: GaugesDataStore,
    userData: GaugesUserDataStore,
): GaugesWithdrawFormStore {
    const ref = React.useRef<GaugesWithdrawFormStore>()
    ref.current = ref.current || new GaugesWithdrawFormStore(wallet, data, userData)
    return ref.current
}
