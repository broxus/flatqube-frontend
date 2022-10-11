import * as React from 'react'

import { GaugesPanel } from '@/modules/Gauges/components/GaugesPanel'
import { GaugesChart } from '@/modules/Gauges/components/GaugesChart'

import styles from './index.module.scss'

export function StatisticsChart(): JSX.Element {
    return (
        <GaugesPanel className={styles.chart}>
            <GaugesChart />
        </GaugesPanel>
    )
}
