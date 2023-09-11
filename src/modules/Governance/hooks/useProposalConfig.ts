import * as React from 'react'

import { ProposalConfigStore } from '@/modules/Governance/stores/ProposalConfig'
import { useWallet } from '@/stores/WalletService'

export function useProposalConfig(): ProposalConfigStore {
    const ref = React.useRef<ProposalConfigStore>()
    ref.current = ref.current || new ProposalConfigStore(useWallet())
    return ref.current
}
