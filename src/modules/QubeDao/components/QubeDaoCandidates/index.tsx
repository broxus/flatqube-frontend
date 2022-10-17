import * as React from 'react'
import classNames from 'classnames'
import { reaction } from 'mobx'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { PanelLoader } from '@/components/common/PanelLoader'
import { SectionTitle } from '@/components/common/SectionTitle'
import { CandidatesListEmpty } from '@/modules/QubeDao/components/QubeDaoCandidates/components/CandidatesListEmpty'
import { CandidatesListHeader } from '@/modules/QubeDao/components/QubeDaoCandidates/components/CandidatesListHeader'
import { CandidatesListItem } from '@/modules/QubeDao/components/QubeDaoCandidates/components/CandidatesListItem'
import { CandidatesListPagination } from '@/modules/QubeDao/components/QubeDaoCandidates/components/CandidatesListPagination'
import { CandidatesListPlaceholder } from '@/modules/QubeDao/components/QubeDaoCandidates/components/CandidatesListPlaceholder'
import { useQubeDaoCandidatesStore } from '@/modules/QubeDao/providers/QubeDaoCandidatesStoreProvider'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'

import styles from './index.module.scss'

export function QubeDaoCandidates(): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()
    const candidatesStore = useQubeDaoCandidatesStore()

    React.useEffect(() => reaction(
        () => daoContext.tokensCache.isReady,
        async isTokensCacheReady => {
            if (isTokensCacheReady) {
                await candidatesStore.fetch()
            }
        },
        { delay: 50, fireImmediately: true },
    ), [])

    return (
        <section className="section">
            <header className="section__header">
                <SectionTitle size="small">
                    {intl.formatMessage({ id: 'QUBE_DAO_CANDIDATES_TITLE' })}
                </SectionTitle>
            </header>

            <Observer>
                {() => (
                    <div className="card card--flat card--xsmall">
                        <div className={classNames('list', styles.candidates_list, styles.list)}>
                            {candidatesStore.candidates.length > 0 && (
                                <CandidatesListHeader />
                            )}

                            {(() => {
                                const isFetching = (
                                    candidatesStore.isFetching
                                    || candidatesStore.isFetching === undefined
                                )

                                switch (true) {
                                    case isFetching && candidatesStore.candidates.length === 0:
                                        return <CandidatesListPlaceholder />

                                    case candidatesStore.candidates.length > 0: {
                                        return (
                                            <PanelLoader loading={isFetching}>
                                                {candidatesStore.candidates.map(candidate => (
                                                    <CandidatesListItem key={candidate.address} candidate={candidate} />
                                                ))}
                                            </PanelLoader>
                                        )
                                    }

                                    default:
                                        return <CandidatesListEmpty />
                                }
                            })()}
                        </div>

                        {candidatesStore.pagination && candidatesStore.pagination.totalPages > 1 && (
                            <CandidatesListPagination />
                        )}
                    </div>
                )}
            </Observer>
        </section>
    )
}
