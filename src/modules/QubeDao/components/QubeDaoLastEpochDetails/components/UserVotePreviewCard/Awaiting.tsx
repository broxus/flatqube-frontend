import * as React from 'react'
import classNames from 'classnames'
import { DateTime } from 'luxon'
import { useIntl } from 'react-intl'

import { useQubeDaoEpochContext } from '@/modules/QubeDao/providers/QubeDaoEpochStoreProvider'

import styles from './index.module.scss'

export function Awaiting(): JSX.Element {
    const intl = useIntl()

    const epochStore = useQubeDaoEpochContext()

    return (
        <div className={classNames('card card--flat card--xsmall', styles.user_vote_preview_card)}>
            <div>
                <div className={styles.user_vote_preview_card__lead}>
                    {intl.formatMessage(
                        { id: 'QUBE_DAO_VOTE_PREVIEW_CARD_AWAITING_LEAD' },
                        {
                            date: DateTime.fromSeconds(epochStore.voteStart ?? 0)
                                .toUTC(DateTime.local().offset)
                                .toFormat('dd.LL'),
                            offset: DateTime.fromSeconds(epochStore.voteStart ?? 0)
                                .toUTC(DateTime.local().offset)
                                .toFormat('ZZ'),
                            time: DateTime.fromSeconds(epochStore.voteStart ?? 0)
                                .toUTC(DateTime.local().offset)
                                .toFormat('HH:mm'),
                        },
                    )}
                </div>
                <div className={styles.user_vote_preview_card__note}>
                    {intl.formatMessage({ id: 'QUBE_DAO_VOTE_PREVIEW_CARD_AWAITING_NOTE' })}
                </div>
            </div>
        </div>
    )
}
