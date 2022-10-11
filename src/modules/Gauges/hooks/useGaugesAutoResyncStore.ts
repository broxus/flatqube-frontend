import * as React from 'react'

import { GaugesAutoResyncStore } from '@/modules/Gauges/stores/GaugesAutoResyncStore'

export function useGaugesAutoResyncStore(): GaugesAutoResyncStore {
    const ref = React.useRef<GaugesAutoResyncStore>()
    ref.current = ref.current || new GaugesAutoResyncStore()
    return ref.current
}
