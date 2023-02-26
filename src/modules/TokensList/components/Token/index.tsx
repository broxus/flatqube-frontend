import * as React from 'react'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'

import { TokenIcon, TokenIconProps } from '@/components/common/TokenIcon'
import { useTokensCache } from '@/stores/TokensCacheService'

import './index.scss'

type Props = {
    address: string;
    icon?: string;
    size?: TokenIconProps['size'];
    symbol?: string;
}

function TokenInner({
    address,
    icon,
    size = 'small',
    symbol,
}: Props): JSX.Element {
    const tokensCache = useTokensCache()
    const token = tokensCache.get(address)

    return (
        <div
            className={classNames('token', {
                [`token_size_${size}`]: Boolean(size),
            })}
        >
            <TokenIcon
                address={token?.root ?? address}
                icon={token?.icon ?? icon}
                size={size}
            />
            {token?.symbol ?? symbol}
        </div>
    )
}

export const Token = observer(TokenInner)
