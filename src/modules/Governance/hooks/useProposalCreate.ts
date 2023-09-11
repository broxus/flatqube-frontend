import * as React from 'react'

import { DaoConfigStore, ProposalCreateStore, UserDataStore } from '@/modules/Governance/stores'
import { useWallet } from '@/stores/WalletService'
import { useTokensCache } from '@/stores/TokensCacheService'

export function useProposalCreate(userData: UserDataStore, daoConfig: DaoConfigStore): ProposalCreateStore {
    const ref = React.useRef<ProposalCreateStore>()
    ref.current = ref.current || new ProposalCreateStore(
        useWallet(),
        userData,
        daoConfig,
        useTokensCache(),
    )
    return ref.current
}
