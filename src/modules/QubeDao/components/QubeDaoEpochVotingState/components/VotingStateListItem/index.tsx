import * as React from 'react'
import BigNumber from 'bignumber.js'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { QubeDaoCandidateItem, QubeDaoShareRate } from '@/modules/QubeDao/components/QubeDaoCommon'
import { useQubeDaoEpochStore } from '@/modules/QubeDao/providers/QubeDaoEpochStoreProvider'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { useQubeDaoVotingStateStore } from '@/modules/QubeDao/providers/QubeDaoVotingStateProvider'
import type { QubeDaoEpochVotesSumResponse } from '@/modules/QubeDao/types'
import { formattedAmount, formattedTokenAmount, isGoodBignumber } from '@/utils'
import { RateChange } from '@/components/common/RateChange'

type Props = {
    summary: QubeDaoEpochVotesSumResponse;
}

function VotingStateListItemInternal({ summary }: Props): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()
    const epochStore = useQubeDaoEpochStore()
    const votesStore = useQubeDaoVotingStateStore()

    const maxVotesRatio = new BigNumber(daoContext.maxVotesRatio || 0).shiftedBy(-2).toFixed()
    const minVotesRatio = new BigNumber(daoContext.minVotesRatio || 0).shiftedBy(-2).toFixed()

    const currentGaugeDistribution = votesStore.currentGaugeDistribution(summary.gauge)
    const currentGaugeFarmingSpeed = votesStore.currentGaugeFarmingSpeed(summary.gauge)
    const currentGaugeTotalAmount = votesStore.currentGaugeTotalAmount(summary.gauge)
    const currentGaugeVoteShare = votesStore.currentGaugeVoteShare(summary.gauge)
    const currentGaugeDistributionPrice = new BigNumber(currentGaugeDistribution)
        .shiftedBy(-daoContext.tokenDecimals)
        .times(daoContext.tokenPrice ?? 0)
        .toFixed()
    const normalizedVoteAmount = votesStore.currentGaugeNormalizedAmount(summary.gauge)
    const normalizedVoteShare = votesStore.currentGaugeNormalizedVoteShare(summary.gauge)
    const userVote = votesStore.userVotes.find(
        vote => summary.gauge.toLowerCase() === vote.gauge.toLowerCase(),
    )?.veAmount
    const farmingSpeedRateChange = votesStore.currentGaugeFarmingSpeedRateChange(summary.gauge)

    return (
        <div className="list__row">
            <div className="list__cell list__cell--left">
                <QubeDaoCandidateItem
                    address={summary.gauge}
                    gaugeDetails={epochStore.gaugeDetails(summary.gauge)}
                />
            </div>
            <div className="list__cell list__cell--right">
                {`${formattedTokenAmount(userVote, daoContext.veDecimals)} ${daoContext.veSymbol}`}
                <div className="text-muted text-sm">
                    {`${formattedAmount(votesStore.gaugeUserVoteShare(userVote ?? '0'))}%`}
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
                {`${formattedTokenAmount(normalizedVoteAmount || 0, daoContext.veDecimals)} ${daoContext.veSymbol}`}
                <div className="text-sm">
                    <QubeDaoShareRate
                        maxValue={maxVotesRatio}
                        minValue={minVotesRatio}
                        value={normalizedVoteShare}
                    />
                </div>
            </div>
            <div className="list__cell list__cell--right">
                {`${formattedTokenAmount(currentGaugeDistribution, daoContext.tokenDecimals)} ${daoContext.tokenSymbol}`}
                <div className="text-sm text-muted">
                    {`$${formattedTokenAmount(currentGaugeDistributionPrice)}`}
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
                {isGoodBignumber(currentGaugeFarmingSpeed) && (
                    <div>
                        <RateChange size="sm" value={formattedAmount(farmingSpeedRateChange)} />
                    </div>
                )}
            </div>
        </div>
    )
}

export const VotingStateListItem = observer(VotingStateListItemInternal)
