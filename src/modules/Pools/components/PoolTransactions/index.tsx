import * as React from 'react'
import classNames from 'classnames'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import Media from 'react-media'

import { Checkbox } from '@/components/common/Checkbox'
import { PanelLoader } from '@/components/common/PanelLoader'
import { Tabs } from '@/components/common/Tabs'
import { TransactionsListCard } from '@/modules/Pools/components/PoolTransactions/components/TransactionsListCard'
import { TransactionsListEmpty } from '@/modules/Pools/components/PoolTransactions/components/TransactionsListEmpty'
import { TransactionsListHeader } from '@/modules/Pools/components/PoolTransactions/components/TransactionsListHeader'
import { TransactionsListItem } from '@/modules/Pools/components/PoolTransactions/components/TransactionsListItem'
import { TransactionsListPagination } from '@/modules/Pools/components/PoolTransactions/components/TransactionsListPagination'
import { TransactionsListPlaceholder } from '@/modules/Pools/components/PoolTransactions/components/TransactionsListPlaceholder'
import { usePoolTransactionsStoreContext } from '@/modules/Pools/context'
import { PoolTransactionEventType } from '@/modules/Pools/types'

import styles from './index.module.scss'

export function PoolTransactions(): JSX.Element {
    const intl = useIntl()

    const transactionsStore = usePoolTransactionsStoreContext()

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
            eventType: [PoolTransactionEventType.Swap],
            pagination: {
                ...transactionsStore.pagination,
                currentPage: 1,
            },
        })
        await transactionsStore.fetch(true)
    }

    const switchToDeposit = async () => {
        transactionsStore.setState({
            eventType: [PoolTransactionEventType.Deposit],
            pagination: {
                ...transactionsStore.pagination,
                currentPage: 1,
            },
        })
        await transactionsStore.fetch(true)
    }

    const switchToWithdraw = async () => {
        transactionsStore.setState({
            eventType: [PoolTransactionEventType.Withdraw],
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
