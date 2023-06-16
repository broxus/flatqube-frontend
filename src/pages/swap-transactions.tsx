import * as React from 'react'
import { reaction } from 'mobx'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
// import { NotFoundError } from '@/components/common/Error'
import classNames from 'classnames'
import Media from 'react-media'

import { SectionTitle } from '@/components/common/SectionTitle'
import { debug } from '@/utils'
import { SwapTransactionsListEmpty } from '@/modules/Swap/components/SwapPoolTransactions/components/TransactionsListEmpty'
import { SwapPoolTransactions } from '@/modules/Swap/components/SwapPoolTransactions'
import { useSwapPoolStoreContext } from '@/modules/Swap/context/SwapPoolStoreProvider'
import { SwapPoolTransactionsStoreProvider } from '@/modules/Swap/context/SwapPoolTransactionsStoreProvider'

export function SwapTransactions(): JSX.Element {
    const intl = useIntl()

    const swapPoolStore = useSwapPoolStoreContext()

    React.useEffect(() => reaction(
        () => swapPoolStore?.tokensCache.isReady,
        async isReady => {
            debug('address SwapTransactions poolStore.address isReady', swapPoolStore?.address, isReady)
            if (isReady) {
                await swapPoolStore?.init()
            }
        },
        { delay: 50, fireImmediately: true },
    ), [swapPoolStore?.address])

    // React.useEffect(() => () => swapPoolStore?.dispose())
    debug('address SwapTransactions swapPoolStore.address', swapPoolStore?.address)

    return (
        <Observer>
            {() => {
                debug('address Observer', swapPoolStore?.address)
                return (
                    <div style={({ marginTop: '64px' })}>
                        <SwapPoolTransactionsStoreProvider>
                            <section className="section">
                                <header className="section__header">
                                    <SectionTitle size="small">
                                        {intl.formatMessage({ id: 'POOL_TRANSACTIONS_LIST_TITLE' })}
                                    </SectionTitle>
                                </header>
                                {!swapPoolStore?.isFetching && swapPoolStore?.notFound
                                    ? (
                                        <div className="card card--flat card--xsmall">
                                            <div className={classNames('list', 'transactions_list')}>
                                                <Media query={{ minWidth: 640 }}>
                                                    {matches => (matches ? (
                                                        <div className="list__header">
                                                            <div className="list__cell list__cell--left">
                                                                {intl.formatMessage({ id: 'POOL_TRANSACTIONS_LIST_HEADER_TYPE_CELL' })}
                                                            </div>
                                                            <div className="list__cell list__cell--left">
                                                                {intl.formatMessage({ id: 'POOL_TRANSACTIONS_LIST_HEADER_TOKENS_CELL' })}
                                                            </div>
                                                            <div className="list__cell list__cell--right">
                                                                {intl.formatMessage(
                                                                    { id: 'POOL_TRANSACTIONS_LIST_HEADER_TOTAL_VALUE_CELL' },
                                                                )}
                                                            </div>
                                                            <div className="list__cell list__cell--right">
                                                                {intl.formatMessage(
                                                                    { id: 'POOL_TRANSACTIONS_LIST_HEADER_ACCOUNT_CELL' },
                                                                )}
                                                            </div>
                                                            <div className="list__cell list__cell--right">
                                                                {intl.formatMessage({ id: 'POOL_TRANSACTIONS_LIST_HEADER_DATE_CELL' })}
                                                            </div>
                                                        </div>
                                                    ) : null)}
                                                </Media>
                                                <SwapTransactionsListEmpty />
                                            </div>
                                        </div>
                                    )
                                    : <SwapPoolTransactions />}
                            </section>
                        </SwapPoolTransactionsStoreProvider>
                    </div>
                )
            }}
        </Observer>
    )
}
