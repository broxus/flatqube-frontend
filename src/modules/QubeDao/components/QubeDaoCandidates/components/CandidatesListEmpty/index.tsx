import * as React from 'react'
import { useIntl } from 'react-intl'

import styles from './index.module.scss'

export function CandidatesListEmpty(): JSX.Element {
    const intl = useIntl()

    return (
        <div className={styles.candidates_list__empty_message}>
            <h3>{intl.formatMessage({ id: 'QUBE_DAO_CANDIDATES_LIST_EMPTY' })}</h3>
            <p>{intl.formatMessage({ id: 'QUBE_DAO_CANDIDATES_LIST_EMPTY_NOTE' })}</p>
        </div>
    )
}
