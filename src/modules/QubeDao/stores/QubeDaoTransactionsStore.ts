import { computed, makeObservable } from 'mobx'

import type {
    QubeDaoPagination,
    QubeDaoTransactionKind,
    QubeDaoTransactionResponse,
    QubeDaoTransactionsOrdering,
} from '@/modules/QubeDao/types'
import { useQubeDaoApi } from '@/modules/QubeDao/hooks/useApi'
import { BaseStore } from '@/stores/BaseStore'
import { QubeDaoStore } from '@/modules/QubeDao/stores/QubeDaoStore'

export type QubeDaoTransactionsStoreData = {
    transactions: QubeDaoTransactionResponse[];
}

export type QubeDaoTransactionsStoreState = {
    isFetching?: boolean;
    kind?: QubeDaoTransactionKind,
    ordering: QubeDaoTransactionsOrdering;
    pagination: QubeDaoPagination;
    transactionTimeGe?: number;
    transactionTimeLe?: number;
}


export class QubeDaoTransactionsStore extends BaseStore<QubeDaoTransactionsStoreData, QubeDaoTransactionsStoreState> {

    protected readonly api = useQubeDaoApi()

    constructor(protected readonly dao: QubeDaoStore) {
        super()

        this.setData('transactions', [])

        this.setState(() => ({
            ordering: {
                column: 'createdAt',
                direction: 'DESC',
            },
            pagination: {
                currentPage: 1,
                limit: 10,
                totalCount: 0,
                totalPages: 0,
            },
        }))

        makeObservable(this, {
            isFetching: computed,
            ordering: computed,
            pagination: computed,
            transactions: computed,
        })
    }

    public async fetch(force?: boolean, silence: boolean = false): Promise<void> {
        if (this.dao.wallet.address === undefined) {
            return
        }

        if (!force && this.isFetching) {
            return
        }

        try {
            this.setState('isFetching', !silence)

            const response = await this.api.transactionsSearch({}, {
                method: 'POST',
            }, {
                kind: this.state.kind,
                limit: this.pagination.limit,
                offset: this.pagination.limit * (this.pagination.currentPage - 1),
                ordering: this.state.ordering,
                transactionTimeGe: this.state.transactionTimeGe,
                transactionTimeLe: this.state.transactionTimeLe,
                userAddress: this.dao.wallet.address,
            })

            this.setData('transactions', Array.isArray(response.transactions) ? response.transactions : [])
            this.setState('pagination', {
                ...this.pagination,
                totalCount: response.totalCount,
                totalPages: Math.ceil(response.totalCount / this.pagination.limit),
            })
        }
        catch (e) {
            //
        }
        finally {
            this.setState('isFetching', false)
        }
    }

    public get transactions(): QubeDaoTransactionsStoreData['transactions'] {
        return this.data.transactions
    }

    public get isFetching(): QubeDaoTransactionsStoreState['isFetching'] {
        return this.state.isFetching
    }

    public get ordering(): QubeDaoTransactionsStoreState['ordering'] {
        return this.state.ordering
    }

    public get pagination(): QubeDaoTransactionsStoreState['pagination'] {
        return this.state.pagination
    }

}
