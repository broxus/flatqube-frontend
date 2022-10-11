import * as React from 'react'

import { GaugesAdminEndDateFormStore } from '@/modules/Gauges/stores/GaugesAdminEndDateFormStore'
import { GaugesDataStore } from '@/modules/Gauges/stores/GaugesDataStore'
import { WalletService } from '@/stores/WalletService'

export function useGaugesAdminEndDateFormStore(data: GaugesDataStore, wallet: WalletService): GaugesAdminEndDateFormStore {
    const ref = React.useRef<GaugesAdminEndDateFormStore>()
    ref.current = ref.current || new GaugesAdminEndDateFormStore(data, wallet)
    return ref.current
}
