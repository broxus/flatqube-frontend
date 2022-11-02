import * as React from 'react'
import classNames from 'classnames'
import { useIntl } from 'react-intl'
import { DateTime } from 'luxon'

import { useQubeDaoEpochContext } from '@/modules/QubeDao/providers/QubeDaoEpochStoreProvider'

import styles from './index.module.scss'


type Props = {
    epochEnd: number;
    epochStart: number;
    voteEnd?: number | null;
    voteStart?: number | null;
}


export function Scale(props: Props): JSX.Element {
    const intl = useIntl()

    const epochStore = useQubeDaoEpochContext()

    const {
        epochEnd,
        epochStart,
        voteEnd,
        voteStart,
    } = props

    const startDate = DateTime.fromSeconds(epochStart || 0).minus({ day: epochStore.epochNum === 1 ? 0 : 1 }).startOf('day')
    const endDate = DateTime.fromSeconds(epochEnd || 0).plus({ day: 1 }).endOf('day')

    const totalSeconds = endDate.diff(startDate, ['seconds', 'milliseconds']).toObject().seconds || 1
    const startOffsetPercent = ((epochStart - startDate.toSeconds()) * 100) / totalSeconds

    if (voteStart != null && voteEnd != null) {
        const awaitingPercentage = ((voteStart - epochStart) * 100) / totalSeconds
        const votingPercentage = ((voteEnd - voteStart) * 100) / totalSeconds
        const queuedPercentage = ((epochEnd - voteEnd) * 100) / totalSeconds
        const nextEpochPercentage = ((endDate.toSeconds() - epochEnd) * 100) / totalSeconds
        return (
            <div className={styles.timeline_item_scale_wrapper}>
                {startOffsetPercent > 0 && (
                    <div
                        className={styles.timeline_item_scale}
                        style={{ width: `${startOffsetPercent}%` }}
                    >
                        {(epochStore.epochNum ?? 1) > 1 && (
                            <span className={styles.timeline_item_scale_text}>
                                {intl.formatMessage(
                                    { id: 'QUBE_DAO_EPOCH_SHORT_TITLE' },
                                    { value: (epochStore.epochNum ?? 1) - 1 },
                                )}
                            </span>
                        )}
                    </div>
                )}
                <div
                    className={classNames(styles.timeline_item_scale, styles.timeline_item_scale__awaiting)}
                    style={{ width: `${awaitingPercentage}%` }}
                >
                    <span
                        className={classNames(
                            styles.timeline_item_scale_text,
                            styles.timeline_item_scale_text__epoch,
                        )}
                    >
                        {intl.formatMessage({
                            id: 'QUBE_DAO_EPOCH_AWAITING',
                        })}
                    </span>
                </div>
                <div
                    className={classNames(styles.timeline_item_scale, styles.timeline_item_scale__voting)}
                    style={{ width: `${votingPercentage}%` }}
                >
                    <span
                        className={classNames(
                            styles.timeline_item_scale_text,
                            styles.timeline_item_scale_text__voting,
                        )}
                    >
                        {intl.formatMessage({
                            id: 'QUBE_DAO_EPOCH_VOTING',
                        })}
                    </span>
                </div>
                <div
                    className={classNames(styles.timeline_item_scale, styles.timeline_item_scale__queued)}
                    style={{ width: `${queuedPercentage}%` }}
                >
                    <span
                        className={classNames(
                            styles.timeline_item_scale_text,
                            styles.timeline_item_scale_text__epoch,
                        )}
                    >
                        {intl.formatMessage({
                            id: 'QUBE_DAO_EPOCH_QUEUED',
                        })}
                    </span>
                </div>
                {nextEpochPercentage > 0 && (
                    <div
                        className={styles.timeline_item_scale}
                        style={{ width: `${nextEpochPercentage}%` }}
                    >
                        <span className={styles.timeline_item_scale_text}>
                            {intl.formatMessage(
                                { id: 'QUBE_DAO_EPOCH_SHORT_TITLE' },
                                { value: (epochStore.epochNum ?? 1) + 1 },
                            )}
                        </span>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className={styles.timeline_item_scale_wrapper}>
            <div
                className={classNames(styles.timeline_item_scale, styles.timeline_item_scale__awaiting)}
                style={{ width: '100%' }}
            >
                <span
                    className={classNames(
                        styles.timeline_item_scale_text,
                        styles.timeline_item_scale_text__epoch,
                    )}
                />
            </div>
        </div>

    )
}
