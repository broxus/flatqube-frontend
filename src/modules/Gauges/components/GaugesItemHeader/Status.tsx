import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { GaugesStatus, StatusType } from '@/modules/Gauges/components/GaugesStatus'
import { useContext } from '@/hooks/useContext'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'

function ItemHeaderStatusInner(): JSX.Element | null {
    const intl = useIntl()
    const { startDate, endDate } = useContext(GaugesDataStoreContext)

    const now = Date.now()

    let id = 'GAUGE_STATUS_AWAITING',
        type: StatusType = 'yellow'

    if (startDate && endDate) {
        if (now < startDate) {
            type = 'yellow'
            id = 'GAUGE_STATUS_AWAITING'
        }
        else if (now > startDate && now < endDate) {
            type = 'green'
            id = 'GAUGE_STATUS_ACTIVE'
        }
        else if (now > endDate) {
            type = 'red'
            id = 'GAUGE_STATUS_EXPIRED'
        }
    }
    else if (startDate) {
        if (now < startDate) {
            type = 'yellow'
            id = 'GAUGE_STATUS_AWAITING'
        }
        else if (now >= startDate) {
            type = 'green'
            id = 'GAUGE_STATUS_ACTIVE'
        }
    }

    return (
        <GaugesStatus
            type={type}
        >
            {intl.formatMessage({
                id,
            })}
        </GaugesStatus>
    )
}

export const ItemHeaderStatus = observer(ItemHeaderStatusInner)
