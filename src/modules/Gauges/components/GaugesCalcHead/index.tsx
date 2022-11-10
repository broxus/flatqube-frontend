import * as React from 'react'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { appRoutes } from '@/routes'
import { GaugesHead } from '@/modules/Gauges/components/GaugesHead'

import styles from './index.module.scss'

export function GaugesCalcHead(): JSX.Element {
    const intl = useIntl()

    return (
        <GaugesHead
            className={styles.gaugesCalcHead}
            action={(
                <Button
                    type="secondary"
                    link={appRoutes.daoBalance.makeUrl()}
                    size="md"
                >
                    {intl.formatMessage({
                        id: 'GAUGE_CALC_TITLE_BTN',
                    })}
                </Button>
            )}
        >
            {intl.formatMessage({
                id: 'GAUGE_CALC_TITLE',
            })}
        </GaugesHead>
    )
}
