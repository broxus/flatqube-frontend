import * as React from 'react'
import { useIntl } from 'react-intl'

import { GaugesTitle } from '@/modules/Gauges/components/GaugesTitle'
import { StatisticsTvl } from '@/modules/Gauges/components/GaugesStatistics/Tvl'
import { StatisticsAprMax } from '@/modules/Gauges/components/GaugesStatistics/AprMax'
import { StatisticsAprMin } from '@/modules/Gauges/components/GaugesStatistics/AprMin'
import { StatisticsRewardBalance } from '@/modules/Gauges/components/GaugesStatistics/RewardBalance'
import { StatisticsFarmingSpeed } from '@/modules/Gauges/components/GaugesStatistics/FarmingSpeed'
import { StatisticsChart } from '@/modules/Gauges/components/GaugesStatistics/Chart'

import styles from './index.module.scss'

export function GaugesStatistics(): JSX.Element {
    const intl = useIntl()

    return (
        <div className={styles.statistics}>
            <GaugesTitle>
                {intl.formatMessage({
                    id: 'GAUGE_STATISTICS_TITLE',
                })}
            </GaugesTitle>

            <div className={styles.content}>
                <StatisticsTvl />
                <StatisticsAprMin />
                <StatisticsAprMax />
                <StatisticsRewardBalance />
                <StatisticsFarmingSpeed />
                <StatisticsChart />
            </div>
        </div>
    )
}
