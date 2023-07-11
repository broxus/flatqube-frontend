import * as React from 'react'
import classNames from 'classnames'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import Media from 'react-media'

import { Checkbox } from '@/components/common/Checkbox'
import { PanelLoader } from '@/components/common/PanelLoader'
import { Tabs } from '@/components/common/Tabs'
import { TransactionsListCard } from '@/modules/Swap/components/SwapPoolTransactions/components/TransactionsListCard'
import { SwapTransactionsListEmpty } from '@/modules/Swap/components/SwapPoolTransactions/components/TransactionsListEmpty'
import { SwapTransactionsListHeader } from '@/modules/Swap/components/SwapPoolTransactions/components/TransactionsListHeader'
import { SwapTransactionsListItem } from '@/modules/Swap/components/SwapPoolTransactions/components/TransactionsListItem'
import { SwapTransactionsListPagination } from '@/modules/Swap/components/SwapPoolTransactions/components/TransactionsListPagination'
import { SwapTransactionsListPlaceholder } from '@/modules/Swap/components/SwapPoolTransactions/components/TransactionsListPlaceholder'
import { useSwapPoolTransactionsStoreContext } from '@/modules/Swap/context/SwapPoolTransactionsStoreProvider'
import { PoolTransactionEventType } from '@/modules/Pools/types'

import styles from './index.module.scss'

export function SwapPoolTransactions(): JSX.Element {
    const intl = useIntl()

    const transactionsStore = useSwapPoolTransactionsStoreContext()

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
                                    <SwapTransactionsListHeader />
                                ) : null)}
                            </Media>

                            {(() => {
                                const isFetching = (
                                    transactionsStore.isFetching === undefined
                                        || transactionsStore.isFetching
                                )

                                switch (true) {
                                    case isFetching && transactionsStore.transactions.length === 0:
                                        return <SwapTransactionsListPlaceholder />

                                    case transactionsStore.transactions.length > 0: {
                                        return (
                                            <PanelLoader loading={isFetching}>
                                                {transactionsStore.transactions.map(tx => (
                                                    <Media key={tx.messageHash} query={{ minWidth: 640 }}>
                                                        {matches => (matches
                                                            ? <SwapTransactionsListItem transaction={tx} />
                                                            : <TransactionsListCard transaction={tx} />
                                                        )}
                                                    </Media>
                                                ))}
                                            </PanelLoader>
                                        )
                                    }

                                    default:
                                        return <SwapTransactionsListEmpty />
                                }
                            })()}
                        </div>

                        {transactionsStore.pagination && transactionsStore.pagination.totalPages > 1 && (
                            <SwapTransactionsListPagination />
                        )}
                    </div>
                </>
            )}
        </Observer>
    )
}
