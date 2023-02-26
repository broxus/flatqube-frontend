import * as React from 'react'

import { Pagination } from '@/components/common/Pagination'
import { usePoolsStoreContext } from '@/modules/Pools/context/PoolsStoreProvider'

export function PoolsListPagination(): JSX.Element {
    const poolsStore = usePoolsStoreContext()

    const onNextPage = async () => {
        poolsStore.setState('pagination', {
            ...poolsStore.pagination,
            currentPage: poolsStore.pagination.currentPage + 1,
        })
        await poolsStore.fetch(true)
    }

    const onPrevPage = async () => {
        poolsStore.setState('pagination', {
            ...poolsStore.pagination,
            currentPage: poolsStore.pagination.currentPage - 1,
        })
        await poolsStore.fetch(true)
    }

    const onSubmitPage = async (value: number) => {
        poolsStore.setState('pagination', {
            ...poolsStore.pagination,
            currentPage: value,
        })
        await poolsStore.fetch(true)
    }

    return (
        <Pagination
            {...poolsStore.pagination}
            onNext={onNextPage}
            onPrev={onPrevPage}
            onSubmit={onSubmitPage}
        />
    )
}
