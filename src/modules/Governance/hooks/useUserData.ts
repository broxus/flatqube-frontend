import * as React from 'react'

import { UserDataStore } from '@/modules/Governance/stores'
import { useWallet } from '@/stores/WalletService'

export function useUserData(): UserDataStore {
    const ref = React.useRef<UserDataStore>()
    ref.current = ref.current || new UserDataStore(useWallet())
    return ref.current
}
