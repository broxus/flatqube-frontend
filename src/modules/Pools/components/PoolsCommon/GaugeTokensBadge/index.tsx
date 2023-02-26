import * as React from 'react'
import { Link } from 'react-router-dom'

import type { TokenIconProps } from '@/components/common/TokenIcon'
import { TokenIcons } from '@/components/common/TokenIcons'
import { appRoutes } from '@/routes'

import styles from './index.module.scss'

type Props = {
    gaugeAddress: string;
    items: {
        address: string;
        icon?: string;
        symbol?: string;
    }[];
    linkable?: boolean;
    size?: TokenIconProps['size'];
}

export function GaugeTokensBadge({ gaugeAddress, items, linkable = true, size }: Props): JSX.Element {
    return (
        <div className={styles.gauge_tokens_badge}>
            <TokenIcons icons={items ?? []} size={size} />
            {linkable ? (
                <Link to={appRoutes.gaugesItem.makeUrl({ address: gaugeAddress })}>
                    {items.map(item => item.symbol).join('/')}
                </Link>
            ) : <span>{items?.map(item => item.symbol).join('/')}</span>}
        </div>
    )
}
