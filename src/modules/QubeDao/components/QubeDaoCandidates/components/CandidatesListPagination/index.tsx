import * as React from 'react'

import { Pagination } from '@/components/common/Pagination'
import { useQubeDaoCandidatesStore } from '@/modules/QubeDao/providers/QubeDaoCandidatesStoreProvider'

export function CandidatesListPagination(): JSX.Element {
    const candidatesStore = useQubeDaoCandidatesStore()

    const onNextPage = async () => {
        candidatesStore.setState('pagination', {
            ...candidatesStore.pagination,
            currentPage: candidatesStore.pagination.currentPage + 1,
        })
        await candidatesStore.fetch(true)
    }

    const onPrevPage = async () => {
        candidatesStore.setState('pagination', {
            ...candidatesStore.pagination,
            currentPage: candidatesStore.pagination.currentPage - 1,
        })
        await candidatesStore.fetch(true)
    }

    const onSubmitPage = async (value: number) => {
        candidatesStore.setState('pagination', {
            ...candidatesStore.pagination,
            currentPage: value,
        })
        await candidatesStore.fetch(true)
    }

    return (
        <Pagination
            {...candidatesStore.pagination}
            onNext={onNextPage}
            onPrev={onPrevPage}
            onSubmit={onSubmitPage}
        />
    )
}
