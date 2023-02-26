import * as React from 'react'
import { DateTime } from 'luxon'
import { useIntl } from 'react-intl'

import TransactionsListEmptyBg from '@/assets/TransactionsListEmpty.svg'
import { useQubeDaoEpochContext } from '@/modules/QubeDao/providers/QubeDaoEpochStoreProvider'

export function AwaitingBanner(): JSX.Element {
    const intl = useIntl()

    const epochStore = useQubeDaoEpochContext()

    return (
        <div className="card card--flat card--small text-center">
            <h3>
                {intl.formatMessage({
                    id: 'QUBE_DAO_VOTE_AWAITING_BANNER_TITLE',
                }, {
                    date: DateTime.fromSeconds(epochStore.voteStart ?? 0)
                        .toUTC(DateTime.local().offset)
                        .toFormat('dd.LL'),
                    offset: DateTime.fromSeconds(epochStore.voteStart ?? 0)
                        .toUTC(DateTime.local().offset)
                        .toFormat('ZZ'),
                    time: DateTime.fromSeconds(epochStore.voteStart ?? 0)
                        .toUTC(DateTime.local().offset)
                        .toFormat('HH:mm'),
                })}
            </h3>
            <p className="margin-bottom">
                {intl.formatMessage({ id: 'QUBE_DAO_VOTE_AWAITING_BANNER_NOTE' })}
            </p>
            <img className="margin-auto" src={TransactionsListEmptyBg} alt="" />
        </div>
    )
}
