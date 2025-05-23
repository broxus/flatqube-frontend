import * as React from 'react'
import { reaction } from 'mobx'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { NotFoundError } from '@/components/common/Error'
import { SectionTitle } from '@/components/common/SectionTitle'
import {
    PoolPageHeader,
    PoolRelatedGauges,
    PoolStats,
    PoolTransactions,
    PoolUserStats,
} from '@/modules/Pools/components'
import {
    PoolRelatedGaugesStoreProvider,
    PoolTransactionsStoreProvider,
    usePoolStoreContext,
} from '@/modules/Pools/context'
import { WalletMiddleware } from '@/modules/WalletMiddleware'
import { Warning } from '@/components/common/Warning'
import { useTokensCache } from '@/stores/TokensCacheService'

export function Pool(): JSX.Element {
    const intl = useIntl()
    const tokensCache = useTokensCache()
    const poolStore = usePoolStoreContext()

    React.useEffect(() => reaction(
        () => poolStore.tokensCache.isReady,
        async isReady => {
            if (isReady) {
                await poolStore.init()
            }
        },
        { delay: 50, fireImmediately: true },
    ), [poolStore.address])

    React.useEffect(() => () => poolStore.dispose())

    return (
        <Observer>
            {() => (!poolStore.isFetching && poolStore.notFound ? (
                <NotFoundError />
            ) : (
                <>
                    {poolStore.tokens.some(token => tokensCache.isCustomToken(token.address)) && (
                        <Warning
                            className="margin-bottom"
                            text={intl.formatMessage({ id: 'POOL_CUSTOM_TOKEN_ALERT' })}
                            theme="warning"
                        />
                    )}

                    <PoolPageHeader />

                    <section className="section">
                        <PoolStats />
                    </section>

                    <PoolRelatedGaugesStoreProvider>
                        <section className="section">
                            <header className="section__header">
                                <SectionTitle size="small">
                                    {intl.formatMessage({ id: 'POOL_USER_STATS_TITLE' })}
                                </SectionTitle>
                            </header>
                            <WalletMiddleware
                                message={intl.formatMessage({
                                    id: 'POOL_USER_STATS_WALLET_MIDDLEWARE_MESSAGE',
                                })}
                            >
                                <PoolUserStats />
                            </WalletMiddleware>
                        </section>
                        <section className="section">
                            <header className="section__header">
                                <SectionTitle size="small">
                                    {intl.formatMessage({ id: 'POOL_GAUGES_LIST_TITLE' })}
                                </SectionTitle>
                            </header>
                            <PoolRelatedGauges />
                        </section>
                    </PoolRelatedGaugesStoreProvider>

                    <PoolTransactionsStoreProvider>
                        <section className="section">
                            <header className="section__header">
                                <SectionTitle size="small">
                                    {intl.formatMessage({ id: 'POOL_TRANSACTIONS_LIST_TITLE' })}
                                </SectionTitle>
                            </header>
                            <PoolTransactions />
                        </section>
                    </PoolTransactionsStoreProvider>
                </>
            ))}
        </Observer>
    )
}
