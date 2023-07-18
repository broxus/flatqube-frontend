import * as React from 'react'
import classNames from 'classnames'

import './index.scss'

type Props = {
    className?: string
    title?: string,
    text?: string,
    theme?: 'danger' | 'warning'
}

export function Warning({
    className,
    title,
    text,
    theme = 'danger',
}: Props): JSX.Element {
    return (
        <div
            className={classNames('warning', {
                [`warning_theme_${theme}`]: Boolean(theme),
            }, className)}
        >
            {title && <h4 key="title" className="warning__title">{title}</h4>}

            {text && (
                <div key="text" className="warning__text" dangerouslySetInnerHTML={{ __html: text }} />
            )}
        </div>
    )
}
