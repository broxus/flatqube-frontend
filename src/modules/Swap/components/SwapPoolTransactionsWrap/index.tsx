import * as React from 'react'
import classNames from 'classnames'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import Media from 'react-media'

import { SwapTransactionsListEmpty } from '@/modules/Swap/components/SwapPoolTransactions/components/TransactionsListEmpty'
import { SwapTransactionsListPlaceholder } from '@/modules/Swap/components/SwapPoolTransactions/components/TransactionsListPlaceholder'
import { useSwapPoolTransactionsStoreContext } from '@/modules/Swap/context/SwapPoolTransactionsStoreProvider'
import { SectionTitle } from '@/components/common/SectionTitle'
import { SwapPoolTransactions } from '@/modules/Swap/components/SwapPoolTransactions'
import { Tabs } from '@/components/common/Tabs'
import { Checkbox } from '@/components/common/Checkbox'

export function SwapPoolTransactionsWrap({ notFound } : { notFound?: boolean }): JSX.Element {
    const intl = useIntl()

    const transactionsStore = useSwapPoolTransactionsStoreContext()

    return (
        <Observer>
            {() => (transactionsStore.poolAddress
                ? (
                    <section className="section">
                        <header className="section__header">
                            <SectionTitle size="small">
                                {intl.formatMessage({ id: 'POOL_TRANSACTIONS_LIST_TITLE' })}
                            </SectionTitle>
                        </header>
                        {!transactionsStore?.isFetching && notFound
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
                )
                : (
                    <div>
                        <section className="section">
                            <header className="section__header">
                                <SectionTitle size="small">
                                    {intl.formatMessage({ id: 'POOL_TRANSACTIONS_LIST_TITLE' })}
                                </SectionTitle>
                            </header>
                            <div className="transactions_list__toolbar">
                                <Tabs
                                    items={[{
                                        active: false,
                                        label: intl.formatMessage({ id: 'POOL_TRANSACTIONS_LIST_EVENT_FILTER_ALL' }),
                                        onClick: () => undefined,
                                    }, {
                                        active: false,
                                        label: intl.formatMessage({ id: 'POOL_TRANSACTIONS_LIST_EVENT_FILTER_SWAPS' }),
                                        onClick: () => undefined,
                                    }, {
                                        active: false,
                                        label: intl.formatMessage({ id: 'POOL_TRANSACTIONS_LIST_EVENT_FILTER_DEPOSITS' }),
                                        onClick: () => undefined,
                                    }, {
                                        active: false,
                                        label: intl.formatMessage({ id: 'POOL_TRANSACTIONS_LIST_EVENT_FILTER_WITHDRAWS' }),
                                        onClick: () => undefined,
                                    }]}
                                />
                                <Checkbox
                                    checked={false}
                                    label={intl.formatMessage({
                                        id: 'POOL_TRANSACTIONS_LIST_USER_ONLY_FILTER_CHECKBOX_LABEL',
                                    })}
                                />
                            </div>
                            <div className="card card--flat card--xsmall">
                                <div className="list transactions_list">
                                    {transactionsStore.isFetching
                                        ? <SwapTransactionsListPlaceholder />
                                        : <SwapTransactionsListEmpty />}
                                </div>
                            </div>
                        </section>
                    </div>
                ))}
        </Observer>
    )
}
