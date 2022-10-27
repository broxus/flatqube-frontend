import * as React from 'react'

import { Pagination } from '@/components/common/Pagination'
import { useQubeDaoDepositsContext } from '@/modules/QubeDao/providers/QubeDaoDepositsStoreProvider'

export function DepositsListPagination(): JSX.Element {
    const depositsStore = useQubeDaoDepositsContext()

    const onNextPage = async () => {
        depositsStore.setState('pagination', {
            ...depositsStore.pagination,
            currentPage: depositsStore.pagination.currentPage + 1,
        })
        await depositsStore.fetch()
    }

    const onPrevPage = async () => {
        depositsStore.setState('pagination', {
            ...depositsStore.pagination,
            currentPage: depositsStore.pagination.currentPage - 1,
        })
        await depositsStore.fetch()
    }

    const onSubmitPage = async (value: number) => {
        depositsStore.setState('pagination', {
            ...depositsStore.pagination,
            currentPage: value,
        })
        await depositsStore.fetch()
    }

    return (

        <Pagination
            {...depositsStore.pagination}
            onNext={onNextPage}
            onPrev={onPrevPage}
            onSubmit={onSubmitPage}
        />
    )
}
