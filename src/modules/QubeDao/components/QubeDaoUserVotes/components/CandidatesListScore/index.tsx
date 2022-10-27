import * as React from 'react'
import BigNumber from 'bignumber.js'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { useQubeDaoVotingStateContext } from '@/modules/QubeDao/providers/QubeDaoVotingStateProvider'
import { formattedAmount, formattedTokenAmount } from '@/utils'


function CandidatesListScoreInternal(): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()
    const votesStore = useQubeDaoVotingStateContext()

    const scoredUserDistributionPrice = new BigNumber(votesStore.scoredUserDistribution)
        .shiftedBy(-daoContext.tokenDecimals)
        .times(daoContext.tokenPrice ?? 0)
        .toFixed()
    const scoredUserFarmSpeedPrice = new BigNumber(votesStore.scoredUserFarmSpeed)
        .times(daoContext.tokenPrice ?? 0)
        .toFixed()

    return (
        <div className="list__row">
            <div className="list__cell list__cell--left" />
            <div className="list__cell list__cell--right">
                {`${formattedTokenAmount(votesStore.scoredUserVotesAmount, daoContext.veDecimals)} ${daoContext.veSymbol}`}
                <div className="text-sm text-muted">
                    {`${formattedAmount(votesStore.scoredUserVotesShare)}%`}
                </div>
            </div>
            <div className="list__cell list__cell--right">
                {`${formattedTokenAmount(votesStore.scoredUserGaugesVotesAmount, daoContext.veDecimals)} ${daoContext.veSymbol}`}
                <div className="text-sm text-muted">
                    {`${formattedAmount(votesStore.scoredUserGaugesVotesShare)}%`}
                </div>
            </div>
            <div className="list__cell list__cell--right">
                {`${formattedTokenAmount(votesStore.scoredUserDistribution, daoContext.tokenDecimals)} ${daoContext.tokenSymbol}`}
                <div className="text-sm text-muted">
                    {`$${formattedAmount(scoredUserDistributionPrice)}`}
                </div>
            </div>
            <div className="list__cell list__cell--right">
                {intl.formatMessage(
                    { id: 'QUBE_DAO_VOTE_STATE_LIST_FUTURE_SPEED_VALUE' },
                    {
                        symbol: daoContext.tokenSymbol,
                        value: formattedAmount(votesStore.scoredUserFarmSpeed, daoContext.tokenDecimals, {
                            precision: 2,
                            roundingMode: BigNumber.ROUND_HALF_UP,
                        }),
                    },
                )}
                <div className="text-sm text-muted">
                    {intl.formatMessage(
                        { id: 'QUBE_DAO_VOTE_STATE_LIST_FUTURE_SPEED_CURRENCY_VALUE' },
                        { value: `$${formattedAmount(scoredUserFarmSpeedPrice)}` },
                    )}
                </div>
            </div>
        </div>
    )
}

export const CandidatesListScore = observer(CandidatesListScoreInternal)
