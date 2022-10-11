import * as React from 'react'

import { Placeholder } from '@/components/common/Placeholder'

import styles from './index.module.scss'

export function StartBannerPlaceholder(): JSX.Element {
    return (
        <div className={styles.startBanner}>
            <h3 className={styles.title}>
                <Placeholder width="100%" />
                <Placeholder width="100%" />
                <Placeholder width="30%" />
            </h3>
            <div className={styles.text}>
                <Placeholder width="100%" />
                <Placeholder width="30%" />
            </div>
        </div>
    )
}
