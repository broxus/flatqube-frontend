import { P2P_API_URL } from '@/config'
import { apiRoutes } from '@/routes'
import { createHandler } from '@/utils'
import { LimitOrderBookItem, LimitOrderGraphItem, LimitOrdersPaginationResponse } from '@/modules/LimitOrders/types'

const api = {
    limitOrderDepth: createHandler(apiRoutes.limitOrderBook, P2P_API_URL)<LimitOrderBookItem[]>(),
    limitOrderGraph: createHandler(apiRoutes.limitOrderGraph, P2P_API_URL)<LimitOrderGraphItem[]>(),
    limitOrderHistoryList: createHandler(apiRoutes.limitOrderHistoryList, P2P_API_URL)<LimitOrdersPaginationResponse>(),
    limitOrderList: createHandler(apiRoutes.limitOrderList, P2P_API_URL)<LimitOrdersPaginationResponse>(),
}

export type LimitOrderApi = typeof api

export function useP2pApi(): LimitOrderApi {
    return api
}
