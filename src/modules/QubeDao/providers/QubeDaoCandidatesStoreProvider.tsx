import * as React from 'react'

import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { QubeDaoCandidatesStore } from '@/modules/QubeDao/stores/QubeDaoCandidatesStore'

export type QubeDaoCandidatesStoreProviderProps = React.PropsWithChildren

// @ts-ignore
export const QubeDaoCandidatesStoreContext = React.createContext<QubeDaoCandidatesStore>()

export function useQubeDaoCandidatesStore(): QubeDaoCandidatesStore {
    return React.useContext(QubeDaoCandidatesStoreContext)
}

export function QubeDaoCandidatesStoreProvider(props: QubeDaoCandidatesStoreProviderProps): JSX.Element {
    const { children } = props

    const daoContext = useQubeDaoContext()

    const context = React.useMemo(() => new QubeDaoCandidatesStore(daoContext), [])

    return (
        <QubeDaoCandidatesStoreContext.Provider value={context}>
            {children}
        </QubeDaoCandidatesStoreContext.Provider>
    )
}
