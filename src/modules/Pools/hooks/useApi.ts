import { API_V2_URL, GAUGES_API_URL } from '@/config'
import type {
    PoolGraphRequest,
    PoolGraphResponse,
    PoolRelatedGaugesRequest,
    PoolRelatedGaugesResponse,
    PoolResponse,
    PoolsRequest,
    PoolsResponse,
    PoolTransactionsRequest,
    PoolTransactionsResponse,
} from '@/modules/Pools/types'
import { apiRoutes, gaugesApiRoutes } from '@/routes'
import { createHandler } from '@/utils'

/* eslint-disable sort-keys,max-len */
const poolsApi = {
    currenciesUsdtPrices: createHandler(apiRoutes.currenciesUsdtPrices)<Record<string, string>, { currency_addresses: string[] }>(),
    pool: createHandler(apiRoutes.pool, API_V2_URL)<PoolResponse>(),
    pools: createHandler(apiRoutes.pools, API_V2_URL)<PoolsResponse, PoolsRequest>(),
    poolOhlcv: createHandler(apiRoutes.poolOhlcv, API_V2_URL)<PoolGraphResponse, PoolGraphRequest>(),
    relatedGauges: createHandler(gaugesApiRoutes.gaugeByLpRoot, GAUGES_API_URL)<PoolRelatedGaugesResponse, PoolRelatedGaugesRequest>(),
    transactions: createHandler(apiRoutes.transactions, API_V2_URL)<PoolTransactionsResponse, PoolTransactionsRequest>(),
}

export type PoolsApi = typeof poolsApi

export function usePoolsApi(): PoolsApi {
    return poolsApi
}
