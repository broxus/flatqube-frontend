import type { LineData, Time } from 'lightweight-charts'
import uniqBy from 'lodash.uniqby'
import { DateTime } from 'luxon'
import { action, computed, makeObservable } from 'mobx'

import { OhlcvData, Timeframe } from '@/modules/Charts/types'
import { CurrencyResponse, CurrencyStoreGraphs } from '@/modules/Currencies/types'
import { TokenCache, TokensCacheService } from '@/stores/TokensCacheService'
import { CurrenciesApi, useCurrenciesApi } from '@/modules/Currencies/hooks/useApi'
import { BaseStore } from '@/stores/BaseStore'
import { WalletService } from '@/stores/WalletService'


export type CurrencyStoreData = {
    graphs: CurrencyStoreGraphs;
    currency: CurrencyResponse | undefined;
}

export type CurrencyStoreState = {
    graph: 'prices' | 'tvl' | 'volume'
    isFetching?: boolean;
    isFetchingGraph?: boolean;
    isInitializing?: boolean;
    notFound?: boolean;
    timeframe: Timeframe;
}

export class CurrencyStore extends BaseStore<CurrencyStoreData, CurrencyStoreState> {

    protected readonly api: CurrenciesApi = useCurrenciesApi()

    constructor(
        public readonly address: string,
        public readonly wallet: WalletService,
        public readonly tokensCache: TokensCacheService,
    ) {
        super()

        this.setData({
            graphs: {
                prices: null,
                tvl: null,
                volume: null,
            },
        })

        this.setState(() => ({
            graph: 'prices',
            timeframe: 'H1',
        }))

        makeObservable(this, {
            fetchPricesGraph: action.bound,
            fetchTvlGraph: action.bound,
            fetchVolumeGraph: action.bound,
            graph: computed,
            graphs: computed,
            isFetching: computed,
            isFetchingGraph: computed,
            notFound: computed,
            pricesGraphData: computed,
            timeframe: computed,
            tvlGraphData: computed,
            volumeGraphData: computed,
        })
    }

    public async init(): Promise<void> {
        if (this.state.isInitializing) {
            return
        }

        this.setState('isInitializing', true)

        await Promise.allSettled([
            this.currency === undefined ? this.fetch() : undefined,
            this.graphs.prices == null ? this.fetchPricesGraph() : undefined,
        ])

        this.setState('isInitializing', false)
    }

    protected async fetch(force?: boolean): Promise<void> {
        if (!force && this.isFetching) {
            return
        }

        try {
            this.setState('isFetching', true)

            const response = await this.api.currency({
                address: this.address,
            }, { method: 'POST' })

            this.setData('currency', response)
        }
        catch (e) {
            this.setState('notFound', true)
        }
        finally {
            this.setState('isFetching', false)
        }
    }

    public get currency(): CurrencyStoreData['currency'] {
        return this.data.currency
    }

    public get graphs(): CurrencyStoreData['graphs'] {
        return this.data.graphs
    }

    public get graph(): CurrencyStoreState['graph'] {
        return this.state.graph
    }

    public get isFetching(): CurrencyStoreState['isFetching'] {
        return this.state.isFetching
    }

    public get isFetchingGraph(): CurrencyStoreState['isFetchingGraph'] {
        return this.state.isFetchingGraph
    }

    public get notFound(): CurrencyStoreState['notFound'] {
        return this.state.notFound
    }

    public get timeframe(): CurrencyStoreState['timeframe'] {
        return this.state.timeframe
    }

    public get token(): TokenCache | undefined {
        return this.tokensCache.get(this.address)
    }

    public async fetchPricesGraph(from?: number, to?: number): Promise<void> {
        if (this.isFetchingGraph) {
            return
        }

        try {
            this.setState('isFetchingGraph', true)

            const result = await this.api.currencyPrices({
                address: this.address,
            }, {
                method: 'POST',
            }, {
                from: from || DateTime.local().minus({
                    days: this.timeframe === 'D1' ? 30 : 7,
                }).toUTC(undefined, {
                    keepLocalTime: false,
                }).toMillis(),
                timeframe: this.timeframe,
                to: to || DateTime.local().toUTC(undefined, {
                    keepLocalTime: false,
                }).toMillis(),
            })
            const data = result.concat(this.graphs.prices ?? [])
            this.setData('graphs', { ...this.data.graphs, prices: data.length > 0 ? data : null })
        }
        catch (e) {}
        finally {
            this.setState('isFetchingGraph', false)
        }
    }

    public async fetchVolumeGraph(from?: number, to?: number): Promise<void> {
        if (this.isFetchingGraph) {
            return
        }

        try {
            this.setState('isFetchingGraph', true)

            const result = await this.api.currencyVolume({
                address: this.address,
            }, {
                method: 'POST',
            }, {
                from: from || DateTime.local().minus({
                    days: this.timeframe === 'D1' ? 30 : 7,
                }).toUTC(undefined, {
                    keepLocalTime: false,
                }).toMillis(),
                timeframe: this.timeframe,
                to: to || DateTime.local().toUTC(undefined, {
                    keepLocalTime: false,
                }).toMillis(),
            })
            const data = result.concat(this.graphs.volume ?? [])
            this.setData('graphs', { ...this.data.graphs, volume: data.length > 0 ? data : null })
        }
        catch (e) {}
        finally {
            this.setState('isFetchingGraph', false)
        }
    }

    public async fetchTvlGraph(from?: number, to?: number): Promise<void> {
        if (this.isFetchingGraph) {
            return
        }

        try {
            this.setState('isFetchingGraph', true)

            const result = await this.api.currencyTvl({
                address: this.address,
            }, {
                method: 'POST',
            }, {
                from: from || DateTime.local().minus({
                    days: this.timeframe === 'D1' ? 30 : 7,
                }).toUTC(undefined, {
                    keepLocalTime: false,
                }).toMillis(),
                timeframe: this.timeframe,
                to: to || DateTime.local().toUTC(undefined, {
                    keepLocalTime: false,
                }).toMillis(),
            })
            const data = result.concat(this.graphs.tvl ?? [])
            this.setData('graphs', { ...this.data.graphs, tvl: data.length > 0 ? data : null })
        }
        catch (e) {}
        finally {
            this.setState('isFetchingGraph', false)
        }
    }

    public get pricesGraphData(): OhlcvData[] | null {
        return uniqBy(this.graphs.prices, 'timestamp').map<OhlcvData>(item => ({
            close: parseFloat(item.close),
            high: parseFloat(item.high),
            low: parseFloat(item.low),
            open: parseFloat(item.open),
            time: (item.timestamp / 1000) as Time,
            volume: parseFloat(item.volume),
        }))
    }

    public get volumeGraphData(): LineData[] {
        return uniqBy(this.graphs.volume, 'timestamp').map<LineData>(item => ({
            time: (item.timestamp / 1000) as Time,
            value: parseFloat(item.data),
        }))
    }

    public get tvlGraphData(): LineData[] {
        return uniqBy(this.graphs.tvl, 'timestamp').map<LineData>(item => ({
            time: (item.timestamp / 1000) as Time,
            value: parseFloat(item.data),
        }))
    }

}
