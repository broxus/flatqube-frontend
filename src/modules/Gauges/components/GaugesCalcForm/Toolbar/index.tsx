import * as React from 'react'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'

import styles from './index.module.scss'

type Props = {
    onFilter: () => void;
}

export function GaugesCalcFormToolbar({
    onFilter,
}: Props): JSX.Element {
    const intl = useIntl()

    return (
        <div className={styles.mobileToolbar}>
            <div className={styles.title}>
                {intl.formatMessage({
                    id: 'GAUGE_CALC_TOOLBAR_TITLE',
                })}
            </div>
            <Button
                type="primary"
                onClick={onFilter}
            >
                {intl.formatMessage({
                    id: 'GAUGE_CALC_TOOLBAR_BTN',
                })}
            </Button>
        </div>
    )
}
