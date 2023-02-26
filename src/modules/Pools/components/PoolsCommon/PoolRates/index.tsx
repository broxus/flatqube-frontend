import * as React from 'react'
import classNames from 'classnames'

import { Button } from '@/components/common/Button'
import { TokenIcon } from '@/components/common/TokenIcon'
import type { TokenIconProps } from '@/components/common/TokenIcon'

import styles from './index.module.scss'

type Props = {
    className?: string
    label: string;
    link: string;
    tokenIcon: TokenIconProps;
}

export function PoolRates({
    tokenIcon,
    link,
    label,
    className,
}: Props): JSX.Element {
    return (
        <Button
            className={classNames(styles.pool_rates, className)}
            link={link}
            type="link"
        >
            <TokenIcon size="small" {...tokenIcon} />
            {label}
        </Button>
    )
}
