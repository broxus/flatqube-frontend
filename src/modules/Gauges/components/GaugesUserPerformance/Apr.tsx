import classNames from 'classnames'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import BigNumber from 'bignumber.js'

import { GaugesStatus, StatusType } from '@/modules/Gauges/components/GaugesStatus'
import { GaugesPanel } from '@/modules/Gauges/components/GaugesPanel'
import { useContext } from '@/hooks/useContext'
import { GaugesUserDataContext } from '@/modules/Gauges/providers/GaugesUserDataProvider'
import { Placeholder } from '@/components/common/Placeholder'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'
import { formattedAmount } from '@/utils'
import { appRoutes } from '@/routes'
import { GaugesUserPerformanceContext } from '@/modules/Gauges/providers/GaugesUserPerformanceProvider'

import styles from './index.module.scss'

const mapStatusType = (lockBoostApr: string, qubeBoostApr: string): StatusType => {
    const lockBoostAprBN = new BigNumber(lockBoostApr)
    const qubeBoostAprBN = new BigNumber(qubeBoostApr)

    if (lockBoostAprBN.gt(0) && qubeBoostAprBN.gt(0)) {
        return 'green'
    }

    if (lockBoostAprBN.gt(0) || qubeBoostAprBN.gt(0)) {
        return 'yellow'
    }

    return 'red'
}

const mapStatusLabel = (lockBoostApr: string, qubeBoostApr: string): string => {
    const lockBoostAprBN = new BigNumber(lockBoostApr)
    const qubeBoostAprBN = new BigNumber(qubeBoostApr)

    if (lockBoostAprBN.gt(0) && qubeBoostAprBN.gt(0)) {
        return 'GAUGE_HIGH'
    }

    if (lockBoostAprBN.gt(0) || qubeBoostAprBN.gt(0)) {
        return 'GAUGE_MIDDLE'
    }

    return 'GAUGE_LOW'
}

function UserPerformanceAprInner(): JSX.Element {
    const intl = useIntl()
    const data = useContext(GaugesDataStoreContext)
    const userData = useContext(GaugesUserDataContext)
    const userPerformance = useContext(GaugesUserPerformanceContext)

    if (
        userData.qubeBoostApr
        && userData.currentApr
        && userData.lockBoostApr
        && data.apr
        && !userData.aprIsLoading
    ) {
        return (
            <GaugesPanel
                type={mapStatusType(userData.lockBoostApr, userData.qubeBoostApr)}
                className={styles.apr}
            >
                <h2 className={styles.title}>
                    {intl.formatMessage({
                        id: 'GAUGE_CURRENT_APR',
                    })}
                </h2>

                <div className={styles.amount}>
                    <div className={styles.value}>
                        {formattedAmount(userData.currentApr)}
                        %
                    </div>
                    <GaugesStatus
                        type={mapStatusType(userData.lockBoostApr, userData.qubeBoostApr)}
                    >
                        {intl.formatMessage({
                            id: mapStatusLabel(userData.lockBoostApr, userData.qubeBoostApr),
                        })}
                    </GaugesStatus>
                </div>

                <div className={styles.info}>
                    <div className={styles.item}>
                        <div className={styles.value}>
                            {formattedAmount(data.apr)}
                            %
                        </div>
                        <div className={styles.desc}>
                            {intl.formatMessage({
                                id: 'GAUGE_DEFAULT_APR',
                            })}
                        </div>
                    </div>

                    <div className={styles.item}>
                        <div
                            className={classNames(styles.value, {
                                [styles.red]: new BigNumber(userData.lockBoostApr).isZero(),
                            })}
                        >
                            {formattedAmount(userData.lockBoostApr)}
                            %
                        </div>
                        <div className={styles.desc}>
                            {intl.formatMessage({
                                id: 'GAUGE_BOOST_LP_LOCK',
                            })}
                        </div>
                        <div className={styles.link}>
                            <button
                                className={styles.linkBtn}
                                onClick={userPerformance.setDeposit}
                            >
                                {intl.formatMessage({
                                    id: 'GAUGE_BOOST_APR',
                                })}
                            </button>
                        </div>
                    </div>

                    <div className={styles.item}>
                        <div
                            className={classNames(styles.value, {
                                [styles.red]: new BigNumber(userData.qubeBoostApr).isZero(),
                            })}
                        >
                            {formattedAmount(userData.qubeBoostApr)}
                            %
                        </div>
                        <div className={styles.desc}>
                            {intl.formatMessage({
                                id: 'GAUGE_BOOST_QUBE_LOCK',
                            })}
                        </div>
                        <div className={styles.link}>
                            <Link to={appRoutes.daoBalance.makeUrl()}>
                                {intl.formatMessage({
                                    id: 'GAUGE_BOOST_APR',
                                })}
                            </Link>
                        </div>
                    </div>
                </div>
            </GaugesPanel>
        )
    }

    return (
        <GaugesPanel className={styles.apr}>
            <h2 className={styles.title}>
                <Placeholder width={220} />
            </h2>
            <div className={styles.amount}>
                <Placeholder width={100} />
            </div>
        </GaugesPanel>
    )
}

export const UserPerformanceApr = observer(UserPerformanceAprInner)
