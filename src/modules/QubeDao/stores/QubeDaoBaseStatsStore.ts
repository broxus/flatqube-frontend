import { computed, makeObservable } from 'mobx'
import BigNumber from 'bignumber.js'
import type { SingleValueData } from 'lightweight-charts'
import { DateTime } from 'luxon'

import {
    SECONDS_IN_DAY,
    SECONDS_IN_HOUR,
    SECONDS_IN_MINUTE,
    SECONDS_IN_MONTH,
    SECONDS_IN_YEAR,
} from '@/constants'
import { useQubeDaoApi } from '@/modules/QubeDao/hooks/useApi'
import { QubeDaoStore } from '@/modules/QubeDao/stores/QubeDaoStore'
import type {
    AverageLockTimeUnits,
    QubeDaoBalancesStatsResponse,
    QubeDaoDepositsStatsResponse,
} from '@/modules/QubeDao/types'
import { BaseStore } from '@/stores/BaseStore'
import { formattedTokenAmount, isGoodBignumber, makeArray } from '@/utils'


export type QubeDaoBaseStatsStoreData = {
    balancesStats: QubeDaoBalancesStatsResponse['balances'];
    depositsStats: QubeDaoDepositsStatsResponse['deposits'];
}

export type QubeDaoBaseStatsStoreState = {
    isFetchingBalancesStats?: boolean;
    isFetchingDepositsStats?: boolean;
}


export class QubeDaoBaseStatsStore extends BaseStore<QubeDaoBaseStatsStoreData, QubeDaoBaseStatsStoreState> {

    protected readonly api = useQubeDaoApi()

    constructor(protected readonly dao: QubeDaoStore) {
        super()

        this.setData(() => ({
            balancesStats: [],
            depositsStats: [],
        }))

        makeObservable(this, {
            averageLockTimeRateChange: computed,
            averageLockTimesStats: computed,
            averageLockTimeUnits: computed,
            balancesStats: computed,
            isFetchingBalancesStats: computed,
            isFetchingDepositsStats: computed,
            tokenBalancesStats: computed,
            tokenRateChange: computed,
            totalSupplyShare: computed,
            totalSupplyShareRateChange: computed,
            veRateChange: computed,
        })
    }

    public async fetch(): Promise<void> {
        try {
            await Promise.allSettled([
                this.fetchBalancesStats(),
                this.fetchDepositsStats(),
            ])
        }
        catch (e) {

        }
    }

    protected async fetchBalancesStats(): Promise<void> {
        if (this.isFetchingBalancesStats) {
            return
        }

        try {
            this.setState('isFetchingBalancesStats', true)

            const response = await this.api.balancesStatsSearch({}, { method: 'POST' }, {
                dayGe: Math.ceil(DateTime.local().minus({ day: 9 }).toSeconds()),
                dayLe: Math.ceil(DateTime.local().toSeconds()),
                limit: 9,
                offset: 0,
                ordering: {
                    column: 'day',
                    direction: 'ASC',
                },
            })

            this.setData('balancesStats', response.balances || [])
        }
        catch (e) {

        }
        finally {
            this.setState('isFetchingBalancesStats', false)
        }
    }

    protected async fetchDepositsStats(): Promise<void> {
        if (this.isFetchingDepositsStats) {
            return
        }

        try {
            this.setState('isFetchingDepositsStats', true)

            const response = await this.api.depositsStatsSearch({}, { method: 'POST' }, {
                dayGe: Math.ceil(DateTime.local().minus({ day: 9 }).toSeconds()),
                dayLe: Math.ceil(DateTime.local().toSeconds()),
                limit: 9,
                offset: 0,
                ordering: {
                    column: 'day',
                    direction: 'ASC',
                },
            })

            this.setData('depositsStats', response.deposits || [])
        }
        catch (e) {

        }
        finally {
            this.setState('isFetchingDepositsStats', false)
        }
    }

