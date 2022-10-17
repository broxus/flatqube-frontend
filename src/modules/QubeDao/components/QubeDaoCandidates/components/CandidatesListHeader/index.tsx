import * as React from 'react'
import { useIntl } from 'react-intl'

export function CandidatesListHeader(): JSX.Element {
    const intl = useIntl()

    return (
        <div className="list__header">
            <div className="list__cell list__cell--left">
                {intl.formatMessage({ id: 'QUBE_DAO_CANDIDATES_LIST_HEADER_CANDIDATE_CELL' })}
            </div>
            <div className="list__cell list__cell--left">
                {intl.formatMessage({ id: 'QUBE_DAO_CANDIDATES_LIST_HEADER_STATUS_CELL' })}
            </div>
            <div className="list__cell list__cell--right">
                {intl.formatMessage({ id: 'QUBE_DAO_CANDIDATES_LIST_HEADER_TVL_CELL' })}
            </div>
            <div className="list__cell list__cell--right">
                {intl.formatMessage({ id: 'QUBE_DAO_CANDIDATES_LIST_HEADER_AVERAGE_VOTING_RATE_CELL' })}
            </div>
            <div className="list__cell list__cell--right">
                {intl.formatMessage({ id: 'QUBE_DAO_CANDIDATES_LIST_HEADER_LAST_EPOCH_VOTING_RATE_CELL' })}
            </div>
            <div className="list__cell list__cell--right">
                {intl.formatMessage({ id: 'QUBE_DAO_CANDIDATES_LIST_HEADER_ACTIVE_EPOCHS_CELL' })}
            </div>
        </div>
    )
}
