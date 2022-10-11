import BigNumber from 'bignumber.js'
import * as React from 'react'
import { useIntl } from 'react-intl'

import { formattedAmount } from '@/utils'

type Props = {
    maxValue: string;
    minValue: string;
    value: string;
}

export function QubeDaoShareRate({ maxValue, minValue, value }: Props): JSX.Element {
    const intl = useIntl()

    switch (true) {
        case new BigNumber(value).eq(0):
            return (
                <span className="text-muted">
                    {`${formattedAmount(value)}%`}
                </span>
            )

        case new BigNumber(value).lt(minValue):
            return (
                <span className="text-danger">
                    {intl.formatMessage(
                        { id: 'QUBE_DAO_VOTE_TOO_FEW_VOTES_HINT' },
                        { value: `${formattedAmount(value)}%` },
                    )}
                </span>
            )

        case new BigNumber(value).lt(maxValue):
            return (
                <span className="text-warning">
                    {`${formattedAmount(value)}%`}
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
