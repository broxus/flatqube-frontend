import { computed, makeObservable } from 'mobx'

import { usePoolsApi } from '@/modules/Pools/hooks/useApi'
import { PoolStore } from '@/modules/Pools/stores/PoolStore'
import type { PoolsPagination, PoolTransactionResponse } from '@/modules/Pools/types'
import { PoolTransactionEventType, PoolTransactionsOrdering } from '@/modules/Pools/types'
import { BaseStore } from '@/stores/BaseStore'

export type PoolTransactionsStoreData = {
    transactions: PoolTransactionResponse[];
}

export type PoolTransactionsStoreState = {
    eventType: PoolTransactionEventType[];
    isFetching?: boolean;
    onlyUserTransactions?: boolean;
    ordering: PoolTransactionsOrdering;
    pagination: PoolsPagination;
    timestampBlockGe?: number;
    timestampBlockLe?: number;
}


export class PoolTransactionsStore extends BaseStore<PoolTransactionsStoreData, PoolTransactionsStoreState> {

    protected readonly api = usePoolsApi()

    constructor(protected readonly pool: PoolStore) {
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
            eventType: computed,
            isDepositEventType: computed,
            isFetching: computed,
            isSwapEventType: computed,
            isWithdrawEventType: computed,
            onlyUserTransactions: computed,
            ordering: computed,
            pagination: computed,
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
                currencyAddresses: this.pool.pool?.meta.currencyAddresses,
                displayTotalCount: this.pagination.currentPage === 1 || this.pagination.totalCount === undefined,
                eventType: this.eventType.length > 0 ? this.eventType : null,
                limit: this.pagination.limit,
                offset: this.pagination.limit * (this.pagination.currentPage - 1),
                ordering: this.state.ordering,
                poolAddress: this.pool.address,
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

    public get transactions(): PoolTransactionsStoreData['transactions'] {
        return this.data.transactions
    }

    public get eventType(): PoolTransactionsStoreState['eventType'] {
        return this.state.eventType
    }

    public get isFetching(): PoolTransactionsStoreState['isFetching'] {
        return this.state.isFetching
    }

    public get onlyUserTransactions(): PoolTransactionsStoreState['onlyUserTransactions'] {
        return this.state.onlyUserTransactions
    }

    public get ordering(): PoolTransactionsStoreState['ordering'] {
        return this.state.ordering
    }

    public get pagination(): PoolTransactionsStoreState['pagination'] {
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
