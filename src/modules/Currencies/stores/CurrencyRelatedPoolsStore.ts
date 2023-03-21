import { computed, makeObservable } from 'mobx'

import { USE_WHITE_LISTS } from '@/config'
import { useCurrenciesApi } from '@/modules/Currencies/hooks/useApi'
import { CurrencyStore } from '@/modules/Currencies/stores/CurrencyStore'
import type { PoolResponse, PoolsPagination } from '@/modules/Pools/types'
import { PoolsOrdering } from '@/modules/Pools/types'
import { BaseStore } from '@/stores/BaseStore'
import { error } from '@/utils'

export type CurrencyRelatedPoolsStoreData = {
    pools: PoolResponse[];
}

export type CurrencyRelatedPoolsStoreState = {
    isFetching?: boolean;
    ordering: PoolsOrdering;
    pagination: PoolsPagination;
}

export class CurrencyRelatedPoolsStore extends BaseStore<
    CurrencyRelatedPoolsStoreData,
    CurrencyRelatedPoolsStoreState
> {

    protected readonly api = useCurrenciesApi()

    constructor(protected readonly currency: CurrencyStore) {
        super()

        this.setData(() => ({ pools: [] }))

        this.setState(() => ({
            ordering: PoolsOrdering.TvlDescending,
            pagination: {
                currentPage: 1,
                limit: 10,
                totalCount: 0,
                totalPages: 0,
            },
        }))

        makeObservable(this, {
            isFetching: computed,
            pools: computed,
        })
    }

    public async fetch(force?: boolean): Promise<void> {
        if (this.currency.address === undefined) {
            return
        }

        if (!force && this.isFetching) {
            return
        }

        try {
            this.setState('isFetching', true)

            const response = await this.api.relatedPools({}, {
                method: 'POST',
            }, {
                currencyAddress: this.currency.address,
                limit: this.pagination.limit,
                offset: this.pagination.limit * (this.pagination.currentPage - 1),
                ordering: this.ordering,
                whiteListUri: USE_WHITE_LISTS ? this.currency.tokensCache.tokensList.uri : undefined,
            })

            this.setData('pools', response.pools)

            this.setState('pagination', {
                ...this.pagination,
                totalCount: response.totalCount,
                totalPages: Math.ceil(response.totalCount / this.pagination.limit),
            })
        }
        catch (e) {
            error('Related pools fetching error', e)
        }
        finally {
            this.setState('isFetching', false)
        }
    }

    public get pools(): CurrencyRelatedPoolsStoreData['pools'] {
        return this.data.pools
    }

    public get isFetching(): CurrencyRelatedPoolsStoreState['isFetching'] {
        return this.state.isFetching
    }

    public get ordering(): CurrencyRelatedPoolsStoreState['ordering'] {
        return this.state.ordering
    }

    public get pagination(): CurrencyRelatedPoolsStoreState['pagination'] {
        return this.state.pagination
    }

}
