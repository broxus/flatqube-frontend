import * as React from 'react'

import { GaugesDepositFormStore } from '@/modules/Gauges/stores/GaugesDepositFormStore'
import { WalletService } from '@/stores/WalletService'
import { GaugesDataStore } from '@/modules/Gauges/stores/GaugesDataStore'
import { GaugesUserDataStore } from '@/modules/Gauges/stores/GaugesUserDataStore'

export function useGaugesDepositFormStore(
    wallet: WalletService,
    data: GaugesDataStore,
    userData: GaugesUserDataStore,
): GaugesDepositFormStore {
    const ref = React.useRef<GaugesDepositFormStore>()
    ref.current = ref.current || new GaugesDepositFormStore(wallet, data, userData)
    return ref.current
}
