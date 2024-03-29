import { API_URL, FARMING_POOL_API_URL } from '@/config'
import {
    FarmingGraphicRequest, FarmingGraphicResponse, FarmingPoolRequest,
    FarmingPoolResponse, FarmingPoolsRequest, FarmingPoolsResponse,
    TransactionsRequest, TransactionsResponse,
} from '@/modules/Farming/types'
import { CurrencyResponse } from '@/modules/Currencies/types'
import { apiRoutes, farmingApiRoutes } from '@/routes'
import { createHandler } from '@/utils'

const farmingApi = {
    farmingPools: createHandler(
        farmingApiRoutes.farmingPools,
        FARMING_POOL_API_URL,
    )<FarmingPoolsResponse, FarmingPoolsRequest>(),
    farmingPool: createHandler(
        farmingApiRoutes.farmingPool,
        FARMING_POOL_API_URL,
    )<FarmingPoolResponse, FarmingPoolRequest>(),
    transactions: createHandler(
        farmingApiRoutes.transactions,
        FARMING_POOL_API_URL,
    )<TransactionsResponse, TransactionsRequest>(),
    graphicTvl: createHandler(
        farmingApiRoutes.graphicTvl,
        FARMING_POOL_API_URL,
    )<FarmingGraphicResponse, FarmingGraphicRequest>(),
    graphicApr: createHandler(
        farmingApiRoutes.graphicApr,
        FARMING_POOL_API_URL,
    )<FarmingGraphicResponse, FarmingGraphicRequest>(),
    currency: createHandler(
        apiRoutes.currency,
        API_URL,
    )<CurrencyResponse>(),
}

export type FarmingApi = typeof farmingApi

export function useApi(): FarmingApi {
    return farmingApi
}
