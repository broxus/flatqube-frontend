import * as React from 'react'
import BigNumber from 'bignumber.js'
import { useIntl } from 'react-intl'

import { useQubeDaoVotingStateStore } from '@/modules/QubeDao/providers/QubeDaoVotingStateProvider'
import { useQubeDaoEpochStore } from '@/modules/QubeDao/providers/QubeDaoEpochStoreProvider'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { formattedAmount, formattedTokenAmount } from '@/utils'

export function VotingStateListTreasury(): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()
    const epochStore = useQubeDaoEpochStore()
    const votesStore = useQubeDaoVotingStateStore()

    const treasuryAmount = new BigNumber(epochStore.normalizedTotalDistribution)
        .minus(votesStore.scoredGaugesDistribution)
        .toFixed()
    const treasuryAmountPrice = new BigNumber(treasuryAmount)
        .shiftedBy(-daoContext.tokenDecimals)
        .times(daoContext.tokenPrice ?? 0)
        .toFixed()

    return (
        <div className="list__row">
            <div className="list__cell list__cell--left">
                {intl.formatMessage({ id: 'QUBE_DAO_VOTE_STATE_LIST_TREASURY_AMOUNT' })}
            </div>
            <div className="list__cell list__cell--right" />
            <div className="list__cell list__cell--right" />
            <div className="list__cell list__cell--right" />
            <div className="list__cell list__cell--right">
                {`${formattedTokenAmount(treasuryAmount, daoContext.tokenDecimals)} ${daoContext.tokenSymbol}`}
                <div className="text-sm text-muted">
                    {`$${formattedAmount(treasuryAmountPrice)}`}
                </div>
            </div>
            <div className="list__cell list__cell--right" />
        </div>
    )
}
