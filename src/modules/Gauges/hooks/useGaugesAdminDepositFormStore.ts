import * as React from 'react'

import { GaugesAdminDepositFormStore } from '@/modules/Gauges/stores/GaugesAdminDepositFormStore'
import { GaugesDataStore } from '@/modules/Gauges/stores/GaugesDataStore'
import { GaugesAdminDepositStore } from '@/modules/Gauges/stores/GaugesAdminDepositStore'
import { WalletService } from '@/stores/WalletService'

export function useGaugesAdminDepositFormStore(
    adminDeposit: GaugesAdminDepositStore,
    dataStore: GaugesDataStore,
    wallet: WalletService,
): GaugesAdminDepositFormStore {
    const ref = React.useRef<GaugesAdminDepositFormStore>()
    ref.current = ref.current || new GaugesAdminDepositFormStore(adminDeposit, dataStore, wallet)
    return ref.current
}
