import * as React from 'react'

import { GaugesCalcStore } from '@/modules/Gauges/stores/GaugesCalcStore'
import { GaugesTokensStore } from '@/modules/Gauges/stores/GaugesTokensStore'
import { FavoritePairs } from '@/stores/FavoritePairs'
import { WalletService } from '@/stores/WalletService'

export function useGaugesCalcStore(
    tokens: GaugesTokensStore,
    favorites: FavoritePairs,
    wallet: WalletService,
): GaugesCalcStore {
    const ref = React.useRef<GaugesCalcStore>()
    ref.current = ref.current || new GaugesCalcStore(tokens, favorites, wallet)
    return ref.current
}
