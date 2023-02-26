import * as React from 'react'
import classNames from 'classnames'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import Media from 'react-media'

import { Checkbox } from '@/components/common/Checkbox'
import { PanelLoader } from '@/components/common/PanelLoader'
import { Tabs } from '@/components/common/Tabs'
import { TransactionsListCard } from '@/modules/Currencies/components/CurrencyTransactions/components/TransactionListCard'
import { TransactionsListEmpty } from '@/modules/Currencies/components/CurrencyTransactions/components/TransactionsListEmpty'
import { TransactionsListHeader } from '@/modules/Currencies/components/CurrencyTransactions/components/TransactionsListHeader'
import { TransactionsListItem } from '@/modules/Currencies/components/CurrencyTransactions/components/TransactionsListItem'
import { TransactionsListPagination } from '@/modules/Currencies/components/CurrencyTransactions/components/TransactionsListPagination'
import { TransactionsListPlaceholder } from '@/modules/Currencies/components/CurrencyTransactions/components/TransactionsListPlaceholder'
import { useCurrencyTransactionsStoreContext } from '@/modules/Currencies/providers'
import { CurrencyTransactionEventType } from '@/modules/Currencies/types'

import styles from './index.module.scss'

export function CurrencyTransactions(): JSX.Element {
    const intl = useIntl()

    const transactionsStore = useCurrencyTransactionsStoreContext()

    const switchToAll = async () => {
        transactionsStore.setState({
            eventType: [],
            pagination: {
                ...transactionsStore.pagination,
                currentPage: 1,
            },
        })
        await transactionsStore.fetch(true)
    }

    const switchToSwap = async () => {
        transactionsStore.setState({
            eventType: [CurrencyTransactionEventType.Swap],
            pagination: {
                ...transactionsStore.pagination,
                currentPage: 1,
            },
        })
        await transactionsStore.fetch(true)
    }

    const switchToDeposit = async () => {
        transactionsStore.setState({
            eventType: [CurrencyTransactionEventType.Deposit],
            pagination: {
                ...transactionsStore.pagination,
                currentPage: 1,
            },
        })
        await transactionsStore.fetch(true)
    }

    const switchToWithdraw = async () => {
        transactionsStore.setState({
            eventType: [CurrencyTransactionEventType.Withdraw],
            pagination: {
                ...transactionsStore.pagination,
                currentPage: 1,
            },
        })
        await transactionsStore.fetch(true)
    }

    const toggleUserTransactions = async () => {
        transactionsStore.setState('onlyUserTransactions', !transactionsStore.onlyUserTransactions)
        await transactionsStore.fetch(true)
    }

    return (
        <Observer>
            {() => (
                <>
                    <div className={styles.transactions_list__toolbar}>
                        <Tabs
                            items={[{
                                active: transactionsStore.eventType.length === 0,
                                label: intl.formatMessage({ id: 'POOL_TRANSACTIONS_LIST_EVENT_FILTER_ALL' }),
                                onClick: switchToAll,
                            }, {
                                active: transactionsStore.isSwapEventType,
                                label: intl.formatMessage({ id: 'POOL_TRANSACTIONS_LIST_EVENT_FILTER_SWAPS' }),
                                onClick: switchToSwap,
                            }, {
                                active: transactionsStore.isDepositEventType,
                                label: intl.formatMessage({ id: 'POOL_TRANSACTIONS_LIST_EVENT_FILTER_DEPOSITS' }),
                                onClick: switchToDeposit,
                            }, {
                                active: transactionsStore.isWithdrawEventType,
                                label: intl.formatMessage({ id: 'POOL_TRANSACTIONS_LIST_EVENT_FILTER_WITHDRAWS' }),
                                onClick: switchToWithdraw,
                            }]}
                        />
                        <Checkbox
                            checked={transactionsStore.onlyUserTransactions}
                            label={intl.formatMessage({
                                id: 'POOL_TRANSACTIONS_LIST_USER_ONLY_FILTER_CHECKBOX_LABEL',
                            })}
                            onChange={toggleUserTransactions}
                        />
                    </div>

                    <div className="card card--flat card--xsmall">
                        <div className={classNames('list', styles.transactions_list, styles.list)}>
                            <Media query={{ minWidth: 640 }}>
                                {matches => (matches && transactionsStore.transactions.length > 0 ? (
                                    <TransactionsListHeader />
                                ) : null)}
                            </Media>

                            {(() => {
                                const isFetching = (
                                    transactionsStore.isFetching === undefined
                                    || transactionsStore.isFetching
                                )

                                switch (true) {
                                    case isFetching && transactionsStore.transactions.length === 0:
                                        return <TransactionsListPlaceholder />

                                    case transactionsStore.transactions.length > 0: {
                                        return (
                                            <PanelLoader loading={isFetching}>
                                                {transactionsStore.transactions.map(tx => (
                                                    <Media key={tx.messageHash} query={{ minWidth: 640 }}>
                                                        {matches => (matches
                                                            ? <TransactionsListItem transaction={tx} />
                                                            : <TransactionsListCard transaction={tx} />
                                                        )}
                                                    </Media>
                                                ))}
                                            </PanelLoader>
                                        )
                                    }

                                    default:
                                        return <TransactionsListEmpty />
                                }
                            })()}
                        </div>

                        {transactionsStore.pagination && transactionsStore.pagination.totalPages > 1 && (
                            <TransactionsListPagination />
                        )}
                    </div>
                </>
            )}
        </Observer>
    )
}
