import * as React from 'react'

import { GaugesCreateFormStore } from '@/modules/Gauges/stores/GaugesCreateFormStore'
import { GaugesTokensStore } from '@/modules/Gauges/stores/GaugesTokensStore'
import { WalletService } from '@/stores/WalletService'
import { FavoritePairs } from '@/stores/FavoritePairs'

export function useGaugesCreateFormStore(
    tokensStore: GaugesTokensStore,
    wallet: WalletService,
    favorites: FavoritePairs,
): GaugesCreateFormStore {
    const ref = React.useRef<GaugesCreateFormStore>()
    ref.current = ref.current || new GaugesCreateFormStore(tokensStore, wallet, favorites)
    return ref.current
}
