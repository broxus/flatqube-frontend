import * as React from 'react'
import { useIntl } from 'react-intl'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'

import { GaugesPanel } from '@/modules/Gauges/components/GaugesPanel'
import { useContext } from '@/hooks/useContext'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'
import { Placeholder } from '@/components/common/Placeholder'
import { formattedAmount } from '@/utils'

import styles from './index.module.scss'

function StatisticsAprMinInner(): JSX.Element {
    const intl = useIntl()
    const data = useContext(GaugesDataStoreContext)

    if (data.minApr) {
        return (
            <GaugesPanel className={styles.aprMin}>
                <div className={styles.title}>
                    {intl.formatMessage({
                        id: 'GAUGE_APR_MIN',
                    })}
                </div>

                <div className={classNames(styles.amount, styles.small)}>
                    <div className={styles.value}>
                        {formattedAmount(data.minApr)}
                        %
                    </div>
                </div>
            </GaugesPanel>
        )
    }

    return (
        <GaugesPanel className={styles.aprMin}>
            <h3 className={styles.title}>
                <Placeholder width={220} />
            </h3>
            <Placeholder width={100} height={20} />
        </GaugesPanel>
    )
}

export const StatisticsAprMin = observer(StatisticsAprMinInner)
