import * as React from 'react'
import { useIntl } from 'react-intl'

import { FarmingPoolsItemResponse } from '@/modules/Farming/types'
import { FarmingTableListItem } from '@/modules/Farming/components/FarmingTable/List/item'
import { FarmingTableListPlaceholder } from '@/modules/Farming/components/FarmingTable/List/placeholder'
import { PanelLoader } from '@/components/common/PanelLoader'

import './index.scss'

type Props = {
    data: FarmingPoolsItemResponse[];
    loading?: boolean;
}

export function FarmingTableList({
    data,
    loading,
}: Props): JSX.Element {
    const intl = useIntl()

    return (
        <div className="farming-table-list">
            {loading && data.length === 0 ? (
                <>
                    <FarmingTableListPlaceholder />
                    <FarmingTableListPlaceholder />
                    <FarmingTableListPlaceholder />
                </>
            ) : (
                <>
                    {!loading && data.length === 0 ? (
                        <div className="farming-table__message">
                            {intl.formatMessage({ id: 'FARMING_TABLE_NOT_FOUND' })}
                        </div>
                    ) : (
                        <PanelLoader loading={loading && data.length > 0}>
                            {data.map(item => (
                                <FarmingTableListItem
                                    key={item.pool_address}
                                    item={item}
                                />
                            ))}
                        </PanelLoader>
                    )}
                </>
            )}
        </div>
    )
}
