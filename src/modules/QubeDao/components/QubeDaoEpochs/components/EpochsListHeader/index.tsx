import * as React from 'react'
import { useIntl } from 'react-intl'

import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'

export function EpochsListHeader(): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()

    return (
        <div className="list__header">
            <div className="list__cell list__cell--left">
                {intl.formatMessage({ id: 'QUBE_DAO_EPOCHS_LIST_HEADER_EPOCH_CELL' })}
            </div>
            <div className="list__cell list__cell--right">
                {intl.formatMessage(
                    { id: 'QUBE_DAO_EPOCHS_LIST_HEADER_DISTRIBUTION_CELL' },
                    { symbol: daoContext.tokenSymbol },
                )}
            </div>
            <div className="list__cell list__cell--right">
                {intl.formatMessage(
                    { id: 'QUBE_DAO_EPOCHS_LIST_HEADER_TOTAL_VOTES_CELL' },
                    { symbol: daoContext.veSymbol },
                )}
            </div>
            <div className="list__cell list__cell--right">
                {intl.formatMessage(
                    { id: 'QUBE_DAO_EPOCHS_LIST_HEADER_USER_VOTES_CELL' },
                    { symbol: daoContext.veSymbol },
                )}
            </div>
            <div className="list__cell list__cell--right">
                {intl.formatMessage({
                    id: 'QUBE_DAO_EPOCHS_LIST_HEADER_PERIOD_CELL',
                })}
            </div>
        </div>
    )
}
