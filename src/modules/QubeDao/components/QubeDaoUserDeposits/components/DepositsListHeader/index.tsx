import * as React from 'react'
import { useIntl } from 'react-intl'

import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'

export function DepositsListHeader(): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()
    return (
        <div className="list__header">
            <div className="list__cell list__cell--left">
                {intl.formatMessage(
                    { id: 'QUBE_DAO_USER_DEPOSITS_LIST_HEADER_AMOUNT' },
                    { symbol: daoContext.veSymbol },
                )}
            </div>
            <div className="list__cell list__cell--left">
                {intl.formatMessage(
                    { id: 'QUBE_DAO_USER_DEPOSITS_LIST_HEADER_AMOUNT' },
                    { symbol: daoContext.tokenSymbol },
                )}
            </div>
            <div className="list__cell list__cell--right">
                {intl.formatMessage({ id: 'QUBE_DAO_USER_DEPOSITS_LIST_HEADER_STATUS_CELL' })}
            </div>
            <div className="list__cell list__cell--right">
                {intl.formatMessage({ id: 'QUBE_DAO_USER_DEPOSITS_LIST_HEADER_PERIOD_CELL' })}
            </div>
            <div className="list__cell list__cell--right">
                {intl.formatMessage({ id: 'QUBE_DAO_USER_DEPOSITS_LIST_HEADER_ENDS_IN_CELL' })}
            </div>
        </div>
    )
}
