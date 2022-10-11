import * as React from 'react'
import { useIntl } from 'react-intl'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import BigNumber from 'bignumber.js'

import { GaugesPanel } from '@/modules/Gauges/components/GaugesPanel'
import { useContext } from '@/hooks/useContext'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'
import { Placeholder } from '@/components/common/Placeholder'
import { formattedAmount } from '@/utils'
import { SECONDS_IN_DAY } from '@/constants'

import styles from './index.module.scss'

function StatisticsAprMaxInner(): JSX.Element {
    const intl = useIntl()
    const data = useContext(GaugesDataStoreContext)

    if (data.maxApr) {
        return (
            <GaugesPanel className={styles.aprMax}>
                <div className={styles.title}>
                    {intl.formatMessage({
                        id: 'GAUGE_APR_MAX',
                    })}
                </div>

                <div className={classNames(styles.amount, styles.small)}>
                    <div className={styles.value}>
                        {formattedAmount(data.maxApr)}
                        %
                    </div>
                    {data.maxLockTime && (
                        <span className={styles.lock}>
                            {intl.formatMessage({
                                id: 'GAUGE_LOCK_PERIOD',
                            }, {
                                days: new BigNumber(data.maxLockTime)
                                    .dividedBy(SECONDS_IN_DAY)
                                    .toFixed(),
                            })}
                        </span>
                    )}
                </div>
            </GaugesPanel>
        )
    }

    return (
        <GaugesPanel className={styles.aprMax}>
            <h3 className={styles.title}>
                <Placeholder width={220} />
            </h3>
            <Placeholder width={100} height={20} />
        </GaugesPanel>
    )
}

export const StatisticsAprMax = observer(StatisticsAprMaxInner)
