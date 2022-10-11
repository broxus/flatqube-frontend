import * as React from 'react'
import classNames from 'classnames'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import Media from 'react-media'

import { QubeDaoDepositForm, QubeDaoDepositFormDrawer } from '@/modules/QubeDao/components/QubeDaoDepositForm'
import { QubeDaoUserTransactions } from '@/modules/QubeDao/components/QubeDaoUserTransactions'
import { QubeDaoUserBalances } from '@/modules/QubeDao/components/QubeDaoUserBalances'
import { QubeDaoUserDeposits } from '@/modules/QubeDao/components/QubeDaoUserDeposits'
import { QubeDaoWithdrawBanner } from '@/modules/QubeDao/components/QubeDaoWithdrawBanner'
import { QubeDaoDepositFormStoreProvider } from '@/modules/QubeDao/providers/QubeDaoDepositFormStoreProvider'
import { useQubeDaoDepositsStore } from '@/modules/QubeDao/providers/QubeDaoDepositsStoreProvider'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { useQubeDaoTransactionsStore } from '@/modules/QubeDao/providers/QubeDaoTransactionsStoreProvider'

import styles from './balance.module.scss'

export function QubeDaoBalance(): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()
    const depositsStore = useQubeDaoDepositsStore()
    const transactionsStore = useQubeDaoTransactionsStore()

    const timeoutDeposits = React.useRef<ReturnType<typeof setTimeout>>()
    const timeoutTransactions = React.useRef<ReturnType<typeof setTimeout>>()

    const checkDeposits = () => {
        timeoutDeposits.current = setTimeout(async () => {
            if (depositsStore.pagination.currentPage === 1) {
                const depositsTotalCount = depositsStore.pagination.totalCount
                await depositsStore.fetch(true, true)
                if (depositsStore.pagination.totalCount === depositsTotalCount) {
                    checkDeposits()
                }
                else {
                    clearTimeout(timeoutDeposits.current)
                }
            }
            else {
                clearTimeout(timeoutDeposits.current)
            }
        }, 5000)
    }

    const checkTransactions = () => {
        timeoutTransactions.current = setTimeout(async () => {
            if (transactionsStore.pagination.currentPage === 1) {
                const transactionsTotalCount = transactionsStore.pagination.totalCount
                await transactionsStore.fetch(true, true)
                if (transactionsStore.pagination.totalCount === transactionsTotalCount) {
                    checkTransactions()
                }
                else {
                    clearTimeout(timeoutTransactions.current)
                }
            }
            else {
                clearTimeout(timeoutTransactions.current)
            }
        }, 5000)
    }

    const onDepositSuccess = () => {
        checkDeposits()
        checkTransactions()
    }

    React.useEffect(() => {
        clearTimeout(timeoutDeposits.current)
        clearTimeout(timeoutTransactions.current)
    }, [])

    return (
        <>
            <Observer>
                {() => (daoContext.hasUnlockedAmount ? (
                    <QubeDaoWithdrawBanner key="banner" />
                ) : null)}
            </Observer>
            <div key="container" className={styles.balance__container}>
                <div className={styles.balance__content}>
                    <QubeDaoUserBalances />
                    <Media query={{ maxWidth: 959 }}>
                        <section className={classNames('section', styles.balance__featured_deposit_trigger)}>
                            <div className="card card--flat card--xsmall">
                                <QubeDaoDepositFormDrawer onDepositSuccess={onDepositSuccess} />
                            </div>
                        </section>
                    </Media>
                    <QubeDaoUserDeposits />
                    <QubeDaoUserTransactions />
                </div>
                <Media query={{ minWidth: 960 }}>
                    <aside className={styles.balance__sidebar}>
                        <div className="card card--flat card--ghost card--xsmall">
                            <header className="card__header">
                                <h4 className="card-title">
                                    {intl.formatMessage(
                                        { id: 'QUBE_DAO_DEPOSIT_FORM_CARD_TITLE' },
                                        { symbol: daoContext.tokenSymbol },
                                    )}
                                </h4>
                            </header>
                            <QubeDaoDepositFormStoreProvider
                                onTransactionSuccess={onDepositSuccess}
                            >
                                <QubeDaoDepositForm />
                            </QubeDaoDepositFormStoreProvider>
                        </div>
                    </aside>
                </Media>
            </div>
        </>
    )
}
