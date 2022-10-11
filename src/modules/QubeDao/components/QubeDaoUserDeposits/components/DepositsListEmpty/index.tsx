import * as React from 'react'
import { useIntl } from 'react-intl'

import TransactionsListEmptyBg from '@/modules/Transactions/assets/TransactionsListEmptyBg.png'

import styles from './index.module.scss'

export function DepositsListEmpty(): JSX.Element {
    const intl = useIntl()

    return (
        <div className={styles.deposits_list__empty_message}>
            <img alt="" src={TransactionsListEmptyBg} />
            <h3>{intl.formatMessage({ id: 'QUBE_DAO_USER_DEPOSITS_LIST_EMPTY' })}</h3>
            <p>{intl.formatMessage({ id: 'QUBE_DAO_USER_DEPOSITS_LIST_EMPTY_NOTE' })}</p>
        </div>
    )
}
