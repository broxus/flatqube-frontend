import classNames from 'classnames'
import * as React from 'react'

import styles from './index.module.scss'

interface Props extends React.HTMLAttributes<HTMLElement> {
    as?: React.ElementType;
    type?: 'blue' | 'red' | 'yellow' | 'green' | 'default';
    children?: React.ReactNode;
}

export function GaugesPanel({
    as: Tag = 'div',
    type = 'default',
    children,
    ...props
}: Props): JSX.Element {
    return (
        <Tag
            {...props}
            className={classNames(styles.panel, props.className, {
                [styles[type]]: type !== 'default',
            })}
        >
            {children}
        </Tag>
    )
}
