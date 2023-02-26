import * as React from 'react'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { when } from 'mobx'
import { Observer } from 'mobx-react-lite'
import { IntlShape, useIntl } from 'react-intl'
import { LineData } from 'lightweight-charts'

import { RateChange } from '@/components/common/RateChange'
import { Placeholder } from '@/components/common/Placeholder'
import { QubeDaoBaseStatsStore } from '@/modules/QubeDao/stores/QubeDaoBaseStatsStore'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { AverageLockTime } from '@/modules/QubeDao/components/QubeDaoBaseStats/components/AverageLockTime'
import { QubeDaoFarmBoostBanner } from '@/modules/QubeDao/components/QubeDaoBaseStats/components/FarmBoostBanner'
import { badRateStyle, goodRateStyle, RatesChart } from '@/modules/QubeDao/components/QubeDaoBaseStats/components/RatesChart'
import { formattedTokenAmount } from '@/utils'
import {
    SECONDS_IN_DAY, SECONDS_IN_HOUR, SECONDS_IN_MINUTE, SECONDS_IN_MONTH, SECONDS_IN_YEAR,
} from '@/constants'

import styles from './index.module.scss'

function tokenAmountFormatter(symbol: string): (value: LineData | undefined) => string {
    return (value: LineData | undefined) => `${formattedTokenAmount(value?.value.toString())} ${symbol}`
}

function averageLockFormatter(intl: IntlShape): (value: LineData | undefined) =>string {
    return (value: LineData | undefined): string => {
        const valueNumber = new BigNumber(value?.value.toString() ?? 0)
        const currentValue = valueNumber.shiftedBy(valueNumber.decimalPlaces() ?? 0).toNumber()
        const months = currentValue >= SECONDS_IN_YEAR
            ? (currentValue % SECONDS_IN_YEAR) / SECONDS_IN_MONTH
            : currentValue / SECONDS_IN_MONTH
        const days = currentValue >= SECONDS_IN_MONTH
            ? (currentValue % SECONDS_IN_MONTH) / SECONDS_IN_DAY
            : currentValue / SECONDS_IN_DAY
        const hours = currentValue >= SECONDS_IN_DAY
            ? (currentValue % SECONDS_IN_DAY) / SECONDS_IN_HOUR
            : currentValue / SECONDS_IN_HOUR
        const minutes = currentValue >= SECONDS_IN_HOUR
            ? (currentValue % SECONDS_IN_HOUR) / SECONDS_IN_MINUTE
            : currentValue / SECONDS_IN_MINUTE

        const units = {
            days: currentValue > SECONDS_IN_DAY ? Math.floor(days) : 0,
            hours: currentValue > SECONDS_IN_HOUR ? Math.floor(hours) : 0,
            minutes: currentValue > SECONDS_IN_MINUTE ? Math.floor(minutes) : 0,
            months: currentValue > SECONDS_IN_MONTH ? Math.floor(months) : 0,
            years: currentValue > SECONDS_IN_YEAR
                ? Math.floor(currentValue / SECONDS_IN_YEAR)
                : 0,
        }

        switch (true) {
            case units.years > 0:
                return intl.formatMessage(
                    { id: 'QUBE_DAO_STATS_AVERAGE_LOCK_TIME' },
                    {
                        days: 0,
                        hours: 0,
                        minutes: 0,
                        months: units.months.toFixed(0),
                        years: units.years.toFixed(0),
                    },
                )

            case units.months > 0:
                return intl.formatMessage(
                    { id: 'QUBE_DAO_STATS_AVERAGE_LOCK_TIME' },
                    {
                        days: units.days.toFixed(0),
                        hours: 0,
                        minutes: 0,
                        months: units.months.toFixed(0),
                        years: 0,
                    },
                )

            case units.days > 0:
                return intl.formatMessage(
                    { id: 'QUBE_DAO_STATS_AVERAGE_LOCK_TIME' },
                    {
                        days: units.days.toFixed(0),
                        hours: units.hours.toFixed(0),
                        minutes: 0,
                        months: 0,
                        years: 0,
                    },
                )

            case units.hours > 0:
                return intl.formatMessage(
                    { id: 'QUBE_DAO_STATS_AVERAGE_LOCK_TIME' },
                    {
                        days: 0,
                        hours: units.hours.toFixed(0),
                        minutes: units.minutes.toFixed(0),
                        months: 0,
                        years: 0,
                    },
                )

            case units.minutes > 0:
                return intl.formatMessage(
                    { id: 'QUBE_DAO_STATS_AVERAGE_LOCK_TIME' },
                    {
                        days: 0,
                        hours: 0,
                        minutes: units.minutes.toFixed(0),
                        months: 0,
                        years: 0,
                    },
                )

            default:
                return '—'
        }
    }
}


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
                                                legendFormatter={tokenAmountFormatter(daoContext.tokenSymbol)}
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
                                                legendFormatter={averageLockFormatter(intl)}
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
                                            <RateChange
                                                displayPercents={false}
                                                size="sm"
                                                value={baseStatsStore.totalSupplyShareRateChange}
                                            />
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