    public get balancesStats(): QubeDaoBaseStatsStoreData['balancesStats'] {
        if (this.data.balancesStats.length === 0) {
            return []
        }

        const statsMap = this.data.balancesStats.slice().reduce<
            Record<string, QubeDaoBalancesStatsResponse['balances'][number]>
        >((acc, data) => {
            acc[DateTime.fromSeconds(data.day).toFormat('yyyy-LL-dd')] = data
            return acc
        }, {})

        const stats = this.data.balancesStats.slice().sort((a, b) => a.day - b.day)
        const first = stats[0]?.day ?? DateTime.local().toSeconds()
        const { days = 8 } = DateTime.local().diff(DateTime.fromSeconds(first), ['days', 'hours'])
        const daysCount = days < 8 ? 8 : days

        const dates = makeArray(daysCount, idx => DateTime.local().minus({ day: daysCount - idx }).toFormat('yyyy-LL-dd'))

        dates.unshift(DateTime.fromFormat(dates[0], 'yyyy-LL-dd').minus({ day: 1 }).toFormat('yyyy-LL-dd'))
        dates.push(DateTime.local().toFormat('yyyy-LL-dd'))

        return dates.reduce<QubeDaoBaseStatsStoreData['balancesStats']>((acc, date, idx) => {
            const stat = statsMap[date]
            const prevStat = acc[idx - 1]
            const amount = new BigNumber(stat?.amount || 0)
            const prevAmount = new BigNumber(prevStat?.amount || 0)
            const veAmount = new BigNumber(stat?.veAmount || 0)
            const vePrevAmount = new BigNumber(prevStat?.veAmount || 0)

            acc.push({
                amount: isGoodBignumber(amount) ? amount.toFixed() : prevAmount.toFixed(),
                day: DateTime.fromFormat(date, 'yyyy-LL-dd').toSeconds(),
                veAmount: isGoodBignumber(veAmount) ? veAmount.toFixed() : vePrevAmount.toFixed(),
            })

            return acc
        }, [])
    }

    public get depositsStats(): QubeDaoBaseStatsStoreData['depositsStats'] {
        if (this.data.depositsStats.length === 0) {
            return []
        }

        const statsMap = this.data.depositsStats.slice().reduce<
            Record<string, QubeDaoDepositsStatsResponse['deposits'][number]>
            >((acc, data) => {
                acc[DateTime.fromSeconds(data.day).toFormat('yyyy-LL-dd')] = data
                return acc
            }, {})

        const stats = this.data.depositsStats.slice().sort((a, b) => a.day - b.day)
        const first = stats[0]?.day ?? DateTime.local().toSeconds()
        const { days = 8 } = DateTime.local().diff(DateTime.fromSeconds(first), ['days', 'hours'])
        const daysCount = days < 8 ? 8 : days

        const dates = makeArray(daysCount, idx => DateTime.local().minus({ day: daysCount - idx }).toFormat('yyyy-LL-dd'))

        dates.unshift(DateTime.fromFormat(dates[0], 'yyyy-LL-dd').minus({ day: 1 }).toFormat('yyyy-LL-dd'))
        dates.push(DateTime.local().toFormat('yyyy-LL-dd'))

        return dates.reduce<QubeDaoBaseStatsStoreData['depositsStats']>((acc, date, idx) => {
            const stat = statsMap[date]
            const prevStat = acc[idx - 1]
            const averageLockTime = new BigNumber(stat?.averageLockTime || 0)
            const prevAverageLockTime = new BigNumber(prevStat?.averageLockTime || 0)

            acc.push({
                averageLockTime: isGoodBignumber(averageLockTime)
                    ? averageLockTime.toNumber()
                    : prevAverageLockTime.toNumber(),
                day: DateTime.fromFormat(date, 'yyyy-LL-dd').toSeconds(),
            })

            return acc
        }, [])
    }

    public get isFetchingBalancesStats(): QubeDaoBaseStatsStoreState['isFetchingBalancesStats'] {
        return this.state.isFetchingBalancesStats
    }

    public get isFetchingDepositsStats(): QubeDaoBaseStatsStoreState['isFetchingDepositsStats'] {
        return this.state.isFetchingDepositsStats
    }

    public get averageLockTimesStats(): SingleValueData[] {
        return this.depositsStats.map(data => ({
            time: DateTime.fromSeconds(data.day).toObject(),
            value: parseFloat(formattedTokenAmount(
                data.averageLockTime,
                this.dao.tokenDecimals,
                { digitsSeparator: '' },
            )),
        }))
    }

    public get averageLockTimeRateChange(): string | undefined {
        if (this.depositsStats.length === 0) {
            return undefined
        }
        const today = this.depositsStats.slice().pop()
        const yesterday = this.depositsStats.slice(0, this.depositsStats.length - 1).pop()
        const denominator = new BigNumber(yesterday?.averageLockTime || 0)
        if (denominator.isZero()) {
            return '100'
        }
        const numerator = new BigNumber(today?.averageLockTime || 0).minus(yesterday?.averageLockTime || 0)
        const value = new BigNumber(numerator.div(denominator)).times(100).precision(2, BigNumber.ROUND_DOWN)
        return !value.isNaN() ? value.toFixed() : undefined
    }

