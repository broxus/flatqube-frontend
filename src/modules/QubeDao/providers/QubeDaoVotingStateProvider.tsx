import * as React from 'react'

import { useQubeDaoEpochStore } from '@/modules/QubeDao/providers/QubeDaoEpochStoreProvider'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { QubeDaoVotingStateStore } from '@/modules/QubeDao/stores/QubeDaoVotingStateStore'
import { useNotifiedEndVotingCallbacks } from '@/modules/QubeDao/hooks/useNotifiedEndVotingCallbacks'
import { useNotifiedVoteEpochCallbacks } from '@/modules/QubeDao/hooks/useNotifiedVoteEpochCallbacks'

export type QubeDaoVotingStateStoreProviderProps = React.PropsWithChildren

// @ts-ignore
export const QubeDaoVotingStateStoreContext = React.createContext<QubeDaoVotingStateStore>()

export function useQubeDaoVotingStateStore(): QubeDaoVotingStateStore {
    return React.useContext(QubeDaoVotingStateStoreContext)
}

export function QubeDaoVotingStateStoreProvider(props: QubeDaoVotingStateStoreProviderProps): JSX.Element {
    const { children } = props

    const daoContext = useQubeDaoContext()
    const epochStore = useQubeDaoEpochStore()
    const endVotingCallbacks = useNotifiedEndVotingCallbacks({})
    const voteEpochCallbacks = useNotifiedVoteEpochCallbacks({})

    const context = React.useMemo(() => new QubeDaoVotingStateStore(daoContext, epochStore, {
        endVotingCallbacks,
        voteEpochCallbacks,
    }), [epochStore])

    return (
        <QubeDaoVotingStateStoreContext.Provider value={context}>
            {children}
        </QubeDaoVotingStateStoreContext.Provider>
    )
}
