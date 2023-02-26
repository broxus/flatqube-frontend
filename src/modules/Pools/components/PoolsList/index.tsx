import * as React from 'react'
import classNames from 'classnames'
import { reaction } from 'mobx'
import { Observer } from 'mobx-react-lite'
import Media from 'react-media'

import { PanelLoader } from '@/components/common/PanelLoader'
import { PoolsListCard } from '@/modules/Pools/components/PoolsList/components/PoolsListCard'
import { PoolsListHeader } from '@/modules/Pools/components/PoolsList/components/PoolsListHeader'
import { PoolsListPlaceholder } from '@/modules/Pools/components/PoolsList/components/PoolsListPlaceholder'
import { PoolsListItem } from '@/modules/Pools/components/PoolsList/components/PoolsListItem'
import { PoolsListEmpty } from '@/modules/Pools/components/PoolsList/components/PoolsListEmpty'
import { PoolsListPagination } from '@/modules/Pools/components/PoolsList/components/PoolsListPagination'
import { usePoolsStoreContext } from '@/modules/Pools/context'

import styles from './index.module.scss'

type Props = {
    placeholderRowsCount?: number;
}

export function PoolsList({ placeholderRowsCount }: Props): JSX.Element {
    const poolsStore = usePoolsStoreContext()

    React.useEffect(() => reaction(
        () => poolsStore.tokensCache.isReady,
        async isTokensCacheReady => {
            if (isTokensCacheReady) {
                await poolsStore.fetch()
            }
        },
        { delay: 50, fireImmediately: true },
    ), [poolsStore])

    return (
        <Observer>
            {() => (
                <div className="card card--flat card--xsmall">
                    <div className={classNames('list', styles.pools_list, styles.list)}>
                        <Media query={{ minWidth: 640 }}>
                            {matches => (matches && poolsStore.pools.length > 0 ? (
                                <PoolsListHeader />
                            ) : null)}
                        </Media>

                        {(() => {
                            const isFetching = poolsStore.isFetching || poolsStore.isFetching === undefined

                            switch (true) {
                                case isFetching && poolsStore.pools.length === 0:
                                    return <PoolsListPlaceholder rowsCount={placeholderRowsCount} />

                                case poolsStore.pools.length > 0: {
                                    return (
                                        <PanelLoader loading={isFetching}>
                                            {poolsStore.pools.map((pool, idx) => (
                                                <Media key={pool.meta.poolAddress} query={{ minWidth: 640 }}>
                                                    {matches => (matches ? (
                                                        <PoolsListItem
                                                            key={pool.meta.poolAddress}
                                                            idx={(
                                                                poolsStore.pagination.limit
                                                                * (poolsStore.pagination.currentPage - 1)
                                                            ) + idx + 1}
                                                            pool={pool}
                                                        />
                                                    ) : (
                                                        <PoolsListCard pool={pool} />
                                                    ))}
                                                </Media>
                                            ))}
                                        </PanelLoader>
                                    )
                                }

                                default:
                                    return <PoolsListEmpty />
                            }
                        })()}
                    </div>

                    {poolsStore.pagination && poolsStore.pagination.totalPages > 1 && (
                        <PoolsListPagination />
                    )}
                </div>
            )}
        </Observer>
    )
}
