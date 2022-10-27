import * as React from 'react'
import { reaction } from 'mobx'

import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { QubeDaoTransactionsStore } from '@/modules/QubeDao/stores/QubeDaoTransactionsStore'

export type QubeDaoTransactionsStoreProviderProps = React.PropsWithChildren

// @ts-ignore
export const QubeDaoTransactionsStoreContext = React.createContext<QubeDaoTransactionsStore>()

export function useQubeDaoTransactionsContext(): QubeDaoTransactionsStore {
    return React.useContext(QubeDaoTransactionsStoreContext)
}

export function QubeDaoTransactionsStoreProvider(props: QubeDaoTransactionsStoreProviderProps): JSX.Element {
    const { children } = props

    const daoContext = useQubeDaoContext()

    const context = React.useMemo(() => new QubeDaoTransactionsStore(daoContext), [])

    React.useEffect(() => reaction(
        () => daoContext.tokensCache.isReady,
        async isTokensCacheReady => {
            if (isTokensCacheReady) {
                await context.fetch(true)
            }
        },
        { delay: 50, fireImmediately: true },
    ), [])

    return (
        <QubeDaoTransactionsStoreContext.Provider value={context}>
            {children}
        </QubeDaoTransactionsStoreContext.Provider>
    )
}
