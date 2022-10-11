import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { GaugesListContext } from '@/modules/Gauges/providers/GaugesListProvider'
import { useContext } from '@/hooks/useContext'
import { List } from '@/modules/Gauges/components/GaugesList/List'

function GaugesListInner(): JSX.Element {
    const intl = useIntl()
    const gauges = useContext(GaugesListContext)

    return (
        <List
            limit={gauges.limit}
            list={gauges.list}
            nextPage={gauges.nextPage}
            prevPage={gauges.prevPage}
            offset={gauges.offset}
            onSubmitPage={gauges.setPage}
            total={gauges.total}
            filters
            isLoaded={gauges.isLoaded}
            isLoading={gauges.isLoading}
            title={intl.formatMessage({
                id: 'GAUGE_ALL_POOLS',
            })}
        />
    )
}

export const GaugesList = observer(GaugesListInner)
