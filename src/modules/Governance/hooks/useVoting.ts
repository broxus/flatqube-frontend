import * as React from 'react'

import { VotingStore } from '@/modules/Governance/stores'
import { UserDataStore } from '@/modules/Governance/stores/UserData'
import { useWallet } from '@/stores/WalletService'

export function useVoting(userData: UserDataStore): VotingStore {
    const ref = React.useRef<VotingStore>()
    ref.current = ref.current || new VotingStore(useWallet(), userData)
    return ref.current
}
