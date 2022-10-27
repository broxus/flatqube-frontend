import * as React from 'react'
import { DateTime, Interval } from 'luxon'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import classNames from 'classnames'

import { SectionTitle } from '@/components/common/SectionTitle'
import { AwaitingBanner } from '@/modules/QubeDao/components/QubeDaoUserVotes/components/AwaitingBanner'
import { CandidatesList } from '@/modules/QubeDao/components/QubeDaoUserVotes/components/CandidatesList'
import { CandidatesFormList } from '@/modules/QubeDao/components/QubeDaoUserVotes/components/CandidatesFormList'
import { DepositBanner } from '@/modules/QubeDao/components/QubeDaoUserVotes/components/DepositBanner'
import { VotesListPlaceholder } from '@/modules/QubeDao/components/QubeDaoUserVotes/components/VotesListPlaceholder'
import { VotingSkipped } from '@/modules/QubeDao/components/QubeDaoUserVotes/components/VotingSkipped'
import { useQubeDaoEpochContext } from '@/modules/QubeDao/providers/QubeDaoEpochStoreProvider'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { WalletMiddleware } from '@/modules/WalletMiddleware'
import { isGoodBignumber } from '@/utils'

import styles from './index.module.scss'

export function QubeDaoUserVotes(): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()
    const epochStore = useQubeDaoEpochContext()

    return (
        <section className="section">
            <header className="section__header">
                <SectionTitle size="small">
                    {intl.formatMessage({ id: 'QUBE_DAO_USER_VOTES_TITLE' })}
                </SectionTitle>
            </header>

            <WalletMiddleware
                message={intl.formatMessage(
                    { id: 'QUBE_DAO_USER_VOTES_WALLET_MIDDLEWARE_MESSAGE' },
                    { veSymbol: daoContext.veSymbol },
                )}
            >
                <Observer>
                    {() => {
                        if ((
                            epochStore.isFetchingEpoch
                            || epochStore.isFetchingEpoch === undefined
                            || epochStore.isFetchingUserVoteState
                            || epochStore.isFetchingUserVoteState === undefined
                            || daoContext.isSyncingBalances
                            || daoContext.isSyncingBalances === undefined
                            || daoContext.isSyncingTokenBalance
                            || daoContext.isSyncingTokenBalance === undefined
                        ) && !daoContext.isVotingEpoch) {
                            return (
                                <div className="card card--flat card--small">
                                    <div className={classNames('list', styles.votes_list, styles.list)}>
                                        <VotesListPlaceholder />
                                    </div>
                                </div>
                            )
                        }

                        const isAwaiting = Interval.fromDateTimes(
                            DateTime.fromSeconds(epochStore.epochStart ?? 0).toUTC(),
                            DateTime.fromSeconds(epochStore.voteStart ?? 0).toUTC(),
                        ).contains(DateTime.utc())
                        const isVoting = Interval.fromDateTimes(
                            DateTime.fromSeconds(epochStore.voteStart ?? 0).toUTC(),
                            DateTime.fromSeconds(epochStore.voteEnd ?? 0).toUTC(),
                        ).contains(DateTime.utc())
                        const isQueued = Interval.fromDateTimes(
                            DateTime.fromSeconds(epochStore.voteEnd ?? 0).toUTC(),
                            DateTime.fromSeconds(epochStore.epochEnd ?? 0).toUTC(),
                        ).contains(DateTime.utc())
                        const isFinished = DateTime.local().toSeconds() > (epochStore.epochEnd ?? 0)

                        const hasDeposit = isGoodBignumber(daoContext.userVeBalance ?? 0)
                        const hasVotes = isGoodBignumber(epochStore.userTotalVoteAmount || 0)

                        switch (true) {
                            case isAwaiting:
                                if (hasDeposit) {
                                    return <AwaitingBanner />
                                }
                                return <DepositBanner />

                            case isVoting:
                                if (!hasVotes && !hasDeposit) {
                                    return <DepositBanner />
                                }
                                if (!hasVotes) {
                                    return <CandidatesFormList />
                                }
                                return <CandidatesList />

                            case (isQueued || isFinished):
                                if (hasVotes) {
                                    return <CandidatesList />
                                }
                                if (epochStore.voteAvailable) {
                                    if (!hasDeposit) {
                                        return <DepositBanner />
                                    }
                                    return <CandidatesFormList />
                                }
                                return <VotingSkipped />

                            default:
                                return <AwaitingBanner />
                        }
                    }}
                </Observer>
            </WalletMiddleware>
        </section>
    )
}
