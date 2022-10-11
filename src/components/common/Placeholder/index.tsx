import classNames from 'classnames'
import * as React from 'react'

import './index.scss'

type Props = Pick<React.CSSProperties, 'height' | 'width'> & {
    circle?: boolean;
    className?: string;
}

export function Placeholder({
    circle,
    className,
    ...props
}: Props): JSX.Element {
    const width = typeof props.width === 'string' ? props.width : `${props.width}px`
    const height = typeof props.height === 'string' ? props.height : `${props.height}px`

    return (
        <span
            className={classNames('placeholder', {
                placeholder_circle: circle,
            }, className)}
            style={{
                height: circle ? width : height,
                width,
            }}
        >
            {'\u200B'}
        </span>
    )
}
