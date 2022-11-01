import * as React from 'react'
import BigNumber from 'bignumber.js'
import { DateTime } from 'luxon'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'

import { UserVoteCell } from '@/modules/QubeDao/components/QubeDaoEpochs/components/UserVoteCell'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import type { QubeDaoEpochResponse } from '@/modules/QubeDao/types'
import { appRoutes } from '@/routes'
import { formattedTokenAmount } from '@/utils'

type Props = {
    epoch: QubeDaoEpochResponse;
}

export function EpochsListItem({ epoch }: Props): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()

    const startDateTime = DateTime.fromSeconds(epoch.epochStart)
    const endDateTime = DateTime.fromSeconds(epoch.epochEnd)

    return (
        <div className="list__row">
            <div className="list__cell list__cell--left">
                <Link to={appRoutes.daoEpoch.makeUrl({ epochNum: epoch.epochNum.toString() })}>
                    {intl.formatMessage({
                        id: 'QUBE_DAO_EPOCH_SHORT_TITLE',
                    }, { value: epoch.epochNum })}
                </Link>
            </div>
            <Observer>
                {() => {
                    const totalDistribution = new BigNumber(epoch.totalDistribution || 0)
                        .times(daoContext.distributionScheme[0] ?? 1)
                        .div(10000)
                        .toFixed()
                    return (
                        <div className="list__cell list__cell--right">
                            {`${formattedTokenAmount(
                                totalDistribution,
                                daoContext.tokenDecimals,
                            )} ${daoContext.tokenSymbol}`}
                        </div>
                    )
                }}
            </Observer>
            <div className="list__cell list__cell--right">
                {`${formattedTokenAmount(
                    epoch.totalVeAmount,
                    daoContext.veDecimals,
                )} ${daoContext.veSymbol}`}
            </div>
            <UserVoteCell epochNum={epoch.epochNum} />
            <div className="list__cell list__cell--right">
                {`${startDateTime.toFormat('dd.MM.yyyy')} - ${endDateTime.toFormat('dd.MM.yyyy')}`}
            </div>
        </div>
    )
}