    public get averageLockTimeUnits(): AverageLockTimeUnits {
        const months = this.dao.averageLockTime >= SECONDS_IN_YEAR
            ? (this.dao.averageLockTime % SECONDS_IN_YEAR) / SECONDS_IN_MONTH
            : this.dao.averageLockTime / SECONDS_IN_MONTH
        const days = this.dao.averageLockTime >= SECONDS_IN_MONTH
            ? (this.dao.averageLockTime % SECONDS_IN_MONTH) / SECONDS_IN_DAY
            : this.dao.averageLockTime / SECONDS_IN_DAY
        const hours = this.dao.averageLockTime >= SECONDS_IN_DAY
            ? (this.dao.averageLockTime % SECONDS_IN_DAY) / SECONDS_IN_HOUR
            : this.dao.averageLockTime / SECONDS_IN_HOUR
        const minutes = this.dao.averageLockTime >= SECONDS_IN_HOUR
            ? (this.dao.averageLockTime % SECONDS_IN_HOUR) / SECONDS_IN_MINUTE
            : this.dao.averageLockTime / SECONDS_IN_MINUTE

        return {
            days: this.dao.averageLockTime > SECONDS_IN_DAY ? Math.floor(days) : 0,
            hours: this.dao.averageLockTime > SECONDS_IN_HOUR ? Math.floor(hours) : 0,
            minutes: this.dao.averageLockTime > SECONDS_IN_MINUTE ? Math.floor(minutes) : 0,
            months: this.dao.averageLockTime > SECONDS_IN_MONTH ? Math.floor(months) : 0,
            years: this.dao.averageLockTime > SECONDS_IN_YEAR
                ? Math.floor(this.dao.averageLockTime / SECONDS_IN_YEAR)
                : 0,
        }
    }

    public get tokenBalancesStats(): SingleValueData[] {
        return this.balancesStats.map(data => ({
            time: DateTime.fromSeconds(data.day).toObject(),
            value: parseFloat(formattedTokenAmount(
                data.amount,
                this.dao.tokenDecimals,
                { digitsSeparator: '' },
            )),
        }))
    }

    public get tokenRateChange(): string | undefined {
        if (this.balancesStats.length === 0) {
            return undefined
        }
        const today = this.balancesStats.slice().pop()
        const yesterday = this.balancesStats.slice(0, this.balancesStats.length - 1).pop()
        const denominator = new BigNumber(yesterday?.amount || 1)
        if (denominator.isZero()) {
            return '100'
        }
        const numerator = new BigNumber(today?.amount || 0).minus(yesterday?.amount || 0)
        const value = new BigNumber(numerator.div(denominator)).times(100).precision(2, BigNumber.ROUND_DOWN)
        return !value.isNaN() ? value.toFixed() : undefined
    }

    public get totalSupplyShare(): string | undefined {
        return new BigNumber(this.dao.totalLockedAmount || 0)
            .div(
                new BigNumber(this.dao.tokenTotalSupply || 0)
                    .minus(this.dao.farmingAllocatorTokenBalance || 0)
                    .minus(this.dao.tokenOwnerTokenBalance || 0),
            )
            .times(100)
            .precision(2, BigNumber.ROUND_DOWN)
            .toFixed()
    }

    public get totalSupplyShareRateChange(): string | undefined {
        if (this.balancesStats.length === 0) {
            return undefined
        }
        const today = this.balancesStats.slice().pop()
        const yesterday = this.balancesStats.slice(0, this.balancesStats.length - 1).pop()
        const numerator = new BigNumber(today?.amount || 0).minus(yesterday?.amount || 0)
        const denominator = new BigNumber(this.dao.tokenTotalSupply || 0)
            .minus(this.dao.farmingAllocatorTokenBalance || 0)
            .minus(this.dao.tokenOwnerTokenBalance || 0)
        const value = new BigNumber(numerator.div(denominator))
            .times(100)
            .precision(2, BigNumber.ROUND_DOWN)
        return !value.isNaN() ? value.toFixed() : undefined
    }

    public get veRateChange(): string | undefined {
        if (this.balancesStats.length === 0) {
            return undefined
        }
        const today = this.balancesStats.slice().pop()
        const yesterday = this.balancesStats.slice(0, this.balancesStats.length - 1).pop()
        const denominator = new BigNumber(yesterday?.veAmount || 0)
        if (denominator.isZero()) {
            return '100'
        }
        const numerator = new BigNumber(today?.veAmount || 0).minus(yesterday?.veAmount || 0)
        const value = new BigNumber(numerator.div(denominator)).times(100).precision(2, BigNumber.ROUND_DOWN)
        return !value.isNaN() ? value.toFixed() : undefined
    }

}
