import * as React from 'react'
import { useIntl } from 'react-intl'

import TransactionsListEmptyBg from '@/modules/Transactions/assets/TransactionsListEmptyBg.png'

import styles from './index.module.scss'

export function TransactionsListEmpty(): JSX.Element {
    const intl = useIntl()

    return (
        <div className={styles.transactions_list__empty_message}>
            <img src={TransactionsListEmptyBg} alt="" />
            <h3>{intl.formatMessage({ id: 'QUBE_DAO_USER_TRANSACTIONS_LIST_EMPTY' })}</h3>
            <p>{intl.formatMessage({ id: 'QUBE_DAO_USER_TRANSACTIONS_LIST_EMPTY_NOTE' })}</p>
        </div>
    )
}
