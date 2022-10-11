import classNames from 'classnames'
import * as React from 'react'

import styles from './index.module.scss'

type Props = {
    className?: string;
    children?: React.ReactNode;
}

export function GaugesTitle({
    className,
    children,
}: Props): JSX.Element {
    return (
        <h2 className={classNames(styles.title, className)}>
            {children}
        </h2>
    )
}
