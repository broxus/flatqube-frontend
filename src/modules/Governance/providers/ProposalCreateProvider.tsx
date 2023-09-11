import * as React from 'react'

import { useProposalCreate } from '@/modules/Governance/hooks'
import { ProposalCreateStore } from '@/modules/Governance/stores'
import { useUserData } from '@/modules/Governance/hooks/useUserData'
import { useDaoConfig } from '@/modules/Governance/hooks/useDaoConfig'

export const ProposalCreateContext = React.createContext<ProposalCreateStore | undefined>(undefined)

export function useProposalCreateContext(): ProposalCreateStore {
    const proposalCreateContext = React.useContext(ProposalCreateContext)

    if (!proposalCreateContext) {
        throw new Error('Proposal create context must be defined')
    }

    return proposalCreateContext
}

type Props = {
    children: React.ReactNode;
}

export function ProposalCreateStoreProvider({
    children,
}: Props): JSX.Element {
    const userData = useUserData()
    const daoConfig = useDaoConfig()
    const proposalCreate = useProposalCreate(userData, daoConfig)

    React.useEffect(() => {
        proposalCreate.init()

        return () => {
            proposalCreate.dispose()
        }
    }, [])

    return (
        <ProposalCreateContext.Provider value={proposalCreate}>
            {children}
        </ProposalCreateContext.Provider>
    )
}
