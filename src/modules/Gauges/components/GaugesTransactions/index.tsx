import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { GaugesTitle } from '@/modules/Gauges/components/GaugesTitle'
import { Tabs } from '@/components/common/Tabs'
import { Checkbox } from '@/components/common/Checkbox'
import { TransactionsTable } from '@/modules/Gauges/components/GaugesTransactions/Table'
import { useContext } from '@/hooks/useContext'
import { GaugesTransactionsContext } from '@/modules/Gauges/providers/GaugesTransactionsProvider'
import { EventType } from '@/modules/Gauges/api/models'

import styles from './index.module.scss'

function GaugesTransactionsInner(): JSX.Element {
    const intl = useIntl()
    const transactions = useContext(GaugesTransactionsContext)

    const onClickTabFn = (eventTypes: EventType[]) => () => {
        transactions.setEventTypes(eventTypes)
    }

    return (
        <div className={styles.transactions}>
            <GaugesTitle>
                {intl.formatMessage({
                    id: 'GAUGE_TRANSACTIONS_TITLE',
                })}
            </GaugesTitle>

            <div className={styles.tools}>
                <Tabs
                    className={styles.tabs}
                    items={[{
                        active: transactions.eventTypes.length === 4,
                        label: intl.formatMessage({
                            id: 'GAUGE_TRANSACTIONS_ALL',
                        }),
                        onClick: onClickTabFn([
                            EventType.Claim,
                            EventType.Deposit,
                            EventType.RewardDeposit,
                            EventType.Withdraw,
                        ]),
                    }, {
                        active: transactions.eventTypes.length === 1
                            && transactions.eventTypes[0] === EventType.Claim,
                        label: intl.formatMessage({
                            id: 'GAUGE_TRANSACTIONS_CLAIMS',
                        }),
                        onClick: onClickTabFn([
                            EventType.Claim,
                        ]),
                    }, {
                        active: transactions.eventTypes.length === 1
                            && transactions.eventTypes[0] === EventType.Deposit,
                        label: intl.formatMessage({
                            id: 'GAUGE_TRANSACTIONS_DEPOSITS',
                        }),
                        onClick: onClickTabFn([
                            EventType.Deposit,
                        ]),
                    }, {
                        active: transactions.eventTypes.length === 1
                            && transactions.eventTypes[0] === EventType.Withdraw,
                        label: intl.formatMessage({
                            id: 'GAUGE_TRANSACTIONS_WITHDRAWS',
                        }),
                        onClick: onClickTabFn([
                            EventType.Withdraw,
                        ]),
                    }, {
                        active: transactions.eventTypes.length === 1
                            && transactions.eventTypes[0] === EventType.RewardDeposit,
                        label: intl.formatMessage({
                            id: 'GAUGE_TRANSACTIONS_REWARD_DEPOSITS',
                        }),
                        onClick: onClickTabFn([
                            EventType.RewardDeposit,
                        ]),
                    }]}
                />

                {transactions.userAddress && (
                    <Checkbox
                        checked={transactions.onlyUser}
                        onChange={transactions.setOnlyUser}
                        label={intl.formatMessage({
                            id: 'GAUGE_TRANSACTIONS_ONLY_MY',
                        })}
                    />
                )}

            </div>

            <TransactionsTable />
        </div>
    )
}

export const GaugesTransactions = observer(GaugesTransactionsInner)
