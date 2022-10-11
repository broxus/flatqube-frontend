import * as React from 'react'

import { GaugesPriceStore } from '@/modules/Gauges/stores/GaugesPriceStore'

export function useGaugesPriceStore(): GaugesPriceStore {
    const ref = React.useRef<GaugesPriceStore>()
    ref.current = ref.current || new GaugesPriceStore()
    return ref.current
}
