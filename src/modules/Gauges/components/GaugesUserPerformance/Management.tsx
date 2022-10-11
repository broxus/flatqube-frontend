import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'
import classNames from 'classnames'

import { Button } from '@/components/common/Button'
import { useContext } from '@/hooks/useContext'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'
import { Placeholder } from '@/components/common/Placeholder'
import { GaugesUserPerformanceContext } from '@/modules/Gauges/providers/GaugesUserPerformanceProvider'
import { GaugesPanel } from '@/modules/Gauges/components/GaugesPanel'

import styles from './index.module.scss'

type Props = {
    depositVisible?: boolean;
    withdrawVisible?: boolean;
    asToolBar?: boolean;
}

function UserPerformanceManagementInner({
    depositVisible = true,
    withdrawVisible = true,
    asToolBar,
}: Props): JSX.Element | null {
    const intl = useIntl()
    const data = useContext(GaugesDataStoreContext)
    const userPerformance = useContext(GaugesUserPerformanceContext)

    if (data.poolTokens) {
        return (
            <GaugesPanel
                className={classNames(styles.management, {
                    [styles.asToolBar]: asToolBar,
                })}
            >
                <h3 className={styles.title}>
                    {intl.formatMessage({
                        id: 'GAUGE_BALANCE_MANAGEMENT',
                    })}
                </h3>

                <div className={styles.actions}>
                    {depositVisible && (
                        <Button
                            size="md"
                            type="primary"
                            onClick={userPerformance.setDeposit}
                            className={styles.action}
                        >
                            {intl.formatMessage({
                                // eslint-disable-next-line no-nested-ternary
                                id: asToolBar
                                    ? 'GAUGE_DEPOSIT'
                                    : data.poolTokens.length > 1
                                        ? 'GAUGE_DEPOSIT_LP_TOKENS'
                                        : 'GAUGE_DEPOSIT_TOKENS',
                            })}
                        </Button>
                    )}

                    {withdrawVisible && (
                        <Button
                            size="md"
                            type="secondary"
                            onClick={userPerformance.setWithdraw}
                            className={styles.action}
                        >
                            {intl.formatMessage({
                                // eslint-disable-next-line no-nested-ternary
                                id: asToolBar
                                    ? 'GAUGE_WITHDRAW'
                                    : data.poolTokens.length > 1
                                        ? 'GAUGE_WITHDRAW_LP_TOKENS'
                                        : 'GAUGE_WITHDRAW_TOKENS',
                            })}
                        </Button>
                    )}
                </div>
            </GaugesPanel>
        )
    }

    if (asToolBar) {
        return null
    }

    return (
        <GaugesPanel className={styles.management}>
            <h3 className={styles.title}>
                <Placeholder width={200} />
            </h3>
            <div className={styles.action}>
                <Placeholder width="100%" height={44} />
                <Placeholder width="100%" height={44} />
            </div>
        </GaugesPanel>
    )
}

export const UserPerformanceManagement = observer(UserPerformanceManagementInner)
