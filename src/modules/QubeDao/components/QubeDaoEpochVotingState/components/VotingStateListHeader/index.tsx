import * as React from 'react'
import { useIntl } from 'react-intl'

export function VotingStateListHeader(): JSX.Element {
    const intl = useIntl()

    return (
        <div className="list__header">
            <div className="list__cell list__cell--left">
                {intl.formatMessage({ id: 'QUBE_DAO_VOTE_STATE_LIST_CANDIDATE_CELL' })}
            </div>
            <div className="list__cell list__cell--right">
                {intl.formatMessage({ id: 'QUBE_DAO_VOTE_STATE_LIST_USER_VOTE_CELL' })}
            </div>
            <div className="list__cell list__cell--right">
                {intl.formatMessage({ id: 'QUBE_DAO_VOTE_STATE_LIST_ELECTORAL_CELL' })}
            </div>
            <div className="list__cell list__cell--right">
                {intl.formatMessage({ id: 'QUBE_DAO_VOTE_STATE_LIST_NORMALIZED_CELL' })}
            </div>
            <div className="list__cell list__cell--right">
                {intl.formatMessage({ id: 'QUBE_DAO_VOTE_STATE_LIST_DISTRIBUTION_CELL' })}
            </div>
            <div className="list__cell list__cell--right">
                {intl.formatMessage({ id: 'QUBE_DAO_VOTE_STATE_LIST_FUTURE_SPEED_CELL' })}
            </div>
        </div>
    )
}
