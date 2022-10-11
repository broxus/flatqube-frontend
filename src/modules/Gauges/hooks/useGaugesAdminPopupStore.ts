import * as React from 'react'

import { GaugesAdminPopupStore } from '@/modules/Gauges/stores/GaugesAdminPopupStore'

export function useGaugesAdminPopupStore(): GaugesAdminPopupStore {
    const ref = React.useRef<GaugesAdminPopupStore>()
    ref.current = ref.current || new GaugesAdminPopupStore()
    return ref.current
}
