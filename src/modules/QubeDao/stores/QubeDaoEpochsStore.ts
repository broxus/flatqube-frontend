import { computed, makeObservable } from 'mobx'

import type {
    QubeDaoEpochResponse,
    QubeDaoEpochsOrdering,
    QubeDaoPagination,
} from '@/modules/QubeDao/types'
import { useQubeDaoApi } from '@/modules/QubeDao/hooks/useApi'
import { BaseStore } from '@/stores/BaseStore'
import { QubeDaoStore } from '@/modules/QubeDao/stores/QubeDaoStore'
import { isGoodBignumber } from '@/utils'

export type QubeDaoEpochsStoreData = {
    epochs: QubeDaoEpochResponse[];
}

export type QubeDaoEpochsStoreState = {
    isFetching?: boolean;
    ordering: QubeDaoEpochsOrdering;
    pagination: QubeDaoPagination;
    epochStartGe?: number;
    epochStartLe?: number;
    userAddress?: string;
}

export class QubeDaoEpochsStore extends BaseStore<QubeDaoEpochsStoreData, QubeDaoEpochsStoreState> {

    protected readonly api = useQubeDaoApi()

    constructor(protected readonly dao: QubeDaoStore) {
        super()

        this.setData('epochs', [])

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
            epochs: computed,
            isFetching: computed,
            ordering: computed,
            pagination: computed,
        })
    }

    public async fetch(force?: boolean): Promise<void> {
        if (!force && this.isFetching) {
            return
        }

        try {
            this.setState('isFetching', true)

            const lastEpoch = await this.api.epochsLast({}, { method: 'GET' })

            this.setState('epochStartLe', lastEpoch.epochStart - 1)

            const response = await this.api.epochsSearch({}, {
                method: 'POST',
            }, {
                epochStartGe: this.state.epochStartGe,
                epochStartLe: this.state.epochStartLe,
                limit: this.pagination.limit,
                offset: this.pagination.limit * (this.pagination.currentPage - 1),
                ordering: {
                    column: 'createdAt',
                    direction: 'DESC',
                },
            })

            const { distributionSchedule = [] } = await this.dao.veContract
                .methods.distributionSchedule({})
                .call({ cachedState: this.dao.veContractCachedState })

            this.setData('epochs', Array.isArray(response.epochs) ? response.epochs.map(epoch => ({
                ...epoch,
                totalDistribution: !isGoodBignumber(epoch.totalDistribution)
                    ? distributionSchedule[epoch.epochNum - 1]
                    : epoch.totalDistribution,
            })) : [])

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

    public get epochs(): QubeDaoEpochsStoreData['epochs'] {
        return this.data.epochs
    }

    public get isFetching(): QubeDaoEpochsStoreState['isFetching'] {
        return this.state.isFetching
    }

    public get ordering(): QubeDaoEpochsStoreState['ordering'] {
        return this.state.ordering
    }

    public get pagination(): QubeDaoEpochsStoreState['pagination'] {
        return this.state.pagination
    }

}
