import * as React from 'react'
import classNames from 'classnames'

import { TokenIcon, TokenIconProps } from '@/components/common/TokenIcon'
import { checkForScam } from '@/utils'

import './index.scss'

export function TokenAmountBadge(props: TokenIconProps & { amount: string, symbol?: string }): JSX.Element {
    const {
        address, amount, className, symbol, ...restProps
    } = props

    const isScam = checkForScam(symbol, address)

    return (
        <div className="token_amount_badge">
            <div className="token_amount_badge__icon">
                <TokenIcon className={className} {...restProps} />
            </div>

            <div className={classNames('token_amount_badge__label', className)}>
                {`${amount}${symbol ? ` ${symbol}` : ''}`}
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
