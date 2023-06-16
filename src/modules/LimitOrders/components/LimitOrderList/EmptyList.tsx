import React from 'react'
import { useIntl } from 'react-intl'

import TransactionsListEmptyBg from '@/assets/TransactionsListEmpty.svg'

import styles from './emptylist.module.scss'

type Props = {
    noContentNote: React.ReactNode;
}
export function EmptyList({ noContentNote }: Props): JSX.Element {
    const intl = useIntl()
    return (
        <div className={styles.list__empty_message}>
            <div className="margin-bottom">
                <img src={TransactionsListEmptyBg} alt="" />
            </div>
            <h3 className={styles.list__empty_message__title}>
                {intl.formatMessage({ id: 'P2P_LIMIT_ORDER_LIST_EMPTY' })}
            </h3>
            <div className={styles.list__empty_message__note}>
                {noContentNote || intl.formatMessage({
                    id: 'P2P_LIMIT_ORDER_LIST_EMPTY_NOTE',
                })}
            </div>
        </div>
    )
}
