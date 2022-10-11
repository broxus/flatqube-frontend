import { generatePath } from 'react-router-dom'

export type Params = Record<string, string>

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
    pairs: new Route(
        '/pairs',
    ),
    crossPairs: new Route(
        '/pairs/cross_pairs',
    ),
    newCrossPairs: new Route(
        '/pairs/new_cross_pairs',
    ),
    pair: new Route<{ address: string }>(
        '/pairs/address/:address([0][:][0-9a-f]{64})?',
    ),
    pairOhlcv: new Route<{ address: string }>(
        '/pairs/address/:address([0][:][0-9a-f]{64})?/ohlcv',
    ),
    pairTvl: new Route<{ address: string }>(
        '/pairs/address/:address([0][:][0-9a-f]{64})?/tvl',
    ),
    pairVolume: new Route<{ address: string }>(
        '/pairs/address/:address([0][:][0-9a-f]{64})?/volume',
    ),
    transactions: new Route(
        '/transactions',
    ),
    currencies: new Route(
        '/currencies',
    ),
    currency: new Route<{ address: string }>(
        '/currencies/:address',
    ),
    currencyPrices: new Route<{ address: string }>(
        '/currencies/:address/prices',
    ),
    currencyVolume: new Route<{ address: string }>(
        '/currencies/:address/volume',
    ),
    currencyTvl: new Route<{ address: string }>(
        '/currencies/:address/tvl',
    ),
    currenciesUsdtPrices: new Route(
        '/currencies_usdt_prices',
    ),
}

export const farmingApiRoutes = {
    transactions: new Route(
        '/transactions',
    ),
    farmingPools: new Route(
        '/farming_pools',
    ),
    farmingPool: new Route<{ address: string }>(
        '/farming_pools/:address',
    ),
    graphicTvl: new Route(
        '/graphic/tvl',
    ),
    graphicApr: new Route(
        '/graphic/apr',
    ),
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
    gaugesSearch: new Route('/gauges/search'),
    mainPage: new Route('/main_page'),
    transactionsSearch: new Route('/transactions/search'),
}

export const gaugesApiRoutes = {
    deposits: new Route(
        '/deposits',
    ),
    gauge: new Route(
        '/gauges/get',
    ),
    gaugeMaxApr: new Route(
        '/gauges/max-apr',
    ),
    gaugeMinApr: new Route(
        '/gauges/min-apr',
    ),
    gauges: new Route(
        '/gauges',
    ),
    batch: new Route(
        '/gauges/batch',
    ),
    gaugeTvl: new Route(
        '/gauges/tvl',
    ),
    qubeRewardRounds: new Route(
        '/reward-rounds/qube',
    ),
    tokenRewardRounds: new Route(
        '/reward-rounds/tokens',
    ),
    transactions: new Route(
        '/transactions',
    ),
    historyBalance: new Route(
        '/gauges/user-history-balance',
    ),
}

export const tokensApiRoutes = {
    token: new Route<{address: string}>(
        '/root_contract/root_address/:address',
    ),
}

export const appRoutes = {
    swap: new Route<{ leftTokenRoot?: string, rightTokenRoot?: string }>(
        '/swap/:leftTokenRoot?/:rightTokenRoot?',
    ),
    poolList: new Route(
        '/pools',
    ),
    poolRemoveLiquidity: new Route<{ leftTokenRoot?: string, rightTokenRoot?: string }>(
        '/pools/burn-liquidity/:leftTokenRoot([0][:][0-9a-f]{64})?/:rightTokenRoot([0][:][0-9a-f]{64})?',
    ),
    poolItem: new Route<{ address: string }>(
        '/pools/:address([0][:][0-9a-f]{64})?',
    ),
    poolCreate: new Route<{ leftTokenRoot?: string, rightTokenRoot?: string }>(
        '/pool/:leftTokenRoot([0][:][0-9a-f]{64})?/:rightTokenRoot([0][:][0-9a-f]{64})?',
    ),
    tokenList: new Route(
        '/tokens',
    ),
    tokenItem: new Route<{ address: string }>(
        '/tokens/:address([0][:][0-9a-f]{64})?',
    ),
    pairList: new Route(
        '/pairs',
    ),
    pairItem: new Route<{ poolAddress: string }>(
        '/pairs/:poolAddress',
    ),
    farming: new Route(
        '/farming',
    ),
    farmingItem: new Route<{ address: string }>(
        '/farming/:address',
    ),
    farmingItemUser: new Route<{ address: string, user: string }>(
        '/farming/:address/:user([0][:][0-9a-f]{64})?',
    ),
    farmingCreate: new Route(
        '/farming/create',
    ),
    dao: new Route(
        '/dao',
    ),
    daoBalance: new Route(
        '/dao/balance',
    ),
    daoEpoch: new Route<{ epochNum: string }>(
        '/dao/epochs/:epochNum',
    ),
    builder: new Route(
        '/builder',
    ),
    builderCreate: new Route(
        '/builder/create',
    ),
    builderItem: new Route<{ tokenRoot: string }>(
        '/builder/:tokenRoot',
    ),
    gauges: new Route(
        '/gauges',
    ),
    gaugesCreate: new Route(
        '/gauges/create',
    ),
    gaugesItem: new Route<{ address: string }>(
        '/gauges/:address',
    ),
}
