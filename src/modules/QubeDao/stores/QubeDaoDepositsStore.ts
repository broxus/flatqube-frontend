import { computed, makeObservable } from 'mobx'

import type { QubeDaoDepositResponse, QubeDaoDepositsOrdering, QubeDaoPagination } from '@/modules/QubeDao/types'
import { useQubeDaoApi } from '@/modules/QubeDao/hooks/useApi'
import { QubeDaoStore } from '@/modules/QubeDao/stores/QubeDaoStore'
import { BaseStore } from '@/stores/BaseStore'

export type QubeDaoDepositsStoreData = {
    deposits: QubeDaoDepositResponse[];
}

export type QubeDaoDepositsStoreState = {
    isFetching: boolean;
    ordering: QubeDaoDepositsOrdering;
    pagination: QubeDaoPagination;
}

export class QubeDaoDepositsStore extends BaseStore<QubeDaoDepositsStoreData, QubeDaoDepositsStoreState> {

    protected readonly api = useQubeDaoApi()

    constructor(protected readonly dao: QubeDaoStore) {
        super()

        this.setData('deposits', [])

        this.setState(() => ({
            isFetching: true,
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
            deposits: computed,
            isFetching: computed,
            ordering: computed,
            pagination: computed,
        })
    }

    public async fetch(force?: boolean, silence: boolean = false): Promise<void> {
        if (this.dao.wallet.address === undefined || (!force && this.isFetching)) {
            return
        }

        try {
            this.setState('isFetching', !silence)

            const response = await this.api.depositsSearch({}, {
                method: 'POST',
            }, {
                limit: this.pagination.limit,
                offset: this.pagination.limit * (this.pagination.currentPage - 1),
                ordering: {
                    column: 'createdAt',
                    direction: 'DESC',
                },
                user: this.dao.wallet.address,
            })

            this.setData('deposits', Array.isArray(response.deposits) ? response.deposits : [])
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

    public get deposits(): QubeDaoDepositsStoreData['deposits'] {
        return this.data.deposits
    }

    public get isFetching(): QubeDaoDepositsStoreState['isFetching'] {
        return this.state.isFetching
    }

    public get ordering(): QubeDaoDepositsStoreState['ordering'] {
        return this.state.ordering
    }

    public get pagination(): QubeDaoDepositsStoreState['pagination'] {
        return this.state.pagination
    }

}
