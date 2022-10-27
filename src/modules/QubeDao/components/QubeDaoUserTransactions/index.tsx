import * as React from 'react'
import classNames from 'classnames'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { PanelLoader } from '@/components/common/PanelLoader'
import { SectionTitle } from '@/components/common/SectionTitle'
import { TransactionsListEmpty } from '@/modules/QubeDao/components/QubeDaoUserTransactions/components/TransactionsListEmpty'
import { TransactionsListHeader } from '@/modules/QubeDao/components/QubeDaoUserTransactions/components/TransactionsListHeader'
import { TransactionsListItem } from '@/modules/QubeDao/components/QubeDaoUserTransactions/components/TransactionsListItem'
import { TransactionsListPagination } from '@/modules/QubeDao/components/QubeDaoUserTransactions/components/TransactionsListPagination'
import { TransactionsListPlaceholder } from '@/modules/QubeDao/components/QubeDaoUserTransactions/components/TransactionsListPlaceholder'
import { useQubeDaoTransactionsContext } from '@/modules/QubeDao/providers/QubeDaoTransactionsStoreProvider'

import styles from './index.module.scss'

export function QubeDaoUserTransactions(): JSX.Element {
    const intl = useIntl()

    const transactionsStore = useQubeDaoTransactionsContext()

    return (
        <section className="section">
            <header className="section__header">
                <SectionTitle size="small">
                    {intl.formatMessage({ id: 'QUBE_DAO_BALANCE_USER_TRANSACTIONS_TITLE' })}
                </SectionTitle>
            </header>

            <Observer>
                {() => (
                    <div className="card card--flat card--xsmall">
                        <div className={classNames('list', styles.transactions_list, styles.list)}>
                            {transactionsStore.transactions.length > 0 && (
                                <TransactionsListHeader />
                            )}

                            {(() => {
                                const isFetching = (
                                    transactionsStore.isFetching
                                    || transactionsStore.isFetching === undefined
                                )

                                switch (true) {
                                    case isFetching && transactionsStore.transactions.length === 0:
                                        return <TransactionsListPlaceholder />

                                    case transactionsStore.transactions.length > 0: {
                                        return (
                                            <PanelLoader loading={isFetching}>
                                                {transactionsStore.transactions.map(tx => (
                                                    <TransactionsListItem key={tx.transactionHash} transaction={tx} />
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
                )}
            </Observer>
        </section>
    )
}
