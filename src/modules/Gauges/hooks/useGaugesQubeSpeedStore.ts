import * as React from 'react'

import { GaugesQubeSpeedStore } from '@/modules/Gauges/stores/GaugesQubeSpeedStore'
import { GaugesAutoResyncStore } from '@/modules/Gauges/stores/GaugesAutoResyncStore'
import { GaugesTokensStore } from '@/modules/Gauges/stores/GaugesTokensStore'

export function useGaugesQubeSpeedStore(
    autoResync: GaugesAutoResyncStore,
    tokens: GaugesTokensStore,
): GaugesQubeSpeedStore {
    const ref = React.useRef<GaugesQubeSpeedStore>()
    ref.current = ref.current || new GaugesQubeSpeedStore(autoResync, tokens)
    return ref.current
}
