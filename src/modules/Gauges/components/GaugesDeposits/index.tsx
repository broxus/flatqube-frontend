import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { GaugesTitle } from '@/modules/Gauges/components/GaugesTitle'
import { DepositsTable } from '@/modules/Gauges/components/GaugesDeposits/Table'
import { useContext } from '@/hooks/useContext'
import { GaugesDepositsContext } from '@/modules/Gauges/providers/GaugesDepositsProvider'

import styles from './index.module.scss'

function GaugesDepositsInner(): JSX.Element | null {
    const intl = useIntl()
    const deposits = useContext(GaugesDepositsContext)

    if (deposits.total > 0) {
        return (
            <div className={styles.deposits}>
                <GaugesTitle>
                    {intl.formatMessage({
                        id: 'GAUGE_DEPOSITS_TITLE',
                    })}
                </GaugesTitle>

                <DepositsTable />
            </div>
        )
    }

    return null
}

export const GaugesDeposits = observer(GaugesDepositsInner)
