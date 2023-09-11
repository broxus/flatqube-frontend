import * as React from 'react'

import { DaoConfigStore } from '@/modules/Governance/stores'

export function useDaoConfig(): DaoConfigStore {
    const ref = React.useRef<DaoConfigStore>()
    ref.current = ref.current || new DaoConfigStore()
    return ref.current
}
