import { computed, makeObservable } from 'mobx'

import { BaseStore } from '@/stores/BaseStore'
import { useQubeDaoApi } from '@/modules/QubeDao/hooks/useApi'
import { QubeDaoStore } from '@/modules/QubeDao/stores/QubeDaoStore'
import type {
    GaugeInfo,
    QubeDaoPagination,
    QubeDaoWhitelistGaugeResponse,
    QubeDaoWhitelistOrdering,
} from '@/modules/QubeDao/types'

export type QubeDaoCandidatesStoreData = {
    candidates: QubeDaoWhitelistGaugeResponse[];
    gaugesDetails: { [gaugeAddress: string]: Pick<GaugeInfo, 'poolTokens' | 'tvl'> };
}

export type QubeDaoCandidatesStoreState = {
    isFetching?: boolean;
    ordering: QubeDaoWhitelistOrdering;
    pagination: QubeDaoPagination;
    userAddress?: string;
}

export class QubeDaoCandidatesStore extends BaseStore<QubeDaoCandidatesStoreData, QubeDaoCandidatesStoreState> {

    protected readonly api = useQubeDaoApi()

    constructor(protected readonly dao: QubeDaoStore) {
        super()

        this.setData('candidates', [])

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
            candidates: computed,
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

            const response = await this.api.whitelistSearch({}, {
                method: 'POST',
            }, {
                isActive: true,
                limit: this.pagination.limit,
                offset: this.pagination.limit * (this.pagination.currentPage - 1),
                ordering: {
                    column: 'averagePercentage',
                    direction: 'DESC',
                },
            })

            let gaugesDetails: QubeDaoCandidatesStoreData['gaugesDetails'] = {}

            try {
                const batchResponse = await this.api.gaugesBatch({}, { method: 'POST' }, {
                    gauges: response.gauges.map(gauge => gauge.address.toString()),
                })

                gaugesDetails = batchResponse.gauges.reduce<QubeDaoCandidatesStoreData['gaugesDetails']>(
                    (acc, gauge) => {
                        if (acc[gauge.address] === undefined) {
                            acc[gauge.address] = {
                                poolTokens: gauge.poolTokens,
                                tvl: gauge.tvl,
                            }
                        }
                        return acc
                    },
                    {},
                )
            }
            catch (e) {
                //
            }

            this.setData({
                candidates: Array.isArray(response.gauges) ? response.gauges : [],
                gaugesDetails,
            })

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

    public get candidates(): QubeDaoCandidatesStoreData['candidates'] {
        return this.data.candidates
    }

    public get isFetching(): QubeDaoCandidatesStoreState['isFetching'] {
        return this.state.isFetching
    }

    public get ordering(): QubeDaoCandidatesStoreState['ordering'] {
        return this.state.ordering
    }

    public get pagination(): QubeDaoCandidatesStoreState['pagination'] {
        return this.state.pagination
    }

    public gaugeDetails(gauge: string): Pick<GaugeInfo, 'poolTokens' | 'tvl'> | undefined {
        return this.data.gaugesDetails[gauge]
    }

}
