import * as React from 'react'
import { useIntl } from 'react-intl'


export function RelatedGaugesListHeader(): JSX.Element {
    const intl = useIntl()

    return (
        <div className="list__header">
            <div className="list__cell list__cell--left">
                {intl.formatMessage({ id: 'POOL_GAUGES_LIST_HEADER_POOL_CELL' })}
            </div>
            <div className="list__cell list__cell--left">
                {intl.formatMessage({ id: 'POOL_GAUGES_LIST_HEADER_REWARD_TOKENS_CELL' })}
            </div>
            <div className="list__cell list__cell--right">
                {intl.formatMessage({ id: 'POOL_GAUGES_LIST_HEADER_TVL_CELL' })}
            </div>
            <div className="list__cell list__cell--right">
                {intl.formatMessage({ id: 'POOL_GAUGES_LIST_HEADER_MIN_APR_CELL' })}
            </div>
            <div className="list__cell list__cell--right">
                {intl.formatMessage({ id: 'POOL_GAUGES_LIST_HEADER_MAX_APR_CELL' })}
            </div>
            <div className="list__cell list__cell--right">
                {intl.formatMessage({ id: 'POOL_GAUGES_LIST_HEADER_USER_SHARE_CELL' })}
            </div>
            <div className="list__cell list__cell--right">
                {intl.formatMessage({ id: 'POOL_GAUGES_LIST_HEADER_USER_TOTAL_REWARD_CELL' })}
            </div>
            <div className="list__cell list__cell--right">
                {intl.formatMessage({ id: 'POOL_GAUGES_LIST_HEADER_USER_ENTITLED_REWARD_CELL' })}
            </div>
        </div>
    )
}
