import classNames from 'classnames'
import * as React from 'react'

import styles from './index.module.scss'

export type StatusType = 'red' | 'green' | 'yellow' | 'default'

type Props = {
    type?: StatusType;
    children: React.ReactNode
}

export function GaugesStatus({
    type = 'default',
    children,
}: Props): JSX.Element {
    return (
        <div
            className={classNames(styles.status, {
                [styles[type]]: type !== undefined,
            })}
        >
            {children}
        </div>
    )
}
