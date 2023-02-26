import * as React from 'react'

import { Pagination } from '@/components/common/Pagination'
import { useCurrenciesStoreContext } from '@/modules/Currencies/providers'

export function CurrenciesListPagination(): JSX.Element {
    const currenciesStore = useCurrenciesStoreContext()

    const onNextPage = async () => {
        currenciesStore.setState('pagination', {
            ...currenciesStore.pagination,
            currentPage: currenciesStore.pagination.currentPage + 1,
        })
        await currenciesStore.fetch(true)
    }

    const onPrevPage = async () => {
        currenciesStore.setState('pagination', {
            ...currenciesStore.pagination,
            currentPage: currenciesStore.pagination.currentPage - 1,
        })
        await currenciesStore.fetch(true)
    }

    const onSubmitPage = async (value: number) => {
        currenciesStore.setState('pagination', {
            ...currenciesStore.pagination,
            currentPage: value,
        })
        await currenciesStore.fetch(true)
    }

    return (
        <Pagination
            {...currenciesStore.pagination}
            onNext={onNextPage}
            onPrev={onPrevPage}
            onSubmit={onSubmitPage}
        />
    )
}
