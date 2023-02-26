import { generatePath } from 'react-router-dom'

export type Params = Record<string, string>

export type URLTokensParams = {
    leftTokenRoot?: string;
    rightTokenRoot?: string;
}

export type URLAddressParam = {
    address: string;
}

export class Route<P extends Params> {

    readonly path: string

    constructor(path: string) {
        this.path = path
    }

    makeUrl(params?: P): string {
        return generatePath(this.path, params)
    }

}

/* eslint-disable sort-keys */
export const apiRoutes = {
    crossPairs: new Route('/pairs/cross_pairs'),
    currencies: new Route('/currencies'),
    currency: new Route<URLAddressParam>('/currencies/:address'),
    currencyPrices: new Route<URLAddressParam>('/currencies/:address/prices'),
    currencyVolume: new Route<URLAddressParam>('/currencies/:address/volume'),
    currencyTvl: new Route<URLAddressParam>('/currencies/:address/tvl'),
    currenciesUsdtPrices: new Route('/currencies_usdt_prices'),
    pool: new Route('/pools/address/:address([0][:][0-9a-f]{64})?'),
    pools: new Route('/pools'),
    poolOhlcv: new Route('/pools/ohlcv'),
    poolCrossSwapRoute: new Route('/pools/cross_swap_route'),
    poolCrossSwapRoutePayload: new Route('/pools/cross_swap_payload'),
    poolCrossSwapStatus: new Route('/pools/cross_swap_payload_status'),
    transactions: new Route('/transactions'),
}

export const farmingApiRoutes = {
    transactions: new Route('/transactions'),
    farmingPools: new Route('/farming_pools'),
    farmingPool: new Route<URLAddressParam>('/farming_pools/:address'),
    graphicTvl: new Route('/graphic/tvl'),
    graphicApr: new Route('/graphic/apr'),
}

export const qubeDaoApiRoutes = {
    balance: new Route('/balances/:address'),
    balancesSearch: new Route('/balances/search'),
    balancesStatsSearch: new Route('/balances/statistics/search'),
    depositsSearch: new Route('/deposits/search'),
    depositsStatsSearch: new Route('/deposits/statistics/search'),
    epochsDistributionsSearch: new Route('/epochs/distributions/search'),
    epochsSearch: new Route('/epochs/search'),
    epochsVotesSearch: new Route('/epochs/votes/search'),
    epochsVotesSum: new Route('/epochs/:epochNum/votes/sum'),
    epochsLast: new Route('/epochs/last'),
    gaugesBatch: new Route('/gauges/batch'),
    gaugesByUserAddress: new Route('/gauges/get-by-user'),
    mainPage: new Route('/main_page'),
    transactionsSearch: new Route('/transactions/search'),
    whitelistSearch: new Route('/whitelist/search'),
}

export const gaugesApiRoutes = {
    deposits: new Route('/deposits'),
    gauge: new Route('/gauges/get'),
    gaugeByLpRoot: new Route('/gauges/get-by-root'),
    gaugeMaxApr: new Route('/gauges/max-apr'),
    gaugeMinApr: new Route('/gauges/min-apr'),
    gauges: new Route('/gauges'),
    batch: new Route('/gauges/batch'),
    gaugeTvl: new Route('/gauges/tvl'),
    qubeRewardRounds: new Route('/reward-rounds/qube'),
    tokenRewardRounds: new Route('/reward-rounds/tokens'),
    transactions: new Route('/transactions'),
    historyBalance: new Route('/gauges/user-history-balance'),
}

export const tokensApiRoutes = {
    token: new Route<URLAddressParam>('/root_contract/root_address/:address'),
}


export const appRoutes = {
    home: new Route('/'),
    swap: new Route<URLTokensParams>('/swap/:leftTokenRoot?/:rightTokenRoot?'),
    pool: new Route<URLAddressParam>('/pools/:address([0][:][0-9a-f]{64})?'),
    poolAddLiquidity: new Route<URLAddressParam>('/pools/:address([0][:][0-9a-f]{64})/liquidity/add'),
    poolRemoveLiquidity: new Route<URLAddressParam>('/pools/:address([0][:][0-9a-f]{64})/liquidity/remove'),
    pools: new Route('/pools'),
    liquidityAdd: new Route<URLTokensParams>('/liquidity/add/:leftTokenRoot([0][:][0-9a-f]{64})?/:rightTokenRoot([0][:][0-9a-f]{64})?'),
    liquidityRemove: new Route<URLTokensParams>('/liquidity/remove/:leftTokenRoot([0][:][0-9a-f]{64})?/:rightTokenRoot([0][:][0-9a-f]{64})?'),
    tokens: new Route('/tokens'),
    token: new Route<URLAddressParam>('/tokens/:address([0][:][0-9a-f]{64})?'),
    farming: new Route('/farming'),
    farmingItem: new Route<URLAddressParam>('/farming/:address([0][:][0-9a-f]{64})'),
    farmingItemUser: new Route<URLAddressParam & { user: string }>('/farming/:address([0][:][0-9a-f]{64})/:user([0][:][0-9a-f]{64})?'),
    farmingCreate: new Route('/farming/create'),
    dao: new Route('/dao'),
    daoBalance: new Route('/dao/balance'),
    daoEpoch: new Route<{ epochNum: string }>('/dao/epochs/:epochNum'),
    daoWhitelisting: new Route('/dao/whitelisting'),
    builder: new Route('/builder'),
    builderCreate: new Route('/builder/create'),
    builderItem: new Route<{ tokenRoot: string }>('/builder/:tokenRoot([0][:][0-9a-f]{64})'),
    gauges: new Route('/gauges'),
    gaugesCreate: new Route('/gauges/create'),
    gaugesItem: new Route<URLAddressParam>('/gauges/:address([0][:][0-9a-f]{64})'),
    gaugesCalc: new Route('/gauges/calc'),
}
