import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { useContext } from '@/hooks/useContext'
import { List } from '@/modules/Gauges/components/GaugesList/List'
import { GaugesFavoritesContext } from '@/modules/Gauges/providers/GaugesFavoritesProvider'
import { GaugesListContext } from '@/modules/Gauges/providers/GaugesListProvider'

function GaugesFavoritesListInner(): JSX.Element | null {
    const intl = useIntl()
    const gauges = useContext(GaugesListContext)
    const favorites = useContext(GaugesFavoritesContext)

    if (favorites.count > 0) {
        return (
            <List
                filters
                filtersPrefix="fav"
                limit={gauges.limit}
                list={gauges.list}
                nextPage={gauges.nextPage}
                prevPage={gauges.prevPage}
                offset={gauges.offset}
                onSubmitPage={gauges.setPage}
                total={gauges.total}
                isLoaded={gauges.isLoaded}
                isLoading={gauges.isLoading}
                placeholdersCount={Math.min(10, favorites.count)}
                title={intl.formatMessage({
                    id: 'GAUGE_FAVORITE_POOLS',
                })}
            />
        )
    }

    return null
}

export const GaugesFavoritesList = observer(GaugesFavoritesListInner)
