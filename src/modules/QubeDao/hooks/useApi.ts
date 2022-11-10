import { GAUGES_API_URL, QUBE_API_URL } from '@/config'
import type { CurrencyResponse } from '@/modules/Currencies/types'
import type {
    GaugeBatchResponse,
    QubeDaoBalanceResponse,
    QubeDaoBalancesRequest,
    QubeDaoBalancesResponse,
    QubeDaoBalancesStatsRequest,
    QubeDaoBalancesStatsResponse,
    QubeDaoDepositsRequest,
    QubeDaoDepositsResponse,
    QubeDaoDepositsStatsRequest,
    QubeDaoDepositsStatsResponse,
    QubeDaoEpochDistributionsRequest,
    QubeDaoEpochDistributionsResponse,
    QubeDaoEpochResponse,
    QubeDaoEpochsRequest,
    QubeDaoEpochsResponse,
    QubeDaoEpochVotesRequest,
    QubeDaoEpochVotesResponse,
    QubeDaoEpochVotesSumResponse,
    QubeDaoGaugeBatchRequest,
    QubeDaoGaugesByUserAddressRequest,
    QubeDaoGaugesByUserAddressResponse,
    QubeDaoMainPageResponse,
    QubeDaoTransactionsRequest,
    QubeDaoTransactionsResponse,
    QubeDaoWhitelistRequest,
    QubeDaoWhitelistResponse,
} from '@/modules/QubeDao/types'
import { apiRoutes, qubeDaoApiRoutes } from '@/routes'
import { createHandler } from '@/utils'


const qubeDaoApi = {
    balance: createHandler<{ address: string }>(
        qubeDaoApiRoutes.balance,
        QUBE_API_URL,
    )<QubeDaoBalanceResponse, never>(),
    balancesSearch: createHandler(
        qubeDaoApiRoutes.balancesSearch,
        QUBE_API_URL,
    )<QubeDaoBalancesResponse, QubeDaoBalancesRequest>(),
    balancesStatsSearch: createHandler(
        qubeDaoApiRoutes.balancesStatsSearch,
        QUBE_API_URL,
    )<QubeDaoBalancesStatsResponse, QubeDaoBalancesStatsRequest>(),
    currency: createHandler(apiRoutes.currency)<CurrencyResponse>(),
    depositsSearch: createHandler(
        qubeDaoApiRoutes.depositsSearch,
        QUBE_API_URL,
    )<QubeDaoDepositsResponse, QubeDaoDepositsRequest>(),
    depositsStatsSearch: createHandler(
        qubeDaoApiRoutes.depositsStatsSearch,
        QUBE_API_URL,
    )<QubeDaoDepositsStatsResponse, QubeDaoDepositsStatsRequest>(),
    epochsDistributionsSearch: createHandler(
        qubeDaoApiRoutes.epochsDistributionsSearch,
        QUBE_API_URL,
    )<QubeDaoEpochDistributionsResponse, QubeDaoEpochDistributionsRequest>(),
    epochsLast: createHandler(qubeDaoApiRoutes.epochsLast, QUBE_API_URL)<QubeDaoEpochResponse, never>(),
    epochsSearch: createHandler(
        qubeDaoApiRoutes.epochsSearch,
        QUBE_API_URL,
    )<QubeDaoEpochsResponse, QubeDaoEpochsRequest>(),
    epochsVotesSearch: createHandler(
        qubeDaoApiRoutes.epochsVotesSearch,
        QUBE_API_URL,
    )<QubeDaoEpochVotesResponse, QubeDaoEpochVotesRequest>(),
    epochsVotesSum: createHandler<{ epochNum: string }>(
        qubeDaoApiRoutes.epochsVotesSum,
        QUBE_API_URL,
    )<QubeDaoEpochVotesSumResponse[], never>(),
    gaugesBatch: createHandler(
        qubeDaoApiRoutes.gaugesBatch,
        GAUGES_API_URL,
    )<GaugeBatchResponse, QubeDaoGaugeBatchRequest>(),
    gaugesByUserAddress: createHandler(
        qubeDaoApiRoutes.gaugesByUserAddress,
        GAUGES_API_URL,
    )<QubeDaoGaugesByUserAddressResponse, QubeDaoGaugesByUserAddressRequest>(),
    mainPage: createHandler(qubeDaoApiRoutes.mainPage, QUBE_API_URL)<QubeDaoMainPageResponse, never>(),
    transactionsSearch: createHandler(
        qubeDaoApiRoutes.transactionsSearch,
        QUBE_API_URL,
    )<QubeDaoTransactionsResponse, QubeDaoTransactionsRequest>(),
    whitelistSearch: createHandler(
        qubeDaoApiRoutes.whitelistSearch,
        QUBE_API_URL,
    )<QubeDaoWhitelistResponse, QubeDaoWhitelistRequest>(),
}

export type QubeDaoApi = typeof qubeDaoApi

export function useQubeDaoApi(): QubeDaoApi {
    return qubeDaoApi
}
