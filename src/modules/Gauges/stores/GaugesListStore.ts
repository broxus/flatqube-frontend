import {
    comparer,
    IReactionDisposer, makeAutoObservable, reaction, runInAction,
} from 'mobx'
import BigNumber from 'bignumber.js'

import { GaugeItem } from '@/modules/Gauges/api/models'
import { error } from '@/utils'
import { gaugesHandler } from '@/modules/Gauges/utils'
import { TokenListURI, USE_WHITE_LISTS } from '@/config'
import { GaugesListDataStore } from '@/modules/Gauges/stores/GaugesListDataStore'
import { getImportedTokens } from '@/stores/TokensCacheService'
import { GaugesFilters } from '@/modules/Gauges/types'
import { FavoritePairs } from '@/stores/FavoritePairs'

type State = {
    total?: number;
    offset: number;
    limit: number;
    list?: GaugeItem[];
    isLoading?: boolean;
    isLoaded?: boolean;
}

const initialState: State = {
    limit: 10,
    offset: 0,
}

export class GaugesListStore {

    protected state = initialState

    protected filters: GaugesFilters = {}

    protected reactions?: IReactionDisposer[]

    constructor(
        protected gaugesData: GaugesListDataStore,
        protected favorites?: FavoritePairs,
    ) {
        makeAutoObservable(this, {}, {
            autoBind: true,
        })
    }

    public init(): void {
        if (!this.reactions) {
            this.reactions = [
                reaction(
                    () => [
                        this.favorites ? this.favorites.addresses : undefined,
                        this.state.offset,
                        this.state.limit,
                        this.filters,
                    ],
                    () => this.fetch(),
                    {
                        delay: 50,
                        equals: comparer.structural,
                        fireImmediately: true,
                    },
                ),
            ]
        }
    }

    public dispose(): void {
        if (this.reactions) {
            this.reactions.forEach(item => item())
            this.reactions = undefined
        }

        this.state = initialState
    }

    public async fetch(): Promise<void> {
        let total: number,
            list: GaugeItem[]

        if (this.favorites && this.favorites.addresses.length === 0) {
            return
        }

        runInAction(() => {
            this.state.isLoading = true
        })

        try {
            const response = await gaugesHandler({}, {}, {
                additionalTokenRoots: getImportedTokens(),
                limit: this.state.limit,
                maxApr: this.filters.aprMaxFrom || this.filters.aprMaxTo ? {
                    from: this.filters.aprMaxFrom
                        ? new BigNumber(this.filters.aprMaxFrom).dividedBy(100).toFixed()
                        : undefined,
                    to: this.filters.aprMaxTo
                        ? new BigNumber(this.filters.aprMaxTo).dividedBy(100).toFixed()
                        : undefined,
                } : undefined,
                minApr: this.filters.aprMinFrom || this.filters.aprMinTo ? {
                    from: this.filters.aprMinFrom
                        ? new BigNumber(this.filters.aprMinFrom).dividedBy(100).toFixed()
                        : undefined,
                    to: this.filters.aprMinTo
                        ? new BigNumber(this.filters.aprMinTo).dividedBy(100).toFixed()
                        : undefined,
                } : undefined,
                offset: this.state.offset,
                showLowBalance: this.filters.isLowBalance ?? false,
                starredGauges: this.favorites ? this.favorites.addresses : undefined,
                tvl: this.filters.tvlFrom || this.filters.tvlTo ? {
                    from: this.filters.tvlFrom,
                    to: this.filters.tvlTo,
                } : undefined,
                whitelistUri: USE_WHITE_LISTS ? TokenListURI : undefined,
            })

            response.gauges.forEach(gauge => {
                this.gaugesData.sync(gauge.address)
            })

            total = response.total
            list = response.gauges
        }
        catch (e) {
            error('ListStore.fetch', e)
        }

        runInAction(() => {
            this.state.total = total
            this.state.list = list
            this.state.isLoading = false
            this.state.isLoaded = true
        })
    }

    public nextPage(): void {
        this.state.offset += this.state.limit
    }

    public prevPage(): void {
        this.state.offset -= this.state.limit
    }

    public setPage(value: number): void {
        this.state.offset = (value - 1) * this.state.limit
    }

    public async setFilters(value: GaugesFilters): Promise<void> {
        this.filters = value
    }

    public get list(): GaugeItem[] {
        return this.state.list ?? []
    }

    public get limit(): number {
        return this.state.limit
    }

    public get offset(): number {
        return this.state.offset
    }

    public get total(): number {
        return this.state.total ?? 0
    }

    public get isLoading(): boolean {
        return !!this.state.isLoading
    }

    public get isLoaded(): boolean {
        return !!this.state.isLoaded
    }

}
