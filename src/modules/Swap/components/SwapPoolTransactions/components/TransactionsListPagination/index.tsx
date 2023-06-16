import * as React from 'react'

import { Pagination } from '@/components/common/Pagination'
import { useSwapPoolTransactionsStoreContext } from '@/modules/Swap/context/SwapPoolTransactionsStoreProvider'

export function SwapTransactionsListPagination(): JSX.Element {
    const swapTransactionsStore = useSwapPoolTransactionsStoreContext()

    const onNextPage = async () => {
        swapTransactionsStore.setState('pagination', {
            ...swapTransactionsStore.pagination,
            currentPage: swapTransactionsStore.pagination.currentPage + 1,
        })
        await swapTransactionsStore.fetch(true)
    }

    const onPrevPage = async () => {
        swapTransactionsStore.setState('pagination', {
            ...swapTransactionsStore.pagination,
            currentPage: swapTransactionsStore.pagination.currentPage - 1,
        })
        await swapTransactionsStore.fetch(true)
    }

    const onSubmitPage = async (value: number) => {
        swapTransactionsStore.setState('pagination', {
            ...swapTransactionsStore.pagination,
            currentPage: value,
        })
        await swapTransactionsStore.fetch(true)
    }

    return (
        <Pagination
            {...swapTransactionsStore.pagination}
            onNext={onNextPage}
            onPrev={onPrevPage}
            onSubmit={onSubmitPage}
        />
    )
}
