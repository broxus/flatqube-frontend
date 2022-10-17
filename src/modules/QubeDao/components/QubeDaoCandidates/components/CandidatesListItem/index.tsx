import * as React from 'react'
import BigNumber from 'bignumber.js'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { QubeDaoCandidateItem, QubeDaoShareRate } from '@/modules/QubeDao/components/QubeDaoCommon'
import { useQubeDaoCandidatesStore } from '@/modules/QubeDao/providers/QubeDaoCandidatesStoreProvider'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import type { QubeDaoWhitelistGaugeResponse } from '@/modules/QubeDao/types'
import { formattedAmount, formattedTokenAmount } from '@/utils'

type Props = {
    candidate: QubeDaoWhitelistGaugeResponse;
}

function CandidatesListItemInternal({ candidate }: Props): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()
    const candidatesStore = useQubeDaoCandidatesStore()

    const gaugeDetails = candidatesStore.gaugeDetails(candidate.address)

    const maxVotesRatio = new BigNumber(daoContext.maxVotesRatio || 0).shiftedBy(-2).toFixed()
    const minVotesRatio = new BigNumber(daoContext.minVotesRatio || 0).shiftedBy(-2).toFixed()

    return (
        <div className="list__row">
            <div className="list__cell list__cell--left">
                <QubeDaoCandidateItem
                    address={candidate.address}
                    gaugeDetails={gaugeDetails?.poolTokens}
                />
            </div>
            <div className="list__cell list__cell--left">
                {candidate.isActive ? (
                    <div className="label label--success">
                        {intl.formatMessage(
                            { id: 'QUBE_DAO_CANDIDATES_LIST_STATUS_SUCCESS_CELL' },
                        )}
                    </div>
                ) : '—'}
            </div>
            <div className="list__cell list__cell--right">
                {`$${formattedAmount(gaugeDetails?.tvl)}`}
            </div>
            <div className="list__cell list__cell--right">
                {`${formattedTokenAmount(
                    new BigNumber(candidate.averageAmount || 0).dp(0, BigNumber.ROUND_UP).toFixed(),
                    daoContext.veDecimals,
                )} ${daoContext.veSymbol}`}
                <div className="text-sm">
                    <QubeDaoShareRate
                        maxValue={maxVotesRatio}
                        minValue={minVotesRatio}
                        onlyValues
                        value={candidate.averagePercentage}
                    />
                </div>
            </div>
            <div className="list__cell list__cell--right">
                {`${formattedTokenAmount(
                    new BigNumber(candidate.lastEpochAmount || 0).dp(0, BigNumber.ROUND_UP).toFixed(),
                    daoContext.veDecimals,
                )} ${daoContext.veSymbol}`}
                <div className="text-sm">
                    <QubeDaoShareRate
                        maxValue={maxVotesRatio}
                        minValue={minVotesRatio}
                        onlyValues
                        value={candidate.lastEpochPercentage}
                    />
                </div>
            </div>
            <div className="list__cell list__cell--right">
                {candidate.activeEpochs ?? '—'}
            </div>
        </div>
    )
}

export const CandidatesListItem = observer(CandidatesListItemInternal)
