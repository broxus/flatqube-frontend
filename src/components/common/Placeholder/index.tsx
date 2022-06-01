import classNames from 'classnames'
import * as React from 'react'

import './index.scss'

type Props = {
    width: number;
    height?: number;
    circle?: boolean;
}

export function Placeholder({
    width,
    height,
    circle,
}: Props): JSX.Element {
    return (
        <div
            className={classNames('placeholder', {
                placeholder_circle: circle,
            })}
            style={{
                width: `${width}px`,
                height: circle ? `${width}px` : height,
            }}
        >
            {'\u200B'}
        </div>
    )
}
