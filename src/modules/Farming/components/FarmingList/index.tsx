import * as React from 'react'
import { observer } from 'mobx-react-lite'

import { SectionTitle } from '@/components/common/SectionTitle'
import { FarmingTable } from '@/modules/Farming/components/FarmingTable'
import { FarmingFilters } from '@/modules/Farming/components/FarmingFilters'
import { FarmingPoolFilter, FarmingPoolsItemResponse } from '@/modules/Farming/types'
import { debounce } from '@/utils'

type Props = {
    title: string;
    lowBalanceEnabled: boolean;
    loading: boolean;
    data: FarmingPoolsItemResponse[];
    vestedRewards: (string[] | undefined)[];
    entitledRewards: (string[] | undefined)[];
    totalPages: number;
    currentPage: number;
    queryParamPrefix?: string;
    rewardsLoading: (boolean | undefined)[];
    placeholderCount?: number;
    onChangeQuery: (value: string) => void;
    onChangeFilter: (filter: FarmingPoolFilter) => void;
    onNextPage: () => void;
    onPrevPage: () => void;
    onSubmitPage: (page: number) => void;
}

export function FarmingListInner({
    title,
    lowBalanceEnabled,
    loading,
    data,
    vestedRewards,
    entitledRewards,
    totalPages,
    currentPage,
    queryParamPrefix,
    rewardsLoading,
    placeholderCount,
    onChangeQuery,
    onChangeFilter,
    onNextPage,
    onPrevPage,
    onSubmitPage,
}: Props): JSX.Element {
    return (
        <>
            <div className="farming-list-header">
                <SectionTitle size="small">{title}</SectionTitle>
                <FarmingFilters
                    queryParamPrefix={queryParamPrefix}
                    lowBalanceEnabled={lowBalanceEnabled}
                    onQuery={debounce(onChangeQuery, 300)}
                    onSubmit={onChangeFilter}
                />
            </div>

            <FarmingTable
                data={data}
                entitledRewards={entitledRewards}
                vestedRewards={vestedRewards}
                rewardsLoading={rewardsLoading}
                placeholderCount={placeholderCount}
                totalPages={totalPages}
                currentPage={currentPage}
                loading={loading}
                onNext={onNextPage}
                onPrev={onPrevPage}
                onSubmit={onSubmitPage}
            />
        </>
    )
}

export const FarmingList = observer(FarmingListInner)
