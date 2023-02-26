import * as React from 'react'

import { Pagination } from '@/components/common/Pagination'
import { useCurrencyTransactionsStoreContext } from '@/modules/Currencies/providers'

export function TransactionsListPagination(): JSX.Element {
    const transactionsStore = useCurrencyTransactionsStoreContext()

    const onNextPage = async () => {
        transactionsStore.setState('pagination', {
            ...transactionsStore.pagination,
            currentPage: transactionsStore.pagination.currentPage + 1,
        })
        await transactionsStore.fetch(true)
    }

    const onPrevPage = async () => {
        transactionsStore.setState('pagination', {
            ...transactionsStore.pagination,
            currentPage: transactionsStore.pagination.currentPage - 1,
        })
        await transactionsStore.fetch(true)
    }

    const onSubmitPage = async (value: number) => {
        transactionsStore.setState('pagination', {
            ...transactionsStore.pagination,
            currentPage: value,
        })
        await transactionsStore.fetch(true)
    }

    return (
        <Pagination
            {...transactionsStore.pagination}
            onNext={onNextPage}
            onPrev={onPrevPage}
            onSubmit={onSubmitPage}
        />
    )
}
