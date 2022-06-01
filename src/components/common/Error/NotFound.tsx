import * as React from 'react'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'

import './index.scss'

export function NotFoundError(): JSX.Element {
    const intl = useIntl()

    const reload = () => {
        window.location.reload()
    }

    const back = () => {
        window.history.back()
    }

    return (
        <div className="error-block">
            <div className="error-block__code">
                404
            </div>

            <div className="error-block__title">
                {intl.formatMessage({
                    id: 'Page not found',
                })}
            </div>

            <div className="error-block__text">
                {intl.formatMessage({
                    id: 'ERROR_PAGE_NOT_FOUND_TEXT',
                })}
            </div>

            <div className="error-block__actions">
                <Button
                    type="secondary"
                    size="md"
                    onClick={back}
                >
                    {intl.formatMessage({
                        id: 'ERROR_BACK',
                    })}
                </Button>

                <Button
                    type="primary"
                    size="md"
                    onClick={reload}
                >
                    {intl.formatMessage({
                        id: 'ERROR_RELOAD',
                    })}
                </Button>
            </div>
        </div>
    )
}
