import * as React from 'react'

import { GaugesDataStore } from '@/modules/Gauges/stores/GaugesDataStore'
import { GaugesTokensStore } from '@/modules/Gauges/stores/GaugesTokensStore'
import { GaugesAutoResyncStore } from '@/modules/Gauges/stores/GaugesAutoResyncStore'
import { GaugesPriceStore } from '@/modules/Gauges/stores/GaugesPriceStore'

export function useGaugesDataStore(
    tokensStore: GaugesTokensStore,
    autoResync: GaugesAutoResyncStore,
    price: GaugesPriceStore,
): GaugesDataStore {
    const ref = React.useRef<GaugesDataStore>()
    ref.current = ref.current || new GaugesDataStore(tokensStore, autoResync, price)
    return ref.current
}
