import * as React from 'react'

import { AccountExplorerLink } from '@/components/common/AccountExplorerLink'
import { Token } from '@/modules/Builder/types'


type Props = {
    token: Token;
}


export function Item({ token }: Props): JSX.Element {
    return (
        <AccountExplorerLink address={token.root} className="list__row">
            <div className="list__cell list__cell--left">
                {token.name}
            </div>
            <div className="list__cell list__cell--center">
                {token.symbol}
            </div>
            <div className="list__cell list__cell--center">
                {token.decimals}
            </div>
            <div className="list__cell list__cell--center">
                {token.total_supply}
            </div>
        </AccountExplorerLink>
    )
}
