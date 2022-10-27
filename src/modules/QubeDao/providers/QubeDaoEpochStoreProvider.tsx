import * as React from 'react'

import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { QubeDaoEpochStore } from '@/modules/QubeDao/stores/QubeDaoEpochStore'

// @ts-ignore
export const QubeDaoEpochStoreContext = React.createContext<QubeDaoEpochStore>()

export function useQubeDaoEpochContext(): QubeDaoEpochStore {
    return React.useContext(QubeDaoEpochStoreContext)
}

export function QubeDaoEpochStoreProvider(
    { children, epochNum }: React.PropsWithChildren<{ epochNum?: string }>,
): JSX.Element {
    const daoContext = useQubeDaoContext()

    const context = React.useMemo(() => new QubeDaoEpochStore(daoContext, {
        epochNum: epochNum ? parseInt(epochNum, 10) : undefined,
    }), [epochNum])

    return (
        <QubeDaoEpochStoreContext.Provider value={context}>
            {children}
        </QubeDaoEpochStoreContext.Provider>
    )
}
