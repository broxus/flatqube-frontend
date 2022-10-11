import * as React from 'react'
import { useIntl } from 'react-intl'

import { GaugesTitle } from '@/modules/Gauges/components/GaugesTitle'
import { VestingTable } from '@/modules/Gauges/components/GaugesVesting/Table'

import styles from './index.module.scss'

export function GaugesVesting(): JSX.Element {
    const intl = useIntl()

    return (
        <div className={styles.vesting}>
            <GaugesTitle>
                {intl.formatMessage({
                    id: 'GAUGE_VESTING_TITLE',
                })}
            </GaugesTitle>

            <VestingTable />
        </div>
    )
}
