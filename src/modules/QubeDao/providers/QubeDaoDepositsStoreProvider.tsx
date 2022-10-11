import * as React from 'react'

import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { QubeDaoDepositsStore } from '@/modules/QubeDao/stores/QubeDaoDepositsStore'

export type QubeDaoDepositsStoreProviderProps = React.PropsWithChildren

// @ts-ignore
export const QubeDaoDepositsStoreContext = React.createContext<QubeDaoDepositsStore>()

export function useQubeDaoDepositsStore(): QubeDaoDepositsStore {
    return React.useContext(QubeDaoDepositsStoreContext)
}

export function QubeDaoDepositsStoreProvider(props: QubeDaoDepositsStoreProviderProps): JSX.Element {
    const { children } = props

    const daoContext = useQubeDaoContext()

    const context = React.useMemo(() => new QubeDaoDepositsStore(daoContext), [])

    return (
        <QubeDaoDepositsStoreContext.Provider value={context}>
            {children}
        </QubeDaoDepositsStoreContext.Provider>
    )
}
