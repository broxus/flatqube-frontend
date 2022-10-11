import * as React from 'react'
import classNames from 'classnames'

import { TokenIcon, TokenIconProps } from '@/components/common/TokenIcon'

import './index.scss'

export function TokenBadge(props: TokenIconProps & { symbol?: string }): JSX.Element {
    const { className, symbol, ...restProps } = props

    return (
        <div className="token_badge">
            <div className="token_badge__icon">
                <TokenIcon className={className} {...restProps} />
            </div>

            <div className={classNames('token_badge__label', className)}>
                {`${symbol ? ` ${symbol}` : ''}`}
            </div>
        </div>
    )
}
