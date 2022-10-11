import * as React from 'react'

import { GaugesTokensSpeedStore } from '@/modules/Gauges/stores/GaugesTokensSpeedStore'
import { GaugesAutoResyncStore } from '@/modules/Gauges/stores/GaugesAutoResyncStore'
import { GaugesTokensStore } from '@/modules/Gauges/stores/GaugesTokensStore'

export function useGaugesTokensSpeedStore(
    autoResync: GaugesAutoResyncStore,
    tokensStore: GaugesTokensStore,
): GaugesTokensSpeedStore {
    const ref = React.useRef<GaugesTokensSpeedStore>()
    ref.current = ref.current || new GaugesTokensSpeedStore(autoResync, tokensStore)
    return ref.current
}
