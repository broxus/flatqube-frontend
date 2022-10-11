import * as React from 'react'

import { GaugesAdminDepositStore } from '@/modules/Gauges/stores/GaugesAdminDepositStore'
import { WalletService } from '@/stores/WalletService'
import { GaugesDataStore } from '@/modules/Gauges/stores/GaugesDataStore'

export function useGaugesAdminDepositStore(wallet: WalletService, dataStore: GaugesDataStore): GaugesAdminDepositStore {
    const ref = React.useRef<GaugesAdminDepositStore>()
    ref.current = ref.current || new GaugesAdminDepositStore(wallet, dataStore)
    return ref.current
}
