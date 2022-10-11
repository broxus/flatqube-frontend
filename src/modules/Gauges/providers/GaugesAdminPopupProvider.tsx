import * as React from 'react'

import { GaugesAdminPopupStore } from '@/modules/Gauges/stores/GaugesAdminPopupStore'
import { useGaugesAdminPopupStore } from '@/modules/Gauges/hooks/useGaugesAdminPopupStore'

export const GaugesAdminPopupContext = React.createContext<GaugesAdminPopupStore | undefined>(undefined)
GaugesAdminPopupContext.displayName = 'AdminPopup'

type Props = {
    children: React.ReactNode;
}

export function GaugesAdminPopupProvider({
    children,
}: Props): JSX.Element | null {
    const adminPopupStore = useGaugesAdminPopupStore()

    return (
        <GaugesAdminPopupContext.Provider value={adminPopupStore}>
            {children}
        </GaugesAdminPopupContext.Provider>
    )
}
