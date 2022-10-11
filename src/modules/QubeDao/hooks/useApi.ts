import { GAUGES_API_URL, QUBE_DAO_API_URL } from '@/config'
import type { CurrencyResponse } from '@/modules/Currencies/types'
import type {
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
    QubeDaoGaugesRequest,
    QubeDaoGaugesResponse,
    QubeDaoMainPageResponse,
    QubeDaoTransactionsRequest,
    QubeDaoTransactionsResponse,
} from '@/modules/QubeDao/types'
import { apiRoutes, qubeDaoApiRoutes } from '@/routes'
import { createHandler } from '@/utils'
import { GaugeBatchResponse, QubeDaoGaugeBatchRequest } from '@/modules/QubeDao/types'


const qubeDaoApi = {
    balance: createHandler<{ address: string }>(
        qubeDaoApiRoutes.balance,
        QUBE_DAO_API_URL,
    )<QubeDaoBalanceResponse, never>(),
    balancesSearch: createHandler(
        qubeDaoApiRoutes.balancesSearch,
        QUBE_DAO_API_URL,
    )<QubeDaoBalancesResponse, QubeDaoBalancesRequest>(),
    balancesStatsSearch: createHandler(
        qubeDaoApiRoutes.balancesStatsSearch,
        QUBE_DAO_API_URL,
    )<QubeDaoBalancesStatsResponse, QubeDaoBalancesStatsRequest>(),
    currency: createHandler(apiRoutes.currency)<CurrencyResponse>(),
    depositsSearch: createHandler(
        qubeDaoApiRoutes.depositsSearch,
        QUBE_DAO_API_URL,
    )<QubeDaoDepositsResponse, QubeDaoDepositsRequest>(),
    depositsStatsSearch: createHandler(
        qubeDaoApiRoutes.depositsStatsSearch,
        QUBE_DAO_API_URL,
    )<QubeDaoDepositsStatsResponse, QubeDaoDepositsStatsRequest>(),
    epochsDistributionsSearch: createHandler(
        qubeDaoApiRoutes.epochsDistributionsSearch,
        QUBE_DAO_API_URL,
    )<QubeDaoEpochDistributionsResponse, QubeDaoEpochDistributionsRequest>(),
    epochsLast: createHandler(qubeDaoApiRoutes.epochsLast, QUBE_DAO_API_URL)<QubeDaoEpochResponse, never>(),
    epochsSearch: createHandler(
        qubeDaoApiRoutes.epochsSearch,
        QUBE_DAO_API_URL,
    )<QubeDaoEpochsResponse, QubeDaoEpochsRequest>(),
    epochsVotesSearch: createHandler(
        qubeDaoApiRoutes.epochsVotesSearch,
        QUBE_DAO_API_URL,
    )<QubeDaoEpochVotesResponse, QubeDaoEpochVotesRequest>(),
    epochsVotesSum: createHandler<{ epochNum: string }>(
        qubeDaoApiRoutes.epochsVotesSum,
        QUBE_DAO_API_URL,
    )<QubeDaoEpochVotesSumResponse[], never>(),
    gaugesBatch: createHandler(
        qubeDaoApiRoutes.gaugesBatch,
        GAUGES_API_URL,
    )<GaugeBatchResponse, QubeDaoGaugeBatchRequest>(),
    gaugesSearch: createHandler(
        qubeDaoApiRoutes.gaugesSearch,
        QUBE_DAO_API_URL,
    )<QubeDaoGaugesResponse, QubeDaoGaugesRequest>(),
    mainPage: createHandler(qubeDaoApiRoutes.mainPage, QUBE_DAO_API_URL)<QubeDaoMainPageResponse, never>(),
    transactionsSearch: createHandler(
        qubeDaoApiRoutes.transactionsSearch,
        QUBE_DAO_API_URL,
    )<QubeDaoTransactionsResponse, QubeDaoTransactionsRequest>(),
}

export type QubeDaoApi = typeof qubeDaoApi

export function useQubeDaoApi(): QubeDaoApi {
    return qubeDaoApi
}
