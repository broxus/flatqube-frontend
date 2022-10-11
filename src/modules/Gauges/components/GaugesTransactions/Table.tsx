import classNames from 'classnames'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'
import BigNumber from 'bignumber.js'

import { Pagination } from '@/components/common/Pagination'
import { GaugesPanel } from '@/modules/Gauges/components/GaugesPanel'
import { GaugesTransactionsContext } from '@/modules/Gauges/providers/GaugesTransactionsProvider'
import { useContext } from '@/hooks/useContext'
import { EventType, Token } from '@/modules/Gauges/api/models'
import { AccountExplorerLink } from '@/components/common/AccountExplorerLink'
import { formatDate, formattedAmount, formattedTokenAmount } from '@/utils'
import { Spinner } from '@/components/common/Spinner'
import { Placeholder } from '@/components/common/Placeholder'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'
import { GaugesTokensContext } from '@/modules/Gauges/providers/GaugesTokensProvider'
import { GaugesPriceContext } from '@/modules/Gauges/providers/GaugesPriceProvider'
import { TransactionExplorerLink } from '@/components/common/TransactionExplorerLink'

import styles from './index.module.scss'

const mapKind = (eventType: EventType) => {
    switch (eventType) {
        case EventType.Claim:
            return 'GAUGE_TRANSACTIONS_TYPE_CLAIM'
        case EventType.Deposit:
            return 'GAUGE_TRANSACTIONS_TYPE_DEPOSIT'
        case EventType.RewardDeposit:
            return 'GAUGE_TRANSACTIONS_TYPE_REWARD'
        case EventType.Withdraw:
            return 'GAUGE_TRANSACTIONS_TYPE_WITHDRAW'
        default:
            return 'GAUGE_TRANSACTIONS_TYPE_UNKNOWN'
    }
}

function TransactionsTableInner(): JSX.Element {
    const intl = useIntl()
    const transactions = useContext(GaugesTransactionsContext)
    const price = useContext(GaugesPriceContext)
    const tokens = useContext(GaugesTokensContext)
    const { rootToken } = useContext(GaugesDataStoreContext)

    const totalPages = Math.ceil(transactions.total / transactions.limit)
    const currentPage = (transactions.offset / transactions.limit) + 1

    const getTotalValue = (txTokens: Token[]) => (
        txTokens.reduce<BigNumber | undefined>((acc, item) => {
            const token = tokens.byRoot[item.tokenRoot]
            const tokenPrice = price.byRoot[item.tokenRoot]

            if (acc && token && tokenPrice) {
                const amountPrice = new BigNumber(item.amount).multipliedBy(tokenPrice)
                return acc.plus(amountPrice)
            }

            return acc
        }, new BigNumber(0))?.toFixed()
    )

    return (
        <GaugesPanel>
            <div className={classNames('list', styles.table)}>
                <div className="list__header">
                    <div className="list__cell list__cell--left">
                        {intl.formatMessage({
                            id: 'GAUGE_TRANSACTIONS_TRANSACTION',
                        })}
                    </div>
                    <div className="list__cell list__cell--right">
                        {intl.formatMessage({
                            id: 'GAUGE_TRANSACTIONS_TOTAL_VALUE',
                        })}
                    </div>
                    <div className="list__cell list__cell--right">
                        {intl.formatMessage({
                            id: 'GAUGE_TRANSACTIONS_TOKEN_VALUE',
                        })}
                    </div>
                    <div className="list__cell list__cell--right">
                        {intl.formatMessage({
                            id: 'GAUGE_TRANSACTIONS_ACCOUNT',
                        })}
                    </div>
                    <div className="list__cell list__cell--right">
                        {intl.formatMessage({
                            id: 'GAUGE_TRANSACTIONS_TIME',
                        })}
                    </div>
                </div>

                {rootToken && transactions.list.length > 0 ? (
                    <div className={styles.body}>
                        {transactions.isLoading && (
                            <div className={styles.spinner}>
                                <Spinner size="s" />
                            </div>
                        )}

                        {transactions.list.map((item, index) => (
                            // eslint-disable-next-line
                            <div className="list__row" key={index}>
                                <div className="list__cell list__cell--left">
                                    <TransactionExplorerLink id={item.txHash}>
                                        {intl.formatMessage({
                                            id: mapKind(item.kind),
                                        })}
                                    </TransactionExplorerLink>
                                </div>
                                <div className="list__cell list__cell--right">
                                    $
                                    {formattedAmount(
                                        getTotalValue(item.tokens),
                                        undefined,
                                    )}
                                </div>
                                <div className="list__cell list__cell--right">
                                    {item.tokens.map(token => (
                                        <div key={token.tokenRoot}>
                                            {tokens.byRoot[token.tokenRoot] ? (
                                                formattedTokenAmount(token.amount)
                                            ) : 'N/A'}
                                            {' '}
                                            {rootToken.root === token.tokenRoot ? 'LP' : token.tokenSymbol}
                                        </div>
                                    ))}
                                </div>
                                <div className="list__cell list__cell--right">
                                    <AccountExplorerLink address={item.userAddress} />
                                </div>
                                <div className="list__cell list__cell--right">
                                    {formatDate(item.timestamp * 1000)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.body}>
                        {!transactions.isLoaded || !rootToken ? (
                            <div className="list__row">
                                <div className="list__cell list__cell--left">
                                    <Placeholder width={120} />
                                </div>
                                <div className="list__cell list__cell--right">
                                    <Placeholder width={120} />
                                </div>
                                <div className="list__cell list__cell--right">
                                    <Placeholder width={120} />
                                </div>
                                <div className="list__cell list__cell--right">
                                    <Placeholder width={120} />
                                </div>
                                <div className="list__cell list__cell--right">
                                    <Placeholder width={120} />
                                </div>
                            </div>
                        ) : (
                            <div className={classNames('list__row', styles.noData)}>
                                <div className="list__cell list__cell--center">
                                    {intl.formatMessage({
                                        id: 'GAUGE_NO_DATA',
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Pagination
                className={styles.pagination}
                totalPages={totalPages}
                currentPage={currentPage}
                onNext={transactions.nextPage}
                onPrev={transactions.prevPage}
                onSubmit={transactions.setPage}
            />
        </GaugesPanel>
    )
}

export const TransactionsTable = observer(TransactionsTableInner)
