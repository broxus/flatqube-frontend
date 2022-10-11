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
    const { farming, farmingLoading } = poolContent

    const pagination = usePagination()
    const totalPages = farming ? Math.ceil(farming.length / PAGE_SIZE) : 0
    const startIndex = PAGE_SIZE * (pagination.currentPage - 1)
    const endIndex = startIndex + PAGE_SIZE
    const visibleItems = farming ? farming.slice(startIndex, endIndex) : []

    return (
        <FarmingTable
            data={visibleItems.map(item => item.info)}
            entitledRewards={visibleItems.map(item => item.balance.reward.map(i => i.entitled))}
            vestedRewards={visibleItems.map(item => item.balance.reward.map(i => i.vested))}
            totalPages={totalPages}
            currentPage={pagination.currentPage}
            loading={farmingLoading}
            onNext={pagination.onNext}
            onPrev={pagination.onPrev}
            onSubmit={pagination.onSubmit}
            placeholderCount={1}
        />
    )
}
