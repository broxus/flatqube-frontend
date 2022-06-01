import * as React from 'react'

import { FarmingTable } from '@/modules/Farming/components/FarmingTable'
import { usePagination } from '@/hooks/usePagination'
import { PoolContent } from '@/modules/Pools/hooks/usePoolContent'

const PAGE_SIZE = 10

type Props = {
    poolContent: PoolContent
}

export function PoolFarmings({
    poolContent,
}: Props): JSX.Element | null {
    const { farmItems, farmLoading } = poolContent

    const pagination = usePagination()
    const totalPages = farmItems ? Math.ceil(farmItems.length / PAGE_SIZE) : 0
    const startIndex = PAGE_SIZE * (pagination.currentPage - 1)
    const endIndex = startIndex + PAGE_SIZE
    const visibleItems = farmItems ? farmItems.slice(startIndex, endIndex) : []

    return (
        <FarmingTable
            loading={farmLoading}
            items={visibleItems}
            totalPages={totalPages}
            onNext={pagination.onNext}
            onPrev={pagination.onPrev}
            currentPage={pagination.currentPage}
            onSubmit={pagination.onSubmit}
            placeholderCount={1}
        />
    )
}
