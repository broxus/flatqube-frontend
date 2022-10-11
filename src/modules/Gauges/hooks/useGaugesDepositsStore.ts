import * as React from 'react'

import { GaugesDepositsStore } from '@/modules/Gauges/stores/GaugesDepositsStore'
import { GaugesAutoResyncStore } from '@/modules/Gauges/stores/GaugesAutoResyncStore'

export function useGaugesDepositsStore(autoResync: GaugesAutoResyncStore): GaugesDepositsStore {
    const ref = React.useRef<GaugesDepositsStore>()
    ref.current = ref.current || new GaugesDepositsStore(autoResync)
    return ref.current
}
