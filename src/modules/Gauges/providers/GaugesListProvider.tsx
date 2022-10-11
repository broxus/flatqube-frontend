import * as React from 'react'
import { observer } from 'mobx-react-lite'

import { GaugesListStore } from '@/modules/Gauges/stores/GaugesListStore'
import { useGaugesListStore } from '@/modules/Gauges/hooks/useGaugesListStore'
import { useContext } from '@/hooks/useContext'
import { GaugesListDataContext } from '@/modules/Gauges/providers/GaugesListDataProvider'
import { GaugesFavoritesContext } from '@/modules/Gauges/providers/GaugesFavoritesProvider'

export const GaugesListContext = React.createContext<GaugesListStore | undefined>(undefined)
GaugesListContext.displayName = 'Gauges'

type Props = {
    isFavorites?: boolean;
    children?: React.ReactNode;
}

function GaugesListProviderInner({
    isFavorites,
    children,
}: Props): JSX.Element {
    const gaugesData = useContext(GaugesListDataContext)
    const favorites = useContext(GaugesFavoritesContext)
    const gaugesStore = useGaugesListStore(gaugesData, isFavorites ? favorites : undefined)

    React.useEffect(() => {
        gaugesStore.init()

        return () => {
            gaugesStore.dispose()
        }
    }, [])

    return (
        <GaugesListContext.Provider value={gaugesStore}>
            {children}
        </GaugesListContext.Provider>
    )
}

export const GaugesListProvider = observer(GaugesListProviderInner)
