import * as React from 'react'
import BigNumber from 'bignumber.js'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { QubeDaoCandidateItem, QubeDaoShareRate } from '@/modules/QubeDao/components/QubeDaoCommon'
import { useQubeDaoEpochContext } from '@/modules/QubeDao/providers/QubeDaoEpochStoreProvider'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { useQubeDaoVotingStateContext } from '@/modules/QubeDao/providers/QubeDaoVotingStateProvider'
import type { QubeDaoEpochVoteResponse } from '@/modules/QubeDao/types'
import { formattedAmount, formattedTokenAmount } from '@/utils'

type Props = {
    vote: QubeDaoEpochVoteResponse;
}

function CandidatesListItemInternal({ vote }: Props): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()
    const epochStore = useQubeDaoEpochContext()
    const votesStore = useQubeDaoVotingStateContext()

    const maxVotesRatio = new BigNumber(daoContext.maxVotesRatio || 0).shiftedBy(-2).toFixed()
    const minVotesRatio = new BigNumber(daoContext.minVotesRatio || 0).shiftedBy(-2).toFixed()

    const currentGaugeDistribution = votesStore.currentGaugeDistribution(vote.gauge)
    const currentGaugeFarmingSpeed = votesStore.currentGaugeFarmingSpeed(vote.gauge)
    const currentGaugeTotalAmount = votesStore.currentGaugeTotalAmount(vote.gauge)
    const currentGaugeVoteShare = votesStore.currentGaugeVoteShare(vote.gauge)
    const currentGaugeDistributionPrice = new BigNumber(currentGaugeDistribution)
        .shiftedBy(-daoContext.tokenDecimals)
        .times(daoContext.tokenPrice ?? 0)
        .toFixed()

    return (
        <div className="list__row">
            <div className="list__cell list__cell--left">
                <QubeDaoCandidateItem
                    address={vote.gauge}
                    gaugeDetails={epochStore.gaugeDetails(vote.gauge)}
                />
            </div>
            <div className="list__cell list__cell--right">
                {`${formattedTokenAmount(vote.veAmount || 0, daoContext.veDecimals)} ${daoContext.veSymbol}`}
                <div className="text-muted text-sm">
                    {`${formattedAmount(votesStore.gaugeUserVoteShare(vote.veAmount))}%`}
                </div>
            </div>
            <div className="list__cell list__cell--right">
                {`${formattedTokenAmount(currentGaugeTotalAmount, daoContext.veDecimals)} ${daoContext.veSymbol}`}
                <div className="text-sm">
                    <QubeDaoShareRate
                        maxValue={maxVotesRatio}
                        minValue={minVotesRatio}
                        value={currentGaugeVoteShare}
                    />
                </div>
            </div>
            <div className="list__cell list__cell--right">
                {`${formattedTokenAmount(currentGaugeDistribution, daoContext.tokenDecimals)} ${daoContext.tokenSymbol}`}
                <div className="text-sm text-muted">
                    {`$${formattedAmount(currentGaugeDistributionPrice)}`}
                </div>
            </div>
            <div className="list__cell list__cell--right">
                {intl.formatMessage(
                    { id: 'QUBE_DAO_VOTE_STATE_LIST_FUTURE_SPEED_VALUE' },
                    {
                        symbol: daoContext.tokenSymbol,
                        value: formattedAmount(currentGaugeFarmingSpeed, daoContext.tokenDecimals, {
                            precision: 2,
                            roundingMode: BigNumber.ROUND_HALF_UP,
                        }),
                    },
                )}
            </div>
        </div>
    )
}

export const CandidatesListItem = observer(CandidatesListItemInternal)
