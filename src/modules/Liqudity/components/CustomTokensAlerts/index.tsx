import * as React from 'react'
import { useIntl } from 'react-intl'

import { Warning } from '@/components/common/Warning'

import styles from './index.module.scss'

export function CustomTokensAlerts(): JSX.Element {
    const intl = useIntl()
    return (
        <div className={styles.warning}>
            <Warning
                text={intl.formatMessage({ id: 'LIQUIDITY_CUSTOM_TOKENS_ALERT' })}
                theme="warning"
            />
        </div>
    )
}
