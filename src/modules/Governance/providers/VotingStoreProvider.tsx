import * as React from 'react'

import { useVoting } from '@/modules/Governance/hooks'
import { useUserData } from '@/modules/Governance/hooks/useUserData'
import { VotingStore } from '@/modules/Governance/stores'

export const VotingContext = React.createContext<VotingStore | undefined>(undefined)

export function useVotingContext(): VotingStore {
    const votingContext = React.useContext(VotingContext)

    if (!votingContext) {
        throw new Error('Voting context must be defined')
    }

    return votingContext
}

type Props = {
    children: React.ReactNode;
}

export function VotingStoreProvider({
    children,
}: Props): JSX.Element | null {
    const userData = useUserData()
    const voting = useVoting(userData)

    React.useEffect(() => {
        voting.init()

        return () => {
            voting.dispose()
        }
    }, [])

    return (
        <VotingContext.Provider value={voting}>
            {children}
        </VotingContext.Provider>
    )
}
