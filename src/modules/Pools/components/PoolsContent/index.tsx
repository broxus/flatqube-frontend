import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { useFavoritePairs } from '@/stores/FavoritePairs'
import { usePoolsContent } from '@/modules/Pools/hooks/usePoolsContent'
import { Pagination } from '@/components/common/Pagination'
import { PanelLoader } from '@/components/common/PanelLoader'
import { Item } from '@/modules/Pools/components/PoolsContent/item'
import { Placeholder } from '@/modules/Pools/components/PoolsContent/Placeholder'
import { EmptyMessage } from '@/modules/Pools/components/PoolsContent/EmptyMessage'

import './index.scss'

export const PoolsContent = observer((): JSX.Element => {
    const intl = useIntl()
    const favoritePairs = useFavoritePairs()
    const placeholderCount = favoritePairs.data.length < 10
        ? favoritePairs.data.length
        : 10

    const {
        loading,
        totalPages,
        items,
        currentPage,
        onSubmit,
        onNext,
        onPrev,
    } = usePoolsContent()

    if (favoritePairs.data.length === 0 || (!loading && items.length === 0)) {
        return <EmptyMessage />
    }

    return (
        <div className="card card--small card--flat">
            <div className="list pools-list">
                <div className="list__header">
                    <div className="list__cell list__cell--left">
                        {intl.formatMessage({ id: 'POOLS_LIST_TABLE_PAIR' })}
                    </div>
                    <div className="list__cell list__cell--right">
                        {intl.formatMessage({ id: 'POOLS_LIST_TABLE_LP_TOKENS' })}
                    </div>
                    <div className="list__cell list__cell--right">
                        {intl.formatMessage({ id: 'POOLS_LIST_TABLE_LEFT_TOKEN' })}
                    </div>
                    <div className="list__cell list__cell--right">
                        {intl.formatMessage({ id: 'POOLS_LIST_TABLE_RIGHT_TOKEN' })}
                    </div>
                </div>

                {loading && items.length === 0 ? (
                    [...Array(placeholderCount).keys()].map(item => (
                        <Placeholder key={item} />
                    ))
                ) : (
                    <PanelLoader loading={loading && items.length > 0}>
                        {items.map(item => (
                            <Item key={item.pair.pairLabel} {...item} />
                        ))}
                    </PanelLoader>
                )}
            </div>

            <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onNext={onNext}
                onPrev={onPrev}
                onSubmit={onSubmit}
            />
        </div>
    )
})
