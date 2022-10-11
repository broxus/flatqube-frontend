import * as React from 'react'
import classNames from 'classnames'
import { Observer } from 'mobx-react-lite'

import { CandidatesFormListActions } from '@/modules/QubeDao/components/QubeDaoUserVotes/components/CandidatesFormListActions'
import { CandidatesFormListHeader } from '@/modules/QubeDao/components/QubeDaoUserVotes/components/CandidatesFormListHeader'
import { CandidatesFormListItem } from '@/modules/QubeDao/components/QubeDaoUserVotes/components/CandidatesFormListItem'
import { CandidatesFormListScore } from '@/modules/QubeDao/components/QubeDaoUserVotes/components/CandidatesFormListScore'
import { useQubeDaoVotingStateStore } from '@/modules/QubeDao/providers/QubeDaoVotingStateProvider'

import styles from './index.module.scss'

export function CandidatesFormList(): JSX.Element {
    const votesStore = useQubeDaoVotingStateStore()

    return (
        <div className="card card--flat card--small">
            <div className={classNames('list', styles.vote_form_list, styles.list)}>
                <CandidatesFormListHeader />

                <Observer>
                    {() => (
                        <>
                            {votesStore.candidates.map((candidate, idx) => (
                                <CandidatesFormListItem
                                    key={candidate.key}
                                    candidate={candidate}
                                    idx={idx + 1}
                                />
                            ))}
                        </>
                    )}
                </Observer>

                <CandidatesFormListScore />
            </div>

            <CandidatesFormListActions />
        </div>
    )
}
