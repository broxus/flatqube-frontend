import classNames from 'classnames'
import * as React from 'react'

import styles from './index.module.scss'

type Props = {
    children?: React.ReactNode;
    action?: React.ReactNode;
    className?: string;
}

export function GaugesHead({
    children,
    action,
    className,
}: Props): JSX.Element {
    return (
        <div className={classNames(styles.head, className)}>
            <h1 className={styles.title}>
                {children}
            </h1>

            {action}
        </div>
    )
}
