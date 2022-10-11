import * as React from 'react'
import { useIntl } from 'react-intl'

import TransactionsListEmptyBg from '@/modules/Transactions/assets/TransactionsListEmptyBg.png'
import { ContentLoader } from '@/components/common/ContentLoader'
import { OrderingSwitcher } from '@/components/common/OrderingSwitcher'
import { Item } from '@/modules/Transactions/components/TransactionsList/Item'
import { TransactionInfo, TransactionsOrdering } from '@/modules/Transactions/types'
import { Pagination, PaginationProps } from '@/components/common/Pagination'
import { PanelLoader } from '@/components/common/PanelLoader'

import './index.scss'


type Props = {
    isLoading: boolean;
    noContentNote?: React.ReactNode;
    ordering: TransactionsOrdering | undefined;
    pagination?: PaginationProps;
    transactions: TransactionInfo[];
    onSwitchOrdering: (value: TransactionsOrdering) => void;
}

export function TransactionsList({
    isLoading,
    noContentNote,
    ordering,
    pagination,
    transactions,
    onSwitchOrdering,
}: Props): JSX.Element {
    const intl = useIntl()

    return (
        <div className="card card--small card--flat">
            <div className="transactions-list list">
                {transactions.length > 0 && (
                    <div className="list__header">
                        <div className="list__cell list__cell--left">
                            {intl.formatMessage({
                                id: 'TRANSACTIONS_LIST_HEADER_TRANSACTION_CELL',
                            })}
                        </div>
                        <div className="list__cell list__cell--right">
                            {intl.formatMessage({
                                id: 'TRANSACTIONS_LIST_HEADER_TOTAL_VALUE_CELL',
                            })}
                        </div>
                        <div className="list__cell list__cell--right visible@m">
                            {intl.formatMessage({
                                id: 'TRANSACTIONS_LIST_HEADER_LEFT_TOKEN_CELL',
                            })}
                        </div>
                        <div className="list__cell list__cell--right visible@m">
                            {intl.formatMessage({
                                id: 'TRANSACTIONS_LIST_HEADER_RIGHT_TOKEN_CELL',
                            })}
                        </div>
                        <div className="list__cell list__cell--right visible@m">
                            {intl.formatMessage({
                                id: 'TRANSACTIONS_LIST_HEADER_ACCOUNT_CELL',
                            })}
                        </div>
                        <div className="list__cell list__cell--right visible@s">
                            <OrderingSwitcher<TransactionsOrdering>
                                ascending="blocktimeascending"
                                descending="blocktimedescending"
                                value={ordering}
                                onSwitch={onSwitchOrdering}
                            >
                                {intl.formatMessage({
                                    id: 'TRANSACTIONS_LIST_HEADER_TIME_CELL',
                                })}
                            </OrderingSwitcher>
                        </div>
                    </div>
                )}

                {(() => {
                    switch (true) {
                        case isLoading && transactions.length === 0:
                            return <ContentLoader />

                        case transactions.length > 0:
                            return (
                                <PanelLoader loading={isLoading && transactions.length > 0}>
                                    {transactions.map(transaction => (
                                        <Item
                                            key={Object.values(transaction).join('-')}
                                            transaction={transaction}
                                        />
                                    ))}
                                </PanelLoader>
                            )

                        default:
                            return (
                                <div className="transactions-list__empty-message">
                                    <img src={TransactionsListEmptyBg} alt="" />
                                    <h3>{intl.formatMessage({ id: 'TRANSACTIONS_LIST_NO_TRANSACTIONS' })}</h3>
                                    <p>
                                        {noContentNote || intl.formatMessage({
                                            id: 'TRANSACTIONS_LIST_NO_TRANSACTIONS_NOTE',
                                        })}
                                    </p>
                                </div>
                            )
                    }
                })()}
            </div>

            {pagination && pagination.totalPages > 1 && (
                <Pagination {...pagination} />
            )}
        </div>
    )
}
