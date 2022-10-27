import * as React from 'react'

import { useNotifiedWhitelistingCallbacks } from '@/modules/QubeDao/hooks/useNotifiedWhitelistingCallbacks'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { QubeDaoWhitelistingFormStore } from '@/modules/QubeDao/stores/QubeDaoWhitelistingFormStore'
import type { QubeDaoWhitelistingCallbacks } from '@/modules/QubeDao/stores/QubeDaoWhitelistingFormStore'

export type QubeDaoWhitelistingFormStoreProviderProps = React.PropsWithChildren<QubeDaoWhitelistingCallbacks>

// @ts-ignore
export const QubeDaoWhitelistingFormStoreContext = React.createContext<QubeDaoWhitelistingFormStore>()

export function useQubeDaoWhitelistingFormContext(): QubeDaoWhitelistingFormStore {
    return React.useContext(QubeDaoWhitelistingFormStoreContext)
}

export function QubeDaoWhitelistingFormStoreProvider(props: QubeDaoWhitelistingFormStoreProviderProps): JSX.Element {
    const { children, ...restProps } = props

    const daoContext = useQubeDaoContext()
    const callbacks = useNotifiedWhitelistingCallbacks(restProps)

    const context = React.useMemo(
        () => new QubeDaoWhitelistingFormStore(daoContext, { callbacks }),
        [callbacks],
    )

    return (
        <QubeDaoWhitelistingFormStoreContext.Provider value={context}>
            {children}
        </QubeDaoWhitelistingFormStoreContext.Provider>
    )
}
