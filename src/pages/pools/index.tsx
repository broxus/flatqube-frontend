import * as React from 'react'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { Pools } from '@/modules/Pools'
import { WalletMiddleware } from '@/modules/WalletMiddleware'
import { PageHeader } from '@/components/common/PageHeader'

export default function Page(): JSX.Element {
    const intl = useIntl()

    return (
        <div className="container container--large">
            <section className="section">
                <PageHeader
                    actions={(
                        <>
                            <Button size="md" link="/pools/burn-liquidity" type="secondary">
                                {intl.formatMessage({ id: 'POOLS_LIST_HEADER_REMOVE' })}
                            </Button>
                            <Button size="md" link="/pool" type="primary">
                                {intl.formatMessage({ id: 'POOLS_LIST_HEADER_NEW' })}
                            </Button>
                        </>
                    )}
                    title={intl.formatMessage({ id: 'POOLS_LIST_TITLE' })}
                />
                <WalletMiddleware message={intl.formatMessage({ id: 'POOLS_LIST_CONNECT_WALLET_TITLE' })}>
                    <Pools />
                </WalletMiddleware>
            </section>
        </div>
    )
}
