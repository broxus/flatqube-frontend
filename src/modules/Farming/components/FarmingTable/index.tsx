import * as React from 'react'

import { Pagination } from '@/components/common/Pagination'
import { FarmingTable as FarmingTableBase } from '@/modules/Farming/components/FarmingTable/Table'
import { FarmingPoolsItemResponse } from '@/modules/Farming/types'

export type FarmingTableProps = {
    data: FarmingPoolsItemResponse[];
    vestedRewards: (string[] | undefined)[];
    entitledRewards: (string[] | undefined)[];
    rewardsLoading?: (boolean | undefined)[];
    loading?: boolean;
    totalPages: number;
    currentPage?: number;
    placeholderCount?: number;
    onNext?: () => void;
    onPrev?: () => void;
    onSubmit?: (page: number) => void;
}

export function FarmingTable({
    data,
    entitledRewards,
    vestedRewards,
    rewardsLoading,
    loading,
    totalPages,
    currentPage,
    placeholderCount = 10,
    onNext,
    onPrev,
    onSubmit,
}: FarmingTableProps): JSX.Element {
    return (
        <div className="card card--small card--flat">
            <FarmingTableBase
                data={data}
                entitledRewards={entitledRewards}
                rewardsLoading={rewardsLoading}
                vestedRewards={vestedRewards}
                loading={loading}
                placeholderCount={placeholderCount}
            />

            <Pagination
                currentPage={currentPage}
                onNext={onNext}
                onPrev={onPrev}
                onSubmit={onSubmit}
                totalPages={totalPages}
            />
        </div>
    )
}
