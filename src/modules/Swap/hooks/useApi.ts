import { API_V2_URL } from '@/config'
import type {
    CrossSwapRoutePayloadRequest,
    CrossSwapRoutePayloadResponse,
    CrossSwapRouteRequest,
    CrossSwapRouteResponse,
    CrossSwapStatusRequest,
    CrossSwapStatusResponse,
} from '@/modules/Swap/types'
import { apiRoutes } from '@/routes'
import { createHandler } from '@/utils'

const api = {
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
