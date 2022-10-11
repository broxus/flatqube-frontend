import * as React from 'react'

import { GaugesTransactionsStore } from '@/modules/Gauges/stores/GaugesTransactionsStore'
import { GaugesAutoResyncStore } from '@/modules/Gauges/stores/GaugesAutoResyncStore'
import { GaugesTokensStore } from '@/modules/Gauges/stores/GaugesTokensStore'
import { GaugesPriceStore } from '@/modules/Gauges/stores/GaugesPriceStore'

export function useGaugesTransactionsStore(
    autoResync: GaugesAutoResyncStore,
    tokens: GaugesTokensStore,
    price: GaugesPriceStore,
): GaugesTransactionsStore {
    const ref = React.useRef<GaugesTransactionsStore>()
    ref.current = ref.current || new GaugesTransactionsStore(autoResync, tokens, price)
    return ref.current
}
