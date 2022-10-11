import { observer } from 'mobx-react-lite'
import * as React from 'react'
import { useIntl } from 'react-intl'

import { useContext } from '@/hooks/useContext'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'

import styles from './index.module.scss'

function GaugesMessageEndedInner(): JSX.Element | null {
    const intl = useIntl()
    const data = useContext(GaugesDataStoreContext)

    if (
        data.endDate
        && Date.now() > data.endDate
    ) {
        return (
            <div className={`${styles.message} ${styles.danger}`}>
                <h3>
                    {intl.formatMessage({
                        id: 'GAUGE_MESSAGE_FARM_ENDED_TITLE',
                    })}
                </h3>
            </div>
        )
    }

    return null
}

export const GaugesMessageEnded = observer(GaugesMessageEndedInner)
