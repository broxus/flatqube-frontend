import * as React from 'react'

import { useNotifiedDepositCallbacks } from '@/modules/QubeDao/hooks/useNotifiedDepositCallbacks'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { QubeDaoDepositFormStore } from '@/modules/QubeDao/stores/QubeDaoDepositFormStore'
import type { QubeDaoDepositCallbacks } from '@/modules/QubeDao/stores/QubeDaoStore'

export type QubeDaoDepositFormStoreProviderProps = React.PropsWithChildren<QubeDaoDepositCallbacks>

// @ts-ignore
export const QubeDaoDepositFormStoreContext = React.createContext<QubeDaoDepositFormStore>()

export function useQubeDaoDepositFormStore(): QubeDaoDepositFormStore {
    return React.useContext(QubeDaoDepositFormStoreContext)
}

export function QubeDaoDepositFormStoreProvider(props: QubeDaoDepositFormStoreProviderProps): JSX.Element {
    const { children, ...restProps } = props

    const daoContext = useQubeDaoContext()
    const callbacks = useNotifiedDepositCallbacks(restProps)

    const context = React.useMemo(
        () => new QubeDaoDepositFormStore(daoContext, { callbacks }),
        [callbacks],
    )

    return (
        <QubeDaoDepositFormStoreContext.Provider value={context}>
            {children}
        </QubeDaoDepositFormStoreContext.Provider>
    )
}
