import * as React from 'react'
import { useIntl } from 'react-intl'

import styles from './index.module.scss'

export function CandidatesListEmpty(): JSX.Element {
    const intl = useIntl()

    return (
        <div className={styles.candidates_list__empty_message}>
            <p>{intl.formatMessage({ id: 'QUBE_DAO_VOTES_LIST_EMPTY_NOTE' })}</p>
        </div>
    )
}
