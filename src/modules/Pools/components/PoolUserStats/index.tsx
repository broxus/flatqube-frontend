import * as React from 'react'

import { TotalBalance } from '@/modules/Pools/components/PoolUserStats/components/TotalBalance'
import { WalletBalance } from '@/modules/Pools/components/PoolUserStats/components/WalletBalance'

import styles from './index.module.scss'

export function PoolUserStats(): JSX.Element {
    return (
        <div className={styles.pool_user_stats__grid}>
            <div className={styles.pool_user_stats__grid_column}>
                <TotalBalance />
            </div>
            <div className={styles.pool_user_stats__grid_column}>
                <WalletBalance />
            </div>
        </div>
    )
}
