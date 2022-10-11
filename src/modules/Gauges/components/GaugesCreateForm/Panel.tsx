import * as React from 'react'

import styles from './index.module.scss'

type Props = {
    title: string;
    tools?: React.ReactNode;
    children?: React.ReactNode;
}

export function CreateFormPanel({
    title,
    tools,
    children,
}: Props): JSX.Element {
    return (
        <div className={styles.panel}>
            <h3 className={styles.title}>
                {title}
            </h3>
            <div className={styles.body}>
                {children}
            </div>
            {tools && (
                <div className={styles.tools}>
                    {tools}
                </div>
            )}
        </div>
    )
}
