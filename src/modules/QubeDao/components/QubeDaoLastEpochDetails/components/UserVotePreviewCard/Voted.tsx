import * as React from 'react'
import classNames from 'classnames'
import { DateTime, Interval } from 'luxon'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { endsIn } from '@/components/common/EndsIn'
import { useQubeDaoEpochContext } from '@/modules/QubeDao/providers/QubeDaoEpochStoreProvider'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { appRoutes } from '@/routes'
import { formattedAmount, formattedTokenAmount } from '@/utils'

import styles from './index.module.scss'

export function Voted(): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()
    const epochStore = useQubeDaoEpochContext()

    const isQueued = Interval.fromDateTimes(
        DateTime.fromSeconds(epochStore.voteEnd ?? 0).toUTC(),
        DateTime.fromSeconds(epochStore.epochEnd ?? 0).toUTC(),
    ).contains(DateTime.utc())

    return (
        <div
            className={classNames(
                'card card--flat card--xsmall',
                styles.user_vote_preview_card,
                styles.user_vote_preview_card__voted,
            )}
        >
            <div>
                <div className={styles.user_vote_preview_card__supheader}>
                    {intl.formatMessage({ id: 'QUBE_DAO_VOTE_PREVIEW_CARD_SUPHEADER' })}
                </div>
                <div className={styles.user_vote_preview_card__lead}>
                    {`${formattedTokenAmount(
                        epochStore.userTotalVoteAmount,
                        daoContext.veDecimals,
                    )} ${daoContext.veSymbol}`}
                </div>
                <div className={classNames(styles.user_vote_preview_card__supheader, 'text-muted')}>
                    {intl.formatMessage(
                        { id: 'QUBE_DAO_VOTE_PREVIEW_CARD_VOTING_USER_SHARE' },
                        { value: formattedAmount(epochStore.userVoteShare) },
                    )}
                </div>
                <div className={styles.user_vote_preview_card__note}>
                    {isQueued
                        ? intl.formatMessage(
                            { id: 'QUBE_DAO_VOTE_PREVIEW_CARD_VOTING_FINISHED_NOTE' },
                            { startsIn: endsIn({ end: epochStore.epochEnd ?? 0 }) },
                        )
                        : intl.formatMessage(
                            { id: 'QUBE_DAO_VOTE_PREVIEW_CARD_VOTING_NOTE' },
                            { endsIn: endsIn({ end: epochStore.voteEnd ?? 0 }) },
                        )}
                </div>
            </div>
            <Button
                link={epochStore.epochNum ? appRoutes.daoEpoch.makeUrl({
                    epochNum: epochStore.epochNum.toString(),
                }) : undefined}
                size="md"
                type="secondary"
            >
                {intl.formatMessage({ id: 'QUBE_DAO_VOTE_PREVIEW_CARD_VOTING_VOTED_LINK_TEXT' })}
            </Button>
        </div>
    )
}
