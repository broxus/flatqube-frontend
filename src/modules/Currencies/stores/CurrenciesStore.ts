import { computed, makeObservable } from 'mobx'

import { useCurrenciesApi } from '@/modules/Currencies/hooks/useApi'
import { CurrenciesOrdering } from '@/modules/Currencies/types'
import type { CurrenciesPagination, CurrencyResponse } from '@/modules/Currencies/types'
import { BaseStore } from '@/stores/BaseStore'
import type { TokensCacheService } from '@/stores/TokensCacheService'

export type CurrenciesStoreData = {
    currencies: CurrencyResponse[];
    totalCount: number;
}

export type CurrenciesStoreState = {
    isFetching?: boolean;
    ordering: CurrenciesOrdering;
    pagination: CurrenciesPagination;
}

export class CurrenciesStore extends BaseStore<CurrenciesStoreData, CurrenciesStoreState> {

    protected readonly api = useCurrenciesApi()

    constructor(public readonly tokensCache: TokensCacheService) {
        super()

        this.setData(() => ({ currencies: [] }))

        this.setState(() => ({
            ordering: CurrenciesOrdering.TvlDescending,
            pagination: {
                currentPage: 1,
                limit: 10,
                totalCount: 0,
                totalPages: 0,
            },
        }))

        makeObservable(this, {
            currencies: computed,
            isFetching: computed,
        })
    }

    public async fetch(force?: boolean): Promise<void> {
        if (!force && this.isFetching) {
            return
        }

        try {
            this.setState('isFetching', true)

            const response = await this.api.currencies({}, {}, {
                currencyAddresses: this.tokensCache.roots,
                limit: this.pagination.limit,
                offset: this.pagination.limit * (this.pagination.currentPage - 1),
                ordering: this.ordering,
            })

            this.setData('currencies', response.currencies)

            this.setState('pagination', {
                ...this.pagination,
                totalCount: response.totalCount,
                totalPages: Math.ceil(response.totalCount / this.pagination.limit),
            })
        }
        catch (e) {}
        finally {
            this.setState('isFetching', false)
        }
    }

    public get currencies(): CurrenciesStoreData['currencies'] {
        return this.data.currencies/* .filter(
            currency => this.tokensCache.roots.includes(currency.address),
        ) */
    }

    public get isFetching(): CurrenciesStoreState['isFetching'] {
        return this.state.isFetching
    }

    public get ordering(): CurrenciesStoreState['ordering'] {
        return this.state.ordering
    }

    public get pagination(): CurrenciesStoreState['pagination'] {
        return this.state.pagination
    }

}
