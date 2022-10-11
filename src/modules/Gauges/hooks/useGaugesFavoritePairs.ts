import * as React from 'react'

import { FavoritePairs } from '@/stores/FavoritePairs'
import { storage } from '@/utils'
import { WalletService } from '@/stores/WalletService'

export function useGaugesFavoritePairs(wallet: WalletService): FavoritePairs {
    const ref = React.useRef<FavoritePairs>()
    ref.current = ref.current || new FavoritePairs(storage, wallet, 'favorite_gauges')
    return ref.current
}
