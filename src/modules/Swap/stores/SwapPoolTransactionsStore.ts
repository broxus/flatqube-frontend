import {
    action, computed, makeObservable,
} from 'mobx'

import { usePoolsApi } from '@/modules/Pools/hooks/useApi'
import { SwapPoolStore } from '@/modules/Swap/stores/SwapPoolStore'
import type { PoolsPagination, PoolTransactionResponse } from '@/modules/Pools/types'
import { PoolTransactionEventType, PoolTransactionsOrdering } from '@/modules/Pools/types'
import { BaseStore } from '@/stores/BaseStore'

export type SwapPoolTransactionsStoreData = {
    transactions: PoolTransactionResponse[];
    currencyAddresses: string[];
    poolAddress: string;
}

export type SwapPoolTransactionsStoreState = {
    eventType: PoolTransactionEventType[];
    isFetching?: boolean;
    onlyUserTransactions?: boolean;
    ordering: PoolTransactionsOrdering;
    pagination: PoolsPagination;
    timestampBlockGe?: number;
    timestampBlockLe?: number;
}


export class SwapPoolTransactionsStore extends BaseStore<
    SwapPoolTransactionsStoreData, SwapPoolTransactionsStoreState
> {

    protected readonly api = usePoolsApi()

    constructor(protected readonly pool: SwapPoolStore) {
        super()

        this.setData('transactions', [])

        this.setState(() => ({
            eventType: [],
            ordering: PoolTransactionsOrdering.BlockTimeDescending,
            pagination: {
                currentPage: 1,
                limit: 10,
                totalPages: 0,
            },
        }))

        makeObservable(this, {
            currencyAddresses: computed,
            eventType: computed,
            fetch: action.bound,
            isDepositEventType: computed,
            isFetching: computed,
            isSwapEventType: computed,
            isWithdrawEventType: computed,
            onlyUserTransactions: computed,
            ordering: computed,
            pagination: computed,
            poolAddress: computed,
            transactions: computed,
        })
    }

    public async fetch(force?: boolean, silence: boolean = false): Promise<void> {
        if (!force && this.isFetching) {
            return
        }

        try {
            this.setState('isFetching', !silence)

            const response = await this.api.transactions({}, {
                method: 'POST',
            }, {
                currencyAddresses: this.currencyAddresses,
                displayTotalCount: this.pagination.currentPage === 1 || this.pagination.totalCount === undefined,
                eventType: this.eventType.length > 0 ? this.eventType : null,
                limit: this.pagination.limit,
                offset: this.pagination.limit * (this.pagination.currentPage - 1),
                ordering: this.state.ordering,
                poolAddress: this.poolAddress,
                timestampBlockGe: this.state.timestampBlockGe,
                timestampBlockLe: this.state.timestampBlockLe,
                userAddress: this.onlyUserTransactions ? this.pool.wallet.address : undefined,
                whiteListUri: this.pool.tokensCache.tokensList.uri,
            })
            this.setData('transactions', Array.isArray(response.transactions) ? response.transactions : [])

            const totalCount = (this.pagination.currentPage === 1 || this.pagination.totalCount === undefined)
                ? response.totalCount
                : this.pagination.totalCount

            this.setState('pagination', {
                ...this.pagination,
                totalCount,
                totalPages: Math.ceil(totalCount / this.pagination.limit),
            })
        }
        catch (e) {
            //
        }
        finally {
            this.setState('isFetching', false)
        }
    }

    public get transactions(): SwapPoolTransactionsStoreData['transactions'] {
        return this.data.transactions
    }

    public get currencyAddresses(): SwapPoolTransactionsStoreData['currencyAddresses'] {
        return this.data.currencyAddresses
    }

    public get poolAddress(): SwapPoolTransactionsStoreData['poolAddress'] {
        return this.data.poolAddress
    }

    public get eventType(): SwapPoolTransactionsStoreState['eventType'] {
        return this.state.eventType
    }

    public get isFetching(): SwapPoolTransactionsStoreState['isFetching'] {
        return this.state.isFetching
    }

    public get onlyUserTransactions(): SwapPoolTransactionsStoreState['onlyUserTransactions'] {
        return this.state.onlyUserTransactions
    }

    public get ordering(): SwapPoolTransactionsStoreState['ordering'] {
        return this.state.ordering
    }

    public get pagination(): SwapPoolTransactionsStoreState['pagination'] {
        return this.state.pagination
    }

    public get isDepositEventType(): boolean {
        return this.eventType.length === 1 && this.eventType.includes(PoolTransactionEventType.Deposit)
    }

    public get isSwapEventType(): boolean {
        return this.eventType.length === 1 && this.eventType.includes(PoolTransactionEventType.Swap)
    }

    public get isWithdrawEventType(): boolean {
        return this.eventType.length === 1 && this.eventType.includes(PoolTransactionEventType.Withdraw)
    }

}
