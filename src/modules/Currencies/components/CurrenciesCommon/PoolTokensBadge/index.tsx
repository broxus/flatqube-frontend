import * as React from 'react'
import { Link } from 'react-router-dom'

import type { TokenIconProps } from '@/components/common/TokenIcon'
import { TokenIcons } from '@/components/common/TokenIcons'
import { appRoutes } from '@/routes'

import styles from './index.module.scss'

type Props = {
    items: {
        address: string;
        symbol?: string;
    }[];
    linkable?: boolean;
    poolAddress: string;
    size?: TokenIconProps['size'];
}

export function PoolTokensBadge({ items, linkable = true, poolAddress, size }: Props): JSX.Element {
    return (
        <div className={styles.pool_tokens_badge}>
            <TokenIcons icons={items ?? []} size={size} />
            {linkable ? (
                <Link to={appRoutes.pool.makeUrl({ address: poolAddress })}>
                    {items.map(item => item.symbol).join('/')}
                </Link>
            ) : <span>{items?.map(item => item.symbol).join('/')}</span>}
        </div>
    )
}
