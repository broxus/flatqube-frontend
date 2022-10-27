import * as React from 'react'
import BigNumber from 'bignumber.js'
import { useIntl } from 'react-intl'

import { useQubeDaoVotingStateContext } from '@/modules/QubeDao/providers/QubeDaoVotingStateProvider'
import { useQubeDaoEpochContext } from '@/modules/QubeDao/providers/QubeDaoEpochStoreProvider'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { formattedAmount, formattedTokenAmount } from '@/utils'

export function VotingStateListTreasury(): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()
    const epochStore = useQubeDaoEpochContext()
    const votesStore = useQubeDaoVotingStateContext()

    const treasuryAmount = new BigNumber(epochStore.normalizedTotalDistribution)
        .minus(votesStore.scoredGaugesDistribution)
        .toFixed()
    const treasuryAmountPrice = new BigNumber(treasuryAmount)
        .shiftedBy(-daoContext.tokenDecimals)
        .times(daoContext.tokenPrice ?? 0)
        .toFixed()
    const treasuryVotes = new BigNumber(votesStore.scoredGaugesVotesAmount)
        .minus(votesStore.scoredGaugesNormalizedVotesAmount)
        .toFixed()
    const treasuryVotesShare = new BigNumber(votesStore.scoredGaugesVotesShare)
        .minus(votesStore.scoredGaugesNormalizedVotesShare)
        .toFixed()

    return (
        <div className="list__row">
            <div className="list__cell list__cell--left">
                {intl.formatMessage({ id: 'QUBE_DAO_VOTE_STATE_LIST_TREASURY_AMOUNT' })}
            </div>
            <div className="list__cell list__cell--right">
                &mdash;
            </div>
            <div className="list__cell list__cell--right">
                &mdash;
            </div>
            <div className="list__cell list__cell--right">
                {`${formattedTokenAmount(treasuryVotes, daoContext.veDecimals)} ${daoContext.veSymbol}`}
                <div className="text-sm text-muted">
                    {`${formattedAmount(treasuryVotesShare)}%`}
                </div>
            </div>
            <div className="list__cell list__cell--right">
                {`${formattedTokenAmount(treasuryAmount, daoContext.tokenDecimals)} ${daoContext.tokenSymbol}`}
                <div className="text-sm text-muted">
                    {`$${formattedAmount(treasuryAmountPrice)}`}
                </div>
            </div>
            <div className="list__cell list__cell--right">
                &mdash;
            </div>
        </div>
    )
}
