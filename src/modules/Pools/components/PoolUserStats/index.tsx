import * as React from 'react'
import classNames from 'classnames'

import { DepositBanner } from '@/modules/Pools/components/PoolUserStats/components/DepositBanner'
import { FarmLockedBalance } from '@/modules/Pools/components/PoolUserStats/components/FarmLockedBalance'
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
                <div className={classNames(styles.pool_user_stats__grid, styles.pool_user_stats__grid_stack)}>
                    <WalletBalance />
                    <FarmLockedBalance />
                </div>
            </div>
            <div className={styles.pool_user_stats__grid_column}>
                <DepositBanner />
            </div>
        </div>
    )
}
