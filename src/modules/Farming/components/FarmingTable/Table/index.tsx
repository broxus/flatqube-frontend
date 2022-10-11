import * as React from 'react'
import { useIntl } from 'react-intl'

import { PanelLoader } from '@/components/common/PanelLoader'
import { FarmingTableItem } from '@/modules/Farming/components/FarmingTable/Table/item'
import { Placeholder } from '@/modules/Farming/components/FarmingTable/Table/placeholder'
import { FarmingPoolsItemResponse } from '@/modules/Farming/types'

import './index.scss'

type Props = {
    data: FarmingPoolsItemResponse[];
    vestedRewards: (string[] | undefined)[];
    entitledRewards: (string[] | undefined)[];
    rewardsLoading?: (boolean | undefined)[];
    placeholderCount?: number;
    loading?: boolean;
}

export function FarmingTable({
    data,
    entitledRewards,
    rewardsLoading,
    vestedRewards,
    placeholderCount = 10,
    loading,
}: Props): JSX.Element {
    const intl = useIntl()

    return (
        <div className="list farming-table">
            <div className="list__header">
                <div className="list__cell list__cell--left">
                    {intl.formatMessage({ id: 'FARMING_TABLE_FARMING_POOL' })}
                </div>
                <div className="list__cell list__cell--left">
                    {intl.formatMessage({ id: 'FARMING_TABLE_REWARD' })}
                </div>
                <div className="list__cell list__cell--right">
                    {intl.formatMessage({ id: 'FARMING_TABLE_TVL' })}
                </div>
                <div className="list__cell list__cell--right">
                    {intl.formatMessage({ id: 'FARMING_TABLE_APR' })}
                </div>
                <div className="list__cell list__cell--right">
                    {intl.formatMessage({ id: 'FARMING_TABLE_SHARE' })}
                </div>
                <div className="list__cell list__cell--right">
                    {intl.formatMessage({ id: 'FARMING_TABLE_YOUR_REWARD' })}
                </div>
                <div className="list__cell list__cell--right">
                    {intl.formatMessage({ id: 'FARMING_TABLE_ENTITLED_REWARD' })}
                </div>
            </div>

            {loading && data.length === 0 ? (
                [...Array(placeholderCount).keys()].map(item => (
                    <Placeholder key={item} />
                ))
            ) : (
                // eslint-disable-next-line react/jsx-no-useless-fragment
                <>
                    {!loading && data.length === 0 ? (
                        <div className="farming-table__message">
                            {intl.formatMessage({ id: 'FARMING_TABLE_NOT_FOUND' })}
                        </div>
                    ) : (
                        <PanelLoader loading={loading && data.length > 0}>
                            {data.map((item, index) => (
                                <FarmingTableItem
                                    key={item.pool_address}
                                    item={item}
                                    entitledRewards={entitledRewards[index]}
                                    vestedRewards={vestedRewards[index]}
                                    rewardsLoading={rewardsLoading?.[index]}
                                />
                            ))}
                        </PanelLoader>
                    )}
                </>
            )}
        </div>
    )
}
