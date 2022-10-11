import * as React from 'react'

import { GaugesUserPerformanceStore } from '@/modules/Gauges/stores/GaugesUserPerformanceStore'

export function useGaugesUserPerformanceStore(): GaugesUserPerformanceStore {
    const ref = React.useRef<GaugesUserPerformanceStore>()
    ref.current = ref.current || new GaugesUserPerformanceStore()
    return ref.current
}
