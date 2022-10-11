import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { GaugesTitle } from '@/modules/Gauges/components/GaugesTitle'
import { QubeSpeedTable } from '@/modules/Gauges/components/GaugesQubeSpeed/Table'
import { useContext } from '@/hooks/useContext'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'
import { TokenIcon } from '@/components/common/TokenIcon'
import { Placeholder } from '@/components/common/Placeholder'

import styles from './index.module.scss'

function GaugesQubeSpeedInner(): JSX.Element {
    const intl = useIntl()
    const data = useContext(GaugesDataStoreContext)

    return (
        <div className={styles.qubeSpeed}>
            <GaugesTitle>
                {data.qubeToken ? (
                    <TokenIcon
                        size="small"
                        address={data.qubeToken.root}
                        icon={data.qubeToken.icon}
                    />
                ) : (
                    <Placeholder circle width={24} />
                )}

                {intl.formatMessage({
                    id: 'GAUGE_QUBE_SPEED_TITLE',
                })}
            </GaugesTitle>

            <QubeSpeedTable />
        </div>
    )
}

export const GaugesQubeSpeed = observer(GaugesQubeSpeedInner)
