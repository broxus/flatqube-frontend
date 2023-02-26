import { API_V2_URL } from '@/config'
import type {
    CurrenciesRequest,
    CurrenciesResponse,
    CurrencyGraphRequest,
    CurrencyResponse,
    CurrencyTransactionsRequest,
    CurrencyTransactionsResponse,
} from '@/modules/Currencies/types'
import type { OhlcvGraphModel, TvlGraphModel, VolumeGraphModel } from '@/modules/Charts/types'
import type { PoolsRequest, PoolsResponse } from '@/modules/Pools/types'
import { apiRoutes } from '@/routes'
import { createHandler } from '@/utils'

const currenciesApi = {
    currencies: createHandler(apiRoutes.currencies)<CurrenciesResponse, CurrenciesRequest>(),
    currency: createHandler(apiRoutes.currency)<CurrencyResponse>(),
    currencyPrices: createHandler(apiRoutes.currencyPrices)<OhlcvGraphModel[], CurrencyGraphRequest>(),
    currencyTvl: createHandler(apiRoutes.currencyTvl)<TvlGraphModel[], CurrencyGraphRequest>(),
    currencyVolume: createHandler(apiRoutes.currencyVolume)<VolumeGraphModel[], CurrencyGraphRequest>(),
    relatedPools: createHandler(apiRoutes.pools, API_V2_URL)<PoolsResponse, PoolsRequest>(),
    transactions: createHandler(apiRoutes.transactions, API_V2_URL)<
        CurrencyTransactionsResponse,
        CurrencyTransactionsRequest
    >(),
}


export type CurrenciesApi = typeof currenciesApi

export function useCurrenciesApi(): CurrenciesApi {
    return currenciesApi
}
