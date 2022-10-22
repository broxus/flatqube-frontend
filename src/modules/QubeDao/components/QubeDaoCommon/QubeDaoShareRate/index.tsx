import BigNumber from 'bignumber.js'
import * as React from 'react'
import { useIntl } from 'react-intl'

import { votesColors } from '@/modules/QubeDao/constants'
import { formattedAmount } from '@/utils'

type Props = {
    maxValue: string;
    minValue: string;
    onlyValues?: boolean;
    value: string;
}

export function QubeDaoShareRate({ maxValue, minValue, onlyValues, value }: Props): JSX.Element {
    const intl = useIntl()

    switch (true) {
        case new BigNumber(value || 0).isZero():
            return (
                <span className="text-muted">
                    {`${formattedAmount(value)}%`}
                </span>
            )

        case new BigNumber(value).lt(minValue):
            return (
                <span className="text-danger">
                    {onlyValues ? `${formattedAmount(value)}%` : intl.formatMessage(
                        { id: 'QUBE_DAO_VOTE_TOO_FEW_VOTES_HINT' },
                        { value: `${formattedAmount(value)}%` },
                    )}
                </span>
            )

        case new BigNumber(value).lt(maxValue):
            return (
                <span style={{ color: votesColors[Math.ceil(parseInt(value, 10) || 1) - 1] }}>
                    {`${formattedAmount(value)}%`}
                </span>
            )

        case new BigNumber(value).gte(maxValue):
            return (
                <span className="text-success">
                    {onlyValues ? `${formattedAmount(value)}%` : intl.formatMessage(
                        { id: 'QUBE_DAO_VOTE_MAX_VOTES_REACHED_HINT' },
                        { value: `${formattedAmount(value)}%` },
                    )}
                </span>
            )

        default:
            return (
                <span className="text-success">
                    {`${formattedAmount(value)}%`}
                </span>
            )
    }
}
