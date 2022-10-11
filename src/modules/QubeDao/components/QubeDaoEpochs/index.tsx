import * as React from 'react'
import classNames from 'classnames'
import { reaction } from 'mobx'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { PanelLoader } from '@/components/common/PanelLoader'
import { SectionTitle } from '@/components/common/SectionTitle'
import { EpochsListEmpty } from '@/modules/QubeDao/components/QubeDaoEpochs/components/EpochsListEmpty'
import { EpochsListHeader } from '@/modules/QubeDao/components/QubeDaoEpochs/components/EpochsListHeader'
import { EpochsListItem } from '@/modules/QubeDao/components/QubeDaoEpochs/components/EpochsListItem'
import { EpochsListPagination } from '@/modules/QubeDao/components/QubeDaoEpochs/components/EpochsListPagination'
import { EpochListPlaceholder } from '@/modules/QubeDao/components/QubeDaoEpochs/components/EpochsListPlaceholder'
import { useQubeDaoEpochsStore } from '@/modules/QubeDao/providers/QubeDaoEpochsStoreProvider'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'

import styles from './index.module.scss'

export function QubeDaoEpochs(): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()
    const epochsStore = useQubeDaoEpochsStore()

    React.useEffect(() => reaction(
        () => daoContext.tokensCache.isReady,
        async isTokensCacheReady => {
            if (isTokensCacheReady) {
                await epochsStore.fetch()
            }
        },
        { delay: 50, fireImmediately: true },
    ), [])

    return (
        <section className="section">
            <header className="section__header">
                <SectionTitle size="small">
                    {intl.formatMessage({ id: 'QUBE_DAO_PREVIOUS_EPOCHS_TITLE' })}
                </SectionTitle>
            </header>

            <Observer>
                {() => (
                    <div className="card card--flat card--xsmall">
                        <div className={classNames('list', styles.epochs_list, styles.list)}>
                            {epochsStore.epochs.length > 0 && (
                                <EpochsListHeader />
                            )}

                            {(() => {
                                const isFetching = epochsStore.isFetching || epochsStore.isFetching === undefined

                                switch (true) {
                                    case isFetching && epochsStore.epochs.length === 0:
                                        return <EpochListPlaceholder />

                                    case epochsStore.epochs.length > 0: {
                                        return (
                                            <PanelLoader loading={isFetching}>
                                                {epochsStore.epochs.map(epoch => (
                                                    <EpochsListItem key={epoch.transactionTime} epoch={epoch} />
                                                ))}
                                            </PanelLoader>
                                        )
                                    }

                                    default:
                                        return <EpochsListEmpty />
                                }
                            })()}
                        </div>

                        {epochsStore.pagination && epochsStore.pagination.totalPages > 1 && (
                            <EpochsListPagination />
                        )}
                    </div>
                )}
            </Observer>
        </section>
    )
}
