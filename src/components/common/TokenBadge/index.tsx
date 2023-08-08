import * as React from 'react'
import classNames from 'classnames'

import { TokenIcon, TokenIconProps } from '@/components/common/TokenIcon'
import { checkForScam } from '@/utils'

import './index.scss'

export function TokenBadge(props: TokenIconProps & { symbol?: string }): JSX.Element {
    const { className, symbol, ...restProps } = props

    const isScam = symbol && checkForScam(symbol)

    return (
        <div className="token_badge">
            <div className="token_badge__icon">
                <TokenIcon className={className} {...restProps} />
            </div>

            <div className={classNames('token_badge__label', className)}>
                {`${symbol ? ` ${symbol}` : ''}`}
                {isScam && (
                    <>
                        &nbsp;
                        <span className="text-danger">[SCAM]</span>
                    </>
                )}
            </div>
        </div>
    )
}
