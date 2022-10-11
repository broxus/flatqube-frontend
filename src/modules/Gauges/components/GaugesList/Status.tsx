import classNames from 'classnames'
import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { useContext } from '@/hooks/useContext'
import { GaugesListDataContext } from '@/modules/Gauges/providers/GaugesListDataProvider'
import { Tooltip } from '@/components/common/Tooltip'

import styles from './index.module.scss'

type Props = {
    gaugeId: string;
}

function StatusInner({
    gaugeId,
}: Props): JSX.Element {
    const intl = useIntl()
    const data = useContext(GaugesListDataContext)
    const ref = React.useRef<HTMLDivElement | null>(null)

    const now = Date.now()
    const loaded = data.loaded[gaugeId]
    const endDate = data.endDate[gaugeId]
    const startDate = data.startDate[gaugeId]

    let type: 'active' | 'ended' | 'waiting' = 'waiting',
        id = 'GAUGE_STATUS_AWAITING'

    if (startDate && endDate) {
        if (now < startDate) {
            type = 'waiting'
            id = 'GAUGE_STATUS_AWAITING'
        }
        else if (now > startDate && now < endDate) {
            type = 'active'
            id = 'GAUGE_STATUS_ACTIVE'
        }
        else if (now > endDate) {
            type = 'ended'
            id = 'GAUGE_STATUS_EXPIRED'
        }
    }
    else if (startDate) {
        if (now < startDate) {
            type = 'waiting'
            id = 'GAUGE_STATUS_AWAITING'
        }
        else if (now >= startDate) {
            type = 'active'
            id = 'GAUGE_STATUS_ACTIVE'
        }
    }

    return (
        <>
            <div
                ref={ref}
                className={classNames(
                    styles.status,
                    loaded ? [styles[type]] : undefined,
                )}
            />
            {loaded && (
                <Tooltip target={ref}>
                    {intl.formatMessage({
                        id,
                    })}
                </Tooltip>
            )}
        </>
    )
}

export const Status = observer(StatusInner)
