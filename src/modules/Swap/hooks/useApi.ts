import { API_URL, API_V2_URL } from '@/config'
import { OhlcvGraphModel } from '@/modules/Chart/types'
import type {
    CrossSwapRoutePayloadRequest,
    CrossSwapRoutePayloadResponse,
    CrossSwapRouteRequest,
    CrossSwapRouteResponse,
    CrossSwapStatusRequest,
    CrossSwapStatusResponse,
    PairResponse,
} from '@/modules/Swap/types'
import { apiRoutes } from '@/routes'
import { createHandler } from '@/utils'

const api = {
    pairByTokensRoot: createHandler(apiRoutes.pairByTokensRoot, API_URL)<PairResponse>(),
    pairOhlcvByTokensRoot: createHandler(apiRoutes.pairOhlcvByTokensRoot)<OhlcvGraphModel[]>(),
    poolCrossSwapRoute: createHandler(apiRoutes.poolCrossSwapRoute, API_V2_URL)<
        CrossSwapRouteResponse,
        CrossSwapRouteRequest
    >(),
    poolCrossSwapRoutePayload: createHandler(apiRoutes.poolCrossSwapRoutePayload, API_V2_URL)<
        CrossSwapRoutePayloadResponse,
        CrossSwapRoutePayloadRequest
    >(),
    poolCrossSwapStatus: createHandler(apiRoutes.poolCrossSwapStatus, API_V2_URL)<
        CrossSwapStatusResponse,
        CrossSwapStatusRequest
    >(),
}

export type SwapApi = typeof api

export function useSwapApi(): SwapApi {
    return api
}
