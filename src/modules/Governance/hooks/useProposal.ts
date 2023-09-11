import * as React from 'react'

import { ProposalStore } from '@/modules/Governance/stores/Proposal'
import { UserDataStore } from '@/modules/Governance/stores/UserData'
import { useWallet } from '@/stores/WalletService'

export function useProposal(userData: UserDataStore): ProposalStore {
    const ref = React.useRef<ProposalStore>()
    ref.current = ref.current || new ProposalStore(useWallet(), userData)

    return ref.current
}
