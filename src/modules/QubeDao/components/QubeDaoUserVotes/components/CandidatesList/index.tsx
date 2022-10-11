import * as React from 'react'
import classNames from 'classnames'
import { Observer } from 'mobx-react-lite'

import { CandidatesListEmpty } from '@/modules/QubeDao/components/QubeDaoUserVotes/components/CandidatesListEmpty'
import { CandidatesListItem } from '@/modules/QubeDao/components/QubeDaoUserVotes/components/CandidatesListItem'
import { CandidatesListHeader } from '@/modules/QubeDao/components/QubeDaoUserVotes/components/CandidatesListHeder'
import { VotesListPlaceholder } from '@/modules/QubeDao/components/QubeDaoUserVotes/components/VotesListPlaceholder'
import { CandidatesListScore } from '@/modules/QubeDao/components/QubeDaoUserVotes/components/CandidatesListScore'
import { useQubeDaoVotingStateStore } from '@/modules/QubeDao/providers/QubeDaoVotingStateProvider'

import styles from './index.module.scss'

export function CandidatesList(): JSX.Element {
    const votesStore = useQubeDaoVotingStateStore()

    return (
        <div className="card card--flat card--small">
            <Observer>
                {() => (
                    <div className={classNames('list', styles.candidates_list, styles.list)}>
                        {votesStore.userVotes.length > 0 && (
                            <CandidatesListHeader />
                        )}

                        {(() => {
                            const isFetching = (
                                votesStore.isFetchingUserVotes
                                || votesStore.isFetchingUserVotes === undefined
                            )

                            switch (true) {
                                case isFetching && votesStore.userVotes.length === 0:
                                    return <VotesListPlaceholder />

                                case votesStore.userVotes.length > 0:
                                    return votesStore.userVotes.map(vote => (
                                        <CandidatesListItem key={vote.gauge} vote={vote} />
                                    ))

                                default:
                                    return <CandidatesListEmpty />
                            }
                        })()}

                        {votesStore.userVotes.length > 0 && (
                            <CandidatesListScore />
                        )}
                    </div>
                )}
            </Observer>
        </div>
    )
}
