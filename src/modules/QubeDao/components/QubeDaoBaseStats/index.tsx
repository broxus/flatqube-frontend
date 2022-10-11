import * as React from 'react'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { when } from 'mobx'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { RateChange } from '@/components/common/RateChange'
import { Placeholder } from '@/components/common/Placeholder'
import { QubeDaoBaseStatsStore } from '@/modules/QubeDao/stores/QubeDaoBaseStatsStore'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { AverageLockTime } from '@/modules/QubeDao/components/QubeDaoBaseStats/components/AverageLockTime'
import { QubeDaoFarmBoostBanner } from '@/modules/QubeDao/components/QubeDaoBaseStats/components/FarmBoostBanner'
import { badRateStyle, goodRateStyle, RatesChart } from '@/modules/QubeDao/components/QubeDaoBaseStats/components/RatesChart'
import { formattedTokenAmount } from '@/utils'

import styles from './index.module.scss'


export function QubeDaoBaseStats(): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()

    const baseStatsStore = React.useMemo(() => new QubeDaoBaseStatsStore(daoContext), [])

    React.useEffect(() => when(
        () => daoContext.tokensCache.isReady,
        async () => {
            await baseStatsStore.fetch()
        },
    ))

    return (
        <section className="section">
            <Observer>
                {() => {
                    const isFetchingDetails = (
                        daoContext.isFetchingDetails
                        || daoContext.isFetchingDetails === undefined
                    )
                    const isFetchingBalancesStats = (
                        baseStatsStore.isFetchingBalancesStats
                        || baseStatsStore.isFetchingDepositsStats === undefined
                    )
                    const isFetchingDepositsStats = (
                        baseStatsStore.isFetchingDepositsStats
                        || baseStatsStore.isFetchingDepositsStats === undefined
                    )
                    return (
                        <div className={classNames(styles.stats_grid, styles.stats_grid__2_3)}>
                            <div className={styles.stats_grid}>
                                <div className={styles.stats_grid_item}>
                                    <div className="card card--flat card--xsmall">
                                        <div className={styles.stats_stat_term}>
                                            {intl.formatMessage(
                                                { id: 'QUBE_DAO_STATS_TOTAL_LOCKED_TOKENS_TERM' },
                                                { symbol: daoContext.tokenSymbol },
                                            )}
                                        </div>
                                        <div className={styles.stats_stat_value}>
                                            {isFetchingDetails
                                                ? <Placeholder height={24} width={90} />
                                                : formattedTokenAmount(
                                                    daoContext.totalLockedAmount,
                                                    daoContext.tokenDecimals,
                                                )}
                                        </div>
                                        {(baseStatsStore.tokenRateChange !== undefined && !isFetchingBalancesStats) && (
                                            <div className={styles.stats_stat_rate}>
                                                <RateChange size="sm" value={baseStatsStore.tokenRateChange} />
                                            </div>
                                        )}
                                        <div className={styles.stats_stat_chart}>
                                            <RatesChart
                                                chartStyles={
                                                    new BigNumber(baseStatsStore.tokenRateChange ?? 0).lt(0)
                                                        ? badRateStyle
                                                        : goodRateStyle
                                                }
                                                data={baseStatsStore.tokenBalancesStats}
                                                loading={isFetchingBalancesStats}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.stats_grid_item}>
                                    <div className="card card--flat card--xsmall">
                                        <div className={styles.stats_stat_term}>
                                            {intl.formatMessage({ id: 'QUBE_DAO_STATS_AVERAGE_LOCK_TIME_TERM' })}
                                        </div>
                                        <div className={styles.stats_stat_value}>
                                            {isFetchingDetails
                                                ? <Placeholder height={24} width={90} />
                                                : <AverageLockTime units={baseStatsStore.averageLockTimeUnits} />}
                                        </div>
                                        {(
                                            baseStatsStore.averageLockTimeRateChange !== undefined
                                            && !isFetchingDepositsStats
                                        ) && (
                                            <div className={styles.stats_stat_rate}>
                                                <RateChange size="sm" value={baseStatsStore.averageLockTimeRateChange} />
                                            </div>
                                        )}
                                        <div className={styles.stats_stat_chart}>
                                            <RatesChart
                                                chartStyles={
                                                    new BigNumber(baseStatsStore.averageLockTimeRateChange ?? 0).lt(0)
                                                        ? badRateStyle
                                                        : goodRateStyle
                                                }
                                                data={baseStatsStore.averageLockTimesStats}
                                                loading={isFetchingDepositsStats}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="card card--flat card--xsmall">
                                    <div className={styles.stats_stat_term}>
                                        {intl.formatMessage(
                                            { id: 'QUBE_DAO_STATS_TOTAL_LOCKED_VE_TERM' },
                                            { symbol: daoContext.veSymbol },
                                        )}
                                    </div>
                                    <div className={styles.stats_stat_value}>
                                        {isFetchingDetails
                                            ? <Placeholder height={24} width={90} />
                                            : formattedTokenAmount(
                                                daoContext.totalLockedVeAmount,
                                                daoContext.veDecimals,
                                            )}
                                    </div>
                                    {(
                                        baseStatsStore.veRateChange !== undefined
                                        && !isFetchingDetails
                                        && !isFetchingBalancesStats
                                    ) && (
                                        <div className={styles.stats_stat_rate}>
                                            <RateChange size="sm" value={baseStatsStore.veRateChange} />
                                        </div>
                                    )}
                                </div>
                                <div className="card card--flat card--xsmall">
                                    <div className={styles.stats_stat_term}>
                                        {intl.formatMessage(
                                            { id: 'QUBE_DAO_STATS_TOTAL_SUPPLY_SHARE_TERM' },
                                            { symbol: daoContext.tokenSymbol },
                                        )}
                                    </div>
                                    <div className={styles.stats_stat_value}>
                                        {isFetchingDetails
                                            ? <Placeholder height={24} width={90} />
                                            : `${formattedTokenAmount(baseStatsStore.totalSupplyShare)}%`}
                                    </div>
                                    {(
                                        baseStatsStore.totalSupplyShareRateChange !== undefined
                                        && !isFetchingDetails
                                        && !isFetchingBalancesStats
                                    ) && (
                                        <div className={styles.stats_stat_rate}>
                                            <RateChange size="sm" value={baseStatsStore.totalSupplyShareRateChange} />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <QubeDaoFarmBoostBanner />
                        </div>
                    )
                }}
            </Observer>
        </section>
    )
}
