import * as React from 'react'

import { Pagination } from '@/components/common/Pagination'
import { useQubeDaoEpochsStore } from '@/modules/QubeDao/providers/QubeDaoEpochsStoreProvider'

export function EpochsListPagination(): JSX.Element {
    const epochsStore = useQubeDaoEpochsStore()

    const onNextPage = async () => {
        epochsStore.setState('pagination', {
            ...epochsStore.pagination,
            currentPage: epochsStore.pagination.currentPage + 1,
        })
        await epochsStore.fetch(true)
    }

    const onPrevPage = async () => {
        epochsStore.setState('pagination', {
            ...epochsStore.pagination,
            currentPage: epochsStore.pagination.currentPage - 1,
        })
        await epochsStore.fetch(true)
    }

    const onSubmitPage = async (value: number) => {
        epochsStore.setState('pagination', {
            ...epochsStore.pagination,
            currentPage: value,
        })
        await epochsStore.fetch(true)
    }

    return (
        <Pagination
            {...epochsStore.pagination}
            onNext={onNextPage}
            onPrev={onPrevPage}
            onSubmit={onSubmitPage}
        />
    )
}
