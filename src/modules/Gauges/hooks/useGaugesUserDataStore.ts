import * as React from 'react'

import { GaugesUserDataStore } from '@/modules/Gauges/stores/GaugesUserDataStore'
import { WalletService } from '@/stores/WalletService'
import { GaugesDataStore } from '@/modules/Gauges/stores/GaugesDataStore'
import { GaugesAutoResyncStore } from '@/modules/Gauges/stores/GaugesAutoResyncStore'
import { GaugesPriceStore } from '@/modules/Gauges/stores/GaugesPriceStore'

export function useGaugesUserDataStore(
    wallet: WalletService,
    dataStore: GaugesDataStore,
    autoResync: GaugesAutoResyncStore,
    price: GaugesPriceStore,
): GaugesUserDataStore {
    const ref = React.useRef<GaugesUserDataStore>()
    ref.current = ref.current || new GaugesUserDataStore(
        wallet,
        dataStore,
        autoResync,
        price,
    )
    return ref.current
}
