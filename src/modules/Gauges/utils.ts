import { Address } from 'everscale-inpage-provider'
import BigNumber from 'bignumber.js'
import { Duration } from 'luxon'

import { useStaticRpc } from '@/hooks/useStaticRpc'
import { GaugeAbi } from '@/misc'
import { createHandler, error } from '@/utils'
import { apiRoutes, gaugesApiRoutes, tokensApiRoutes } from '@/routes'
import {
    DepositRequest, DepositResponse, GaugeBatchRequest, GaugeBatchResponse,
    GaugeListRequest, GaugeResponse, RewardRoundRequest, RewardRoundResponse,
    SingleGaugeRequest, SingleGaugeResponse, StatRequest, StatResponse,
    TransactionRequest, TransactionResponse, UserBalanceRequest, UserBalancesResponse,
} from '@/modules/Gauges/api/models'
import { GAUGES_API_URL, TOKENS_API_URL } from '@/config'
import { RewardDetails, TokenResponse } from '@/modules/Gauges/types'
import { SECONDS_IN_DAY } from '@/constants'

export async function calcBoost(id: string, amount: string, lockTime: string): Promise<string> {
    const rpc = useStaticRpc()
    const rootContract = new rpc.Contract(GaugeAbi.Root, new Address(id))
    const result = await rootContract.methods.calculateBoostedAmount({
        amount,
        lock_time: lockTime,
    }).call()

    return new BigNumber(result.boosted_amount)
        .dividedBy(amount)
        .decimalPlaces(2)
        .toFixed()
}

export function decimalAmount(amount: string, decimals: number): string {
    return new BigNumber(amount).shiftedBy(-decimals).toFixed()
}

export function normalizeAmount(amount: string, decimals: number): string {
    return new BigNumber(amount).decimalPlaces(decimals).shiftedBy(decimals).toFixed()
}

export function daysToSecs(value: string): string {
    return !Number.isNaN(+value)
        ? new BigNumber(value)
            .times(86400)
            .decimalPlaces(0, BigNumber.ROUND_DOWN)
            .toFixed()
        : '0'
}

export function secsToDays(value: string): string {
    return !Number.isNaN(+value)
        ? new BigNumber(value)
            .dividedBy(86400)
            .decimalPlaces(4, BigNumber.ROUND_DOWN)
            .toFixed()
        : '0'
}

export function getDuration(period: number): string {
    try {
        const d = Duration.fromMillis(period * 1000)
            .shiftTo('years', 'days', 'hours', 'minutes', 'seconds')
            .toObject()

        return Duration.fromObject({
            days: d.days || undefined,
            hours: d.hours || undefined,
            minutes: d.minutes || undefined,
            seconds: d.seconds || undefined,
            years: d.years || undefined,
        })
            .toHuman({ unitDisplay: 'short' })
    }
    catch (e) {
        error(e)
        return `${period}s`
    }
}

export function getEndDate(rewardDetails: RewardDetails): number | undefined {
    const { _extraRewardEnded, _qubeRewardRounds } = rewardDetails
    const lastQubeRound = _qubeRewardRounds[_qubeRewardRounds.length - 1]

    const extraRewardIsEnded = _extraRewardEnded.length > 0
        ? _extraRewardEnded.every(item => item)
        : true

    const qubeRewardIsEnded = lastQubeRound
        ? new BigNumber(SECONDS_IN_DAY)
            .multipliedBy(15)
            .plus(lastQubeRound.endTime)
            .multipliedBy(1000)
            .lt(Date.now())
        : false

    if (extraRewardIsEnded && qubeRewardIsEnded && lastQubeRound) {
        return Math.max(
            ...rewardDetails._extraRewardRounds
                .filter(items => items.length > 0)
                .map(items => parseInt(items[items.length - 1].endTime, 10)),
            parseInt(lastQubeRound.endTime, 10),
        ) * 1000
    }

    return undefined
}

export function getStartDate(rewardDetails: RewardDetails): number | undefined {
    const qubeStartTime = rewardDetails._qubeRewardRounds[0]
        ? parseInt(rewardDetails._qubeRewardRounds[0].startTime, 10)
        : undefined

    const extraStartTimes = rewardDetails._extraRewardRounds
        .filter(items => items.length > 0)
        .map(items => parseInt(items[0].startTime, 10))

    if (qubeStartTime) {
        return Math.min(qubeStartTime, ...extraStartTimes) * 1000
    }

    if (extraStartTimes.length > 0) {
        return Math.min(...extraStartTimes) * 1000
    }

    return undefined
}

export const usdtPriceHandler = createHandler(
    apiRoutes.currenciesUsdtPrices,
)<{[k: string]: string}>()

export const depositsHandler = createHandler(
    gaugesApiRoutes.deposits,
    GAUGES_API_URL,
)<DepositResponse, DepositRequest>()

export const qubeRewardRoundsHandler = createHandler(
    gaugesApiRoutes.qubeRewardRounds,
    GAUGES_API_URL,
)<RewardRoundResponse, RewardRoundRequest>()

export const tokenRewardRoundsHandler = createHandler(
    gaugesApiRoutes.tokenRewardRounds,
    GAUGES_API_URL,
)<RewardRoundResponse, RewardRoundRequest>()

export const transactionsHandler = createHandler(
    gaugesApiRoutes.transactions,
    GAUGES_API_URL,
)<TransactionResponse, TransactionRequest>()

export const gaugesHandler = createHandler(
    gaugesApiRoutes.gauges,
    GAUGES_API_URL,
)<GaugeResponse, GaugeListRequest>()

export const gaugeHandler = createHandler(
    gaugesApiRoutes.gauge,
    GAUGES_API_URL,
)<SingleGaugeResponse, SingleGaugeRequest>()

export const gaugeTvlHandler = createHandler(
    gaugesApiRoutes.gaugeTvl,
    GAUGES_API_URL,
)<StatResponse, StatRequest>()

export const gaugeMinAprHandler = createHandler(
    gaugesApiRoutes.gaugeMinApr,
    GAUGES_API_URL,
)<StatResponse, StatRequest>()

export const gaugeMaxAprHandler = createHandler(
    gaugesApiRoutes.gaugeMaxApr,
    GAUGES_API_URL,
)<StatResponse, StatRequest>()

export const tokensHandler = createHandler(
    tokensApiRoutes.token,
    TOKENS_API_URL,
)<TokenResponse>()

export const batchHandler = createHandler(
    gaugesApiRoutes.batch,
    GAUGES_API_URL,
)<GaugeBatchResponse, GaugeBatchRequest>()

export const historyBalanceHandler = createHandler(
    gaugesApiRoutes.historyBalance,
    GAUGES_API_URL,
)<UserBalancesResponse, UserBalanceRequest>()
