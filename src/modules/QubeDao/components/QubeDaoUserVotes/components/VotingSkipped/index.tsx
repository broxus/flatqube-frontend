import * as React from 'react'
import { useIntl } from 'react-intl'

export function VotingSkipped(): JSX.Element {
    const intl = useIntl()

    return (
        <div className="card card--flat card--small text-center">
            <h3 className="text-heading">
                {intl.formatMessage({ id: 'QUBE_DAO_VOTE_SKIPPED_TITLE' })}
            </h3>
            <p>{intl.formatMessage({ id: 'QUBE_DAO_VOTE_SKIPPED_NOTE' })}</p>
        </div>
    )
}
