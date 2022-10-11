import * as React from 'react'

import { GaugesListStore } from '@/modules/Gauges/stores/GaugesListStore'
import { GaugesListDataStore } from '@/modules/Gauges/stores/GaugesListDataStore'
import { FavoritePairs } from '@/stores/FavoritePairs'

export function useGaugesListStore(gaugesData: GaugesListDataStore, favorites?: FavoritePairs): GaugesListStore {
    const ref = React.useRef<GaugesListStore>()
    ref.current = ref.current || new GaugesListStore(gaugesData, favorites)
    return ref.current
}
