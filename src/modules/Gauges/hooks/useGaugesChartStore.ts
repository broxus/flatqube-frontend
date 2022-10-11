import * as React from 'react'

import { GaugesChartStore } from '@/modules/Gauges/stores/GaugesChartStore'

export function useGaugesChartStore(): GaugesChartStore {
    const ref = React.useRef<GaugesChartStore>()
    ref.current = ref.current || new GaugesChartStore()
    return ref.current
}
