import * as React from 'react'

import { GaugesListDataStore } from '@/modules/Gauges/stores/GaugesListDataStore'
import { WalletService } from '@/stores/WalletService'
import { GaugesTokensStore } from '@/modules/Gauges/stores/GaugesTokensStore'

export function useGaugesListDataStore(wallet: WalletService, tokens: GaugesTokensStore): GaugesListDataStore {
    const ref = React.useRef<GaugesListDataStore>()
    ref.current = ref.current || new GaugesListDataStore(wallet, tokens)
    return ref.current
}
