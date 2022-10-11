import classNames from 'classnames'
import * as React from 'react'

import styles from './index.module.scss'

type Props = {
    type?: 'blue' | 'yellow';
    className?: string;
    children: React.ReactNode;
}

export function Badge({
    type = 'blue',
    className,
    children,
}: Props): JSX.Element {
    return (
        <span className={classNames(styles.badge, styles[type], className)}>
            {children}
        </span>
    )
}
