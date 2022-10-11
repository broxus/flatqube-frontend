import * as React from 'react'

import { GaugesTokensStore } from '@/modules/Gauges/stores/GaugesTokensStore'
import { TokensListService } from '@/stores/TokensListService'

export function useGaugesTokensStore(tokenList: TokensListService): GaugesTokensStore {
    const ref = React.useRef<GaugesTokensStore>()
    ref.current = ref.current || new GaugesTokensStore(tokenList)
    return ref.current
}
