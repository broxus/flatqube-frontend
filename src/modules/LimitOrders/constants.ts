import {
    BuySellSwitch,
    LimitOrdersFilter,
    LimitOrdersPaginationResponse,
    OrderViewMode,
    P2PPairStoreGraphData,
} from '@/modules/LimitOrders/types'

export const DEFAULT_LIMIT_ORDERS_DATA: LimitOrdersPaginationResponse = {
    items: [],
    skip: 0,
    total: 0,
}

export const DEFAULT_LIMIT_ORDERS_LIST: Record<OrderViewMode, LimitOrdersPaginationResponse> = {
    [OrderViewMode.OPEN_ORDERS]: DEFAULT_LIMIT_ORDERS_DATA,
    [OrderViewMode.MY_OPEN_ORDERS]: DEFAULT_LIMIT_ORDERS_DATA,
    [OrderViewMode.ORDERS_HISTORY]: DEFAULT_LIMIT_ORDERS_DATA,
}

export const DEFAULT_GRAPH_DATA: P2PPairStoreGraphData = {
    depth: null,
    ohlcv: null,
}

export const DEFAULT_LIMIT_ORDERS_FILTER: LimitOrdersFilter = {
    isBuyOrSell: BuySellSwitch.BUY,
    onlyMyOrders: false,
    skip: 0,
    take: 10,
}

export const DEFAULT_LIMIT_ORDERS_FILTERS: Record<OrderViewMode, LimitOrdersFilter> = {
    [OrderViewMode.OPEN_ORDERS]: DEFAULT_LIMIT_ORDERS_FILTER,
    [OrderViewMode.MY_OPEN_ORDERS]: DEFAULT_LIMIT_ORDERS_FILTER,
    [OrderViewMode.ORDERS_HISTORY]: DEFAULT_LIMIT_ORDERS_FILTER,
}

export const DEFAULT_LIMIT_ORDER_LIST_LOADING: Record<OrderViewMode, boolean | undefined> = {
    [OrderViewMode.OPEN_ORDERS]: undefined,
    [OrderViewMode.MY_OPEN_ORDERS]: undefined,
    [OrderViewMode.ORDERS_HISTORY]: undefined,
}
