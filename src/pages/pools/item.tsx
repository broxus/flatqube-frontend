import * as React from 'react'
import { useIntl } from 'react-intl'

import { PoolsItem } from '@/modules/Pools/item'
import { WalletMiddleware } from '@/modules/WalletMiddleware'

export default function Page(): JSX.Element {
    const intl = useIntl()

    return (
        <div className="container container--large">
            <WalletMiddleware message={intl.formatMessage({ id: 'POOLS_LIST_CONNECT_WALLET_TITLE' })}>
                <PoolsItem />
            </WalletMiddleware>
        </div>
    )
}
