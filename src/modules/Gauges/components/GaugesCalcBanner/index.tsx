import * as React from 'react'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { storage } from '@/utils'

import styles from './index.module.scss'

export function GaugesCalcBanner(): JSX.Element | null {
    const intl = useIntl()
    const [visible, setVisible] = React.useState(() => storage.get('gauges-calc-banner') === null)

    const onOk = () => {
        setVisible(false)
        storage.set('gauges-calc-banner', '1')
    }

    if (!visible) {
        return null
    }

    return (
        <div className={styles.gaugesCalcBanner}>
            <div className={styles.main}>
                <h3>
                    {intl.formatMessage({
                        id: 'GAUGE_CALC_BANNER_TITLE',
                    })}
                </h3>
                <p>
                    {intl.formatMessage({
                        id: 'GAUGE_CALC_BANNER_TEXT',
                    })}
                </p>
            </div>
            <div className={styles.side}>
                <Button
                    type="empty"
                    size="md"
                    href="https://broxus.medium.com/flatqube-boosting-mechanism-40a6f48c1082"
                >
                    {intl.formatMessage({
                        id: 'GAUGE_CALC_BANNER_SEE_MORE',
                    })}
                </Button>
                <Button
                    type="primary"
                    size="md"
                    onClick={onOk}
                >
                    {intl.formatMessage({
                        id: 'GAUGE_CALC_BANNER_OK',
                    })}
                </Button>
            </div>
        </div>
    )
}
