import * as React from 'react'
import classNames from 'classnames'
import { useIntl } from 'react-intl'

import { Tooltip } from '@/components/common/Tooltip'
import type { GaugeItem } from '@/modules/Pools/types'

import styles from './index.module.scss'

type Props = {
    gauge: GaugeItem;
}

export function GaugeStatus({ gauge }: Props): JSX.Element {
    const intl = useIntl()

    const ref = React.useRef<HTMLDivElement | null>(null)

    const now = Date.now() / 1000

    let type: 'active' | 'ended' | 'waiting' = 'waiting',
        id = 'GAUGE_STATUS_AWAITING'

    if (gauge.startTime && gauge.endTime) {
        if (now < gauge.startTime) {
            type = 'waiting'
            id = 'GAUGE_STATUS_AWAITING'
        }
        else if (now > gauge.startTime && now < gauge.endTime) {
            type = 'active'
            id = 'GAUGE_STATUS_ACTIVE'
        }
        else if (now > gauge.endTime) {
            type = 'ended'
            id = 'GAUGE_STATUS_EXPIRED'
        }
    }
    else if (gauge.startTime) {
        if (now < gauge.startTime) {
            type = 'waiting'
            id = 'GAUGE_STATUS_AWAITING'
        }
        else if (now >= gauge.startTime) {
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
                    styles[type],
                )}
            />
            <Tooltip target={ref}>
                {intl.formatMessage({
                    id,
                })}
            </Tooltip>
        </>
    )
}
