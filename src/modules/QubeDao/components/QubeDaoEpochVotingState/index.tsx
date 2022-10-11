import * as React from 'react'
import classNames from 'classnames'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { SectionTitle } from '@/components/common/SectionTitle'
import { VotingStateListEmpty } from '@/modules/QubeDao/components/QubeDaoEpochVotingState/components/VotingStateListEmpty'
import { VotingStateListHeader } from '@/modules/QubeDao/components/QubeDaoEpochVotingState/components/VotingStateListHeader'
import { VotingStateListItem } from '@/modules/QubeDao/components/QubeDaoEpochVotingState/components/VotingStateListItem'
import { VotingListPlaceholder } from '@/modules/QubeDao/components/QubeDaoEpochVotingState/components/VotingStateListPlaceholder'
import { VotingStateListScore } from '@/modules/QubeDao/components/QubeDaoEpochVotingState/components/VotingStateListScore'
import { useQubeDaoEpochStore } from '@/modules/QubeDao/providers/QubeDaoEpochStoreProvider'
import { useQubeDaoVotingStateStore } from '@/modules/QubeDao/providers/QubeDaoVotingStateProvider'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'

import styles from './index.module.scss'


export function QubeDaoEpochVotingState(): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()
    const epochStore = useQubeDaoEpochStore()
    const votesStore = useQubeDaoVotingStateStore()

    React.useEffect(() => {
        (async () => {
            await votesStore.init()
        })()
        return () => votesStore.dispose()
    }, [epochStore])

    return (
        <section className="section">
            <header className="section__header">
                <div>
                    <SectionTitle size="small">
                        {intl.formatMessage({ id: 'QUBE_DAO_EPOCH_VOTES_TITLE' })}
                    </SectionTitle>
                    <Observer>
                        {() => (epochStore.epochVotesSummary.length > 0 ? (
                            <div style={{ marginTop: 8 }}>
                                {intl.formatMessage({
                                    id: 'QUBE_DAO_EPOCH_VOTES_SUB_TITLE',
                                }, { symbol: daoContext.tokenSymbol })}
                            </div>
                        ) : null)}
                    </Observer>
                </div>
            </header>

            <Observer>
                {() => (
                    <div className="card card--flat card--small">
                        <div className={classNames('list', styles.votes_list, styles.list)}>
                            {epochStore.epochVotesSummary.length > 0 && (
                                <VotingStateListHeader />
                            )}

                            {(() => {
                                const isFetching = (
                                    epochStore.isFetchingVotesSummary
                                    || epochStore.isFetchingVotesSummary === undefined
                                )

                                switch (true) {
                                    case isFetching && epochStore.epochVotesSummary.length === 0:
                                        return <VotingListPlaceholder />

                                    case epochStore.epochVotesSummary.length > 0:
                                        return epochStore.epochVotesSummary.map(summary => (
                                            <VotingStateListItem key={summary.gauge} summary={summary} />
                                        ))

                                    default:
                                        return <VotingStateListEmpty />
                                }
                            })()}

                            {epochStore.epochVotesSummary.length > 0 && (
                                <VotingStateListScore />
                            )}
                        </div>
                    </div>
                )}
            </Observer>
        </section>
    )
}
