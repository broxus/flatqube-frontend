import * as React from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'

import './index.scss'

export function EmptyMessage(): JSX.Element {
    const intl = useIntl()

    return (
        <div className="card card--small card--flat">
            <div className="message message_system">
                <p>{intl.formatMessage({ id: 'POOLS_LIST_EMPTY_TABLE' })}</p>
                <p className="small">
                    {intl.formatMessage({
                        id: 'POOLS_LIST_EMPTY_TABLE_META',
                    }, {
                        link: (
                            <Link to="/pairs">
                                {intl.formatMessage({
                                    id: 'POOLS_LIST_EMPTY_TABLE_META_LINK_TEXT',
                                })}
                            </Link>
                        ),
                    })}
                </p>
            </div>
        </div>
    )
}
