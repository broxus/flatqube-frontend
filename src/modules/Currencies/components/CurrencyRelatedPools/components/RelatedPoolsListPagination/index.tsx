import * as React from 'react'

import { Pagination } from '@/components/common/Pagination'
import { useCurrencyRelatedPoolsStoreContext } from '@/modules/Currencies/providers'

export function RelatedPoolsListPagination(): JSX.Element {
    const relatedPoolsStore = useCurrencyRelatedPoolsStoreContext()

    const onNextPage = async () => {
        relatedPoolsStore.setState('pagination', {
            ...relatedPoolsStore.pagination,
            currentPage: relatedPoolsStore.pagination.currentPage + 1,
        })
        await relatedPoolsStore.fetch(true)
    }

    const onPrevPage = async () => {
        relatedPoolsStore.setState('pagination', {
            ...relatedPoolsStore.pagination,
            currentPage: relatedPoolsStore.pagination.currentPage - 1,
        })
        await relatedPoolsStore.fetch(true)
    }

    const onSubmitPage = async (value: number) => {
        relatedPoolsStore.setState('pagination', {
            ...relatedPoolsStore.pagination,
            currentPage: value,
        })
        await relatedPoolsStore.fetch(true)
    }

    return (
        <Pagination
            {...relatedPoolsStore.pagination}
            onNext={onNextPage}
            onPrev={onPrevPage}
            onSubmit={onSubmitPage}
        />
    )
}
