import * as React from 'react'
import BigNumber from 'bignumber.js'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { formattedAmount, formattedTokenAmount } from '@/utils'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { useQubeDaoVotingStateStore } from '@/modules/QubeDao/providers/QubeDaoVotingStateProvider'

function VotingStateListScoreInternal(): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()
    const votesStore = useQubeDaoVotingStateStore()

    const scoredGaugesDistributionPrice = new BigNumber(votesStore.scoredGaugesDistribution)
        .shiftedBy(-daoContext.tokenDecimals)
        .times(daoContext.tokenPrice ?? 0)
        .toFixed()
    const scoredGaugesFarmSpeedPrice = new BigNumber(votesStore.scoredGaugesFarmSpeed)
        .times(daoContext.tokenPrice ?? 0)
        .toFixed()

    return (
        <div className="list__row">
            <div className="list__cell list__cell--left" />
            <div className="list__cell list__cell--right">
                {`${formattedTokenAmount(votesStore.scoredGaugesVotesAmount, daoContext.veDecimals)} ${daoContext.veSymbol}`}
                <div className="text-sm text-muted">
                    {`${formattedAmount(votesStore.scoredGaugesVotesShare)}%`}
                </div>
            </div>
            <div className="list__cell list__cell--right">
                {`${formattedTokenAmount(votesStore.scoredGaugesDistribution, daoContext.tokenDecimals)} ${daoContext.tokenSymbol}`}
                <div className="text-sm text-muted">
                    {`$${formattedAmount(scoredGaugesDistributionPrice)}`}
                </div>
            </div>
            <div className="list__cell list__cell--right">
                {intl.formatMessage(
                    { id: 'QUBE_DAO_VOTE_STATE_LIST_FUTURE_SPEED_VALUE' },
                    {
                        symbol: daoContext.tokenSymbol,
                        value: formattedAmount(votesStore.scoredGaugesFarmSpeed, daoContext.tokenDecimals),
                    },
                )}
                <div className="text-sm text-muted">
                    {intl.formatMessage(
                        { id: 'QUBE_DAO_VOTE_STATE_LIST_FUTURE_SPEED_CURRENCY_VALUE' },
                        { value: `$${formattedAmount(scoredGaugesFarmSpeedPrice)}` },
                    )}
                </div>
            </div>
        </div>
    )
}

export const VotingStateListScore = observer(VotingStateListScoreInternal)
