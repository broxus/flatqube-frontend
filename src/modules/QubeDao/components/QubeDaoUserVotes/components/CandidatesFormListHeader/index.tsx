import * as React from 'react'
import { useIntl } from 'react-intl'

import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'

export function CandidatesFormListHeader(): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()

    return (
        <div className="list__header visible@s">
            <div className="list__cell list__cell--left">
                {intl.formatMessage({ id: 'QUBE_DAO_VOTE_FORM_CANDIDATE_CELL' })}
            </div>
            <div className="list__cell list__cell--left">
                {intl.formatMessage(
                    { id: 'QUBE_DAO_VOTE_FORM_USER_VOTE_CELL' },
                    { symbol: daoContext.veSymbol },
                )}
            </div>
            <div className="list__cell list__cell--left">
                {intl.formatMessage({ id: 'QUBE_DAO_VOTE_FORM_USER_SHARE_CELL' })}
            </div>
            <div className="list__cell list__cell--right visible@m">
                {intl.formatMessage({ id: 'QUBE_DAO_VOTE_FORM_CURRENT_WEIGHT_CELL' })}
            </div>
            <div className="list__cell list__cell--right visible@m">
                {intl.formatMessage({ id: 'QUBE_DAO_VOTE_FORM_WITH_USER_VOTE_CELL' })}
            </div>
            <div className="list__cell list__cell--center visible@s" />
        </div>
    )
}
