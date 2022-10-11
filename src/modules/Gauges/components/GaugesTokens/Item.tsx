import * as React from 'react'

import { Token } from '@/misc'
import { TokenIcon } from '@/components/common/TokenIcon'
import { Icon } from '@/components/common/Icon'
import { Tooltip } from '@/components/common/Tooltip'

import styles from './index.module.scss'

export type ItemProps = {
    token: Token;
    amount?: string;
    label?: string;
    extra?: React.ReactNode;
    info?: React.ReactNode;
}

export function Item({
    token,
    amount,
    label,
    extra,
    info,
}: ItemProps): JSX.Element {
    const infoRef = React.useRef<HTMLSpanElement>(null)

    return (
        <div
            key={token.root}
            className={styles.token}
        >
            <div className={styles.icon}>
                <TokenIcon
                    size="xsmall"
                    address={token.root}
                    icon={token.icon}
                    className={styles.icon}
                />
            </div>

            <div className={styles.main}>
                <div className={styles.label}>
                    {label ?? (
                        <>
                            {amount !== undefined && `${amount} `}
                            {token.symbol}
                        </>
                    )}
                </div>

                {extra && (
                    <div className={styles.extra}>
                        <div className={styles.value}>
                            {extra}
                        </div>

                        {info && (
                            <>
                                <span ref={infoRef} className={styles.info}>
                                    <Icon icon="infoFill" />
                                </span>

                                <Tooltip
                                    alignY="top"
                                    alignX="left"
                                    target={infoRef}
                                >
                                    {info}
                                </Tooltip>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
