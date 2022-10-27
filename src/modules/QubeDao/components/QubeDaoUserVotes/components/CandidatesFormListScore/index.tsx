import * as React from 'react'
import { observer } from 'mobx-react-lite'

import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { useQubeDaoVotingStateContext } from '@/modules/QubeDao/providers/QubeDaoVotingStateProvider'
import { formattedTokenAmount } from '@/utils'

function CandidatesFormListScoreInternal(): JSX.Element {
    const daoContext = useQubeDaoContext()
    const votesStore = useQubeDaoVotingStateContext()

    return (
        <div className="list__row visible@s">
            <div className="list__cell list__cell--left" />
            <div className="list__cell list__cell--left">
                {`${formattedTokenAmount(
                    votesStore.scoredUserCandidatesAmount,
                    daoContext.veDecimals,
                )} ${daoContext.veSymbol}`}
                <div className="text-sm text-muted">
                    {`of ${formattedTokenAmount(
                        daoContext.userVeBalance,
                        daoContext.veDecimals,
                    )} ${daoContext.veSymbol}`}
                </div>
            </div>
            <div className="list__cell list__cell--left">
                {`${votesStore.scoredUserCandidatesShare}%`}
                <div className="text-sm text-muted">
                    of 100%
                </div>
            </div>
            <div className="list__cell list__cell--right visible@m" />
            <div className="list__cell list__cell--right visible@m" />
            <div className="list__cell list__cell--center visible@m" />
        </div>
    )
}

export const CandidatesFormListScore = observer(CandidatesFormListScoreInternal)
