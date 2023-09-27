import * as React from 'react'
import { Link } from 'react-router-dom'

import { TokenIcon } from '@/components/common/TokenIcon'
import type { TokenIconProps } from '@/components/common/TokenIcon'
import { appRoutes } from '@/routes'
import type { TokenCache } from '@/stores/TokensCacheService'
import { checkForScam, sliceAddress } from '@/utils'

import styles from './index.module.scss'

type Props = {
    address: string;
    linkable?: boolean;
    size?: TokenIconProps['size'];
    token?: TokenCache;
}

export function CurrencyBadge({ address, linkable = true, size = 'small', token }: Props): JSX.Element {
    return (
        <div className={styles.token_badge}>
            <TokenIcon
                address={token?.root ?? address}
                name={token?.symbol}
                size={size}
                icon={token?.icon}
            />
            {linkable ? (
                <div>
                    <Link to={appRoutes.token.makeUrl({ address: token?.root || address })}>
                        {token?.symbol || sliceAddress(token?.root ?? address)}
                    </Link>
                    {token?.name ? (
                        <div className={styles.token_badge__name}>
                            {token?.name}
                        </div>
                    ) : null}
                </div>
            ) : (
                <div>
                    {token?.symbol || sliceAddress(token?.root ?? address)}
                    {checkForScam(token?.symbol, token?.root) && (
                        <>
                            &nbsp;
                            <span className="text-danger">[SCAM]</span>
                        </>
                    )}
                    {token?.name ? (
                        <div className={styles.token_badge__name}>
                            {token?.name}
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    )
}
