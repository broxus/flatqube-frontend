import * as React from 'react'

import { GaugesAdminSpeedFormStore } from '@/modules/Gauges/stores/GaugesAdminSpeedFormStore'
import { GaugesDataStore } from '@/modules/Gauges/stores/GaugesDataStore'
import { WalletService } from '@/stores/WalletService'

export function useGaugesAdminSpeedFormStore(data: GaugesDataStore, wallet: WalletService): GaugesAdminSpeedFormStore {
    const ref = React.useRef<GaugesAdminSpeedFormStore>()
    ref.current = ref.current || new GaugesAdminSpeedFormStore(data, wallet)
    return ref.current
}
