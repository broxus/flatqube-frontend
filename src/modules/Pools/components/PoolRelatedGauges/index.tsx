import * as React from 'react'
import classNames from 'classnames'
import { Observer } from 'mobx-react-lite'
import { reaction } from 'mobx'

import { PanelLoader } from '@/components/common/PanelLoader'
import { RelatedGaugesListEmpty } from '@/modules/Pools/components/PoolRelatedGauges/components/RelatedGaugesListEmpty'
import { RelatedGaugesListHeader } from '@/modules/Pools/components/PoolRelatedGauges/components/RelatedGaugesListHeader'
import { RelatedGaugesListItem } from '@/modules/Pools/components/PoolRelatedGauges/components/RelatedGaugesListItem'
import { RelatedGaugesListPlaceholder } from '@/modules/Pools/components/PoolRelatedGauges/components/RelatedGaugesListPlaceholder'
import { usePoolRelatedGaugesStoreContext } from '@/modules/Pools/context/PoolRelatedGaugesStoreProvider'
import { usePoolStoreContext } from '@/modules/Pools/context/PoolStoreProvider'

import styles from './index.module.scss'

export function PoolRelatedGauges(): JSX.Element {
    const poolStore = usePoolStoreContext()
    const relatedGaugesStore = usePoolRelatedGaugesStoreContext()

    React.useEffect(() => reaction(() => poolStore.tokensCache.isReady, async isReady => {
        if (isReady) {
            await relatedGaugesStore.init()
        }
    }, { fireImmediately: true }), [])

    return (
        <Observer>
            {() => (
                <div className="card card--flat card--xsmall">
                    <div className={classNames('list', styles.related_gauges_list, styles.list)}>
                        {relatedGaugesStore.gauges.length > 0 && (
                            <RelatedGaugesListHeader />
                        )}

                        {(() => {
                            const isFetching = (
                                relatedGaugesStore.isFetching === undefined
                                || relatedGaugesStore.isFetching
                            )

                            switch (true) {
                                case isFetching && relatedGaugesStore.gauges.length === 0:
                                    return <RelatedGaugesListPlaceholder />

                                case relatedGaugesStore.gauges.length > 0: {
                                    return (
                                        <PanelLoader loading={isFetching}>
                                            {relatedGaugesStore.gauges.map(gauge => (
                                                <RelatedGaugesListItem key={gauge.address} gauge={gauge} />
                                            ))}
                                        </PanelLoader>
                                    )
                                }

                                default:
                                    return <RelatedGaugesListEmpty />
                            }
                        })()}
                    </div>
                </div>
            )}
        </Observer>
    )
}
