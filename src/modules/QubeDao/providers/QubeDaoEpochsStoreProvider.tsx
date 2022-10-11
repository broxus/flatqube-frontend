import * as React from 'react'

import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { QubeDaoEpochsStore } from '@/modules/QubeDao/stores/QubeDaoEpochsStore'

export type QubeDaoEpochsStoreProviderProps = React.PropsWithChildren

// @ts-ignore
export const QubeDaoEpochsStoreContext = React.createContext<QubeDaoEpochsStore>()

export function useQubeDaoEpochsStore(): QubeDaoEpochsStore {
    return React.useContext(QubeDaoEpochsStoreContext)
}

export function QubeDaoEpochsStoreProvider(props: QubeDaoEpochsStoreProviderProps): JSX.Element {
    const { children } = props

    const daoContext = useQubeDaoContext()

    const context = React.useMemo(() => new QubeDaoEpochsStore(daoContext), [])

    return (
        <QubeDaoEpochsStoreContext.Provider value={context}>
            {children}
        </QubeDaoEpochsStoreContext.Provider>
    )
}
