import * as React from 'react'
import { reaction } from 'mobx'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { NotFoundError } from '@/components/common/Error'
import { SectionTitle } from '@/components/common/SectionTitle'
import {
    CurrencyPageHeader,
    CurrencyRelatedPools,
    CurrencyStats,
    CurrencyTransactions,
} from '@/modules/Currencies/components'
import {
    CurrencyRelatedPoolsStoreProvider,
    CurrencyTransactionsStoreProvider,
    useCurrencyStoreContext,
} from '@/modules/Currencies/providers'
import { useTokensCache } from '@/stores/TokensCacheService'
import { Warning } from '@/components/common/Warning'

export function Currency(): JSX.Element {
    const intl = useIntl()
    const tokensCache = useTokensCache()
    const currencyStore = useCurrencyStoreContext()

    React.useEffect(() => reaction(() => currencyStore.tokensCache.isReady, async isReady => {
        if (isReady) {
            await currencyStore.init()
        }
    }, { delay: 50, fireImmediately: true }), [currencyStore.address])

    return (
        <Observer>
            {() => (!currencyStore.isFetching && currencyStore.notFound ? (
                <NotFoundError />
            ) : (
                <>
                    {tokensCache.isCustomToken(currencyStore.address) && (
                        <Warning
                            className="margin-bottom"
                            text={intl.formatMessage({ id: 'CURRENCY_CUSTOM_TOKEN_ALERT' })}
                            theme="warning"
                        />
                    )}

                    <CurrencyPageHeader />

                    <section className="section">
                        <CurrencyStats />
                    </section>

                    <CurrencyRelatedPoolsStoreProvider>
                        <section className="section">
                            <header className="section__header">
                                <SectionTitle size="small">
                                    {intl.formatMessage({ id: 'CURRENCY_POOLS_LIST_TITLE' })}
                                </SectionTitle>
                            </header>

                            <CurrencyRelatedPools />
                        </section>
                    </CurrencyRelatedPoolsStoreProvider>

                    <CurrencyTransactionsStoreProvider>
                        <section className="section">
                            <header className="section__header">
                                <SectionTitle size="small">
                                    {intl.formatMessage({ id: 'CURRENCY_TRANSACTIONS_LIST_TITLE' })}
                                </SectionTitle>
                            </header>
                            <CurrencyTransactions />
                        </section>
                    </CurrencyTransactionsStoreProvider>
                </>
            ))}
        </Observer>
    )
}
