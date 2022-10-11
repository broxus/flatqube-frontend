import * as React from 'react'

import { GaugesAdminWithdrawStore } from '@/modules/Gauges/stores/GaugesAdminWithdrawStore'
import { GaugesDataStore } from '@/modules/Gauges/stores/GaugesDataStore'
import { WalletService } from '@/stores/WalletService'

export function useGaugesAdminWithdrawStore(wallet: WalletService, dataStore: GaugesDataStore): GaugesAdminWithdrawStore {
    const ref = React.useRef<GaugesAdminWithdrawStore>()
    ref.current = ref.current || new GaugesAdminWithdrawStore(wallet, dataStore)
    return ref.current
}
