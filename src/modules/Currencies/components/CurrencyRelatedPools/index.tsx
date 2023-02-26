import * as React from 'react'
import classNames from 'classnames'
import { Observer } from 'mobx-react-lite'
import { reaction } from 'mobx'
import Media from 'react-media'

import { PanelLoader } from '@/components/common/PanelLoader'
import { RelatedPoolsListCard } from '@/modules/Currencies/components/CurrencyRelatedPools/components/RelatedPoolsListCard'
import { RelatedPoolsListEmpty } from '@/modules/Currencies/components/CurrencyRelatedPools/components/RelatedPoolsListEmpty'
import { RelatedPoolsListHeader } from '@/modules/Currencies/components/CurrencyRelatedPools/components/RelatedPoolsListHeader'
import { RelatedPoolsListItem } from '@/modules/Currencies/components/CurrencyRelatedPools/components/RelatedPoolsListItem'
import { RelatedPoolsListPagination } from '@/modules/Currencies/components/CurrencyRelatedPools/components/RelatedPoolsListPagination'
import { RelatedPoolsListPlaceholder } from '@/modules/Currencies/components/CurrencyRelatedPools/components/RelatedPoolsListPlaceholder'
import { useCurrencyRelatedPoolsStoreContext, useCurrencyStoreContext } from '@/modules/Currencies/providers'

import styles from './index.module.scss'

export function CurrencyRelatedPools(): JSX.Element {
    const currencyStore = useCurrencyStoreContext()
    const relatedPoolsStore = useCurrencyRelatedPoolsStoreContext()

    React.useEffect(() => reaction(() => currencyStore.tokensCache.isReady, async isReady => {
        if (isReady) {
            await relatedPoolsStore.fetch()
        }
    }, { fireImmediately: true }), [])

    return (
        <Observer>
            {() => (
                <div className="card card--flat card--xsmall">
                    <div className={classNames('list', styles.related_pools_list, styles.list)}>
                        <Media query={{ minWidth: 640 }}>
                            {matches => (matches && relatedPoolsStore.pools.length > 0 ? (
                                <RelatedPoolsListHeader />
                            ) : null)}
                        </Media>

                        {(() => {
                            const isFetching = (
                                relatedPoolsStore.isFetching === undefined
                                || relatedPoolsStore.isFetching
                            )

                            switch (true) {
                                case isFetching && relatedPoolsStore.pools.length === 0:
                                    return <RelatedPoolsListPlaceholder />

                                case relatedPoolsStore.pools.length > 0: {
                                    return (
                                        <PanelLoader loading={isFetching}>
                                            {relatedPoolsStore.pools.map((pool, idx) => (
                                                <Media key={pool.meta.poolAddress} query={{ minWidth: 640 }}>
                                                    {matches => (matches ? (
                                                        <RelatedPoolsListItem
                                                            key={pool.meta.poolAddress}
                                                            idx={(
                                                                relatedPoolsStore.pagination.limit
                                                                * (relatedPoolsStore.pagination.currentPage - 1)
                                                            ) + idx + 1}
                                                            pool={pool}
                                                        />
                                                    ) : (
                                                        <RelatedPoolsListCard pool={pool} />
                                                    ))}
                                                </Media>
                                            ))}
                                        </PanelLoader>
                                    )
                                }

                                default:
                                    return <RelatedPoolsListEmpty />
                            }
                        })()}
                    </div>
                    {relatedPoolsStore.pagination && relatedPoolsStore.pagination.totalPages > 1 && (
                        <RelatedPoolsListPagination />
                    )}
                </div>
            )}
        </Observer>
    )
}
