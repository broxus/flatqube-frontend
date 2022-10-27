import * as React from 'react'
import { Observer } from 'mobx-react-lite'
import { DateTime, Interval } from 'luxon'

import { Awaiting } from '@/modules/QubeDao/components/QubeDaoLastEpochDetails/components/UserVotePreviewCard/Awaiting'
import { CardPlaceholder } from '@/modules/QubeDao/components/QubeDaoLastEpochDetails/components/UserVotePreviewCard/CardPlaceholder'
import { ConnectWallet } from '@/modules/QubeDao/components/QubeDaoLastEpochDetails/components/UserVotePreviewCard/ConnectWallet'
import { Deposit } from '@/modules/QubeDao/components/QubeDaoLastEpochDetails/components/UserVotePreviewCard/Deposit'
import { NotVoted } from '@/modules/QubeDao/components/QubeDaoLastEpochDetails/components/UserVotePreviewCard/NotVoted'
import { Voted } from '@/modules/QubeDao/components/QubeDaoLastEpochDetails/components/UserVotePreviewCard/Voted'
import { useQubeDaoEpochContext } from '@/modules/QubeDao/providers/QubeDaoEpochStoreProvider'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { isGoodBignumber } from '@/utils'


export function UserVotePreviewCard(): JSX.Element {
    const daoContext = useQubeDaoContext()
    const epochStore = useQubeDaoEpochContext()

    return (
        <Observer>
            {() => {
                const isFetching = (
                    epochStore.isFetchingUserVoteState
                    || epochStore.isFetchingUserVoteState === undefined
                )
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

                const hasDeposit = isGoodBignumber(daoContext.userVeBalance ?? 0)
                const hasVotes = isGoodBignumber(epochStore.userTotalVoteAmount || 0)

                switch (true) {
                    case daoContext.wallet.isReady && isFetching:
                        return <CardPlaceholder />

                    case daoContext.wallet.isReady && isAwaiting:
                        if (hasDeposit) {
                            return <Awaiting />
                        }
                        return <Deposit />

                    case daoContext.wallet.isReady && isVoting:
                        if (hasVotes) {
                            return <Voted />
                        }
                        if (!hasDeposit) {
                            return <Deposit />
                        }
                        return <NotVoted />

                    case daoContext.wallet.isReady && isQueued:
                        if (hasVotes) {
                            return <Voted />
                        }
                        return <NotVoted />

                    default:
                        return <ConnectWallet />
                }
            }}
        </Observer>
    )

}
