import classNames from 'classnames'
import * as React from 'react'

import styles from './index.module.scss'

export type Props = {
    type?: 'blue' | 'yellow' | 'green' | 'red' | 'default' | 'disabled';
    size?: 'sm' | 'md';
    className?: string;
    children: React.ReactNode;
}

export function Badge({
    type = 'blue',
    size = 'md',
    className,
    children,
}: Props): JSX.Element {
    return (
        <span className={classNames(styles.badge, styles[type], styles[size], className)}>
            {children}
        </span>
    )
}
