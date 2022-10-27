import * as React from 'react'
import classNames from 'classnames'
import { DateTime, Interval } from 'luxon'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { ContentLoader } from '@/components/common/ContentLoader'
import { NativeScrollArea } from '@/components/common/NativeScrollArea'
import { SECONDS_IN_DAY } from '@/constants'
import { Scale } from '@/modules/QubeDao/components/QubeDaoEpochDetails/components/Timeline/Scale'
import { useQubeDaoEpochContext } from '@/modules/QubeDao/providers/QubeDaoEpochStoreProvider'
import { makeArray } from '@/utils'

import styles from './index.module.scss'

function TimelineInternal(): JSX.Element {
    const intl = useIntl()

    const epochStore = useQubeDaoEpochContext()

    if (epochStore.isFetchingEpoch || epochStore.isFetchingEpoch === undefined) {
        return (
            <div className={styles.timeline}>
                <ContentLoader className={styles.timeline_content_loader} />
            </div>
        )
    }

    const startDate = DateTime.fromSeconds(epochStore.epochStart || 0).startOf('day')
    const endDate = DateTime.fromSeconds(epochStore.epochEnd || 0).plus({ day: 1 }).endOf('day')
    const days = Math.round(Interval.fromDateTimes(startDate, endDate).length('days'))

    const dates = makeArray(days, idx => {
        const date = idx === 0
            ? startDate
            : startDate.plus({ day: idx })
        return { date, formatted: date.toFormat('yyyy-LL-dd') }
    })

    const start = DateTime.local().startOf('day').toSeconds()
    const now = DateTime.now().toSeconds()
    const current = ((now - start) / SECONDS_IN_DAY) * 100

    return (
        <NativeScrollArea>
            <div className={styles.timeline}>
                <div className={styles.timeline_epoch}>
                    <div className={styles.timeline_calendar}>
                        {dates.map(item => (
                            <div
                                key={item.formatted}
                                className={classNames(styles.timeline_item)}
                                style={{ width: `${100 / days}%` }}
                            >
                                {item.date.startOf('day').equals(DateTime.fromSeconds(start)) && (
                                    <div
                                        className={styles.timeline_cursor}
                                        style={{ left: `${current}%` }}
                                    />
                                )}
                                <div
                                    className={classNames(styles.timeline_item_date, {
                                        [styles.timeline_item__today]: item.date.startOf('day').equals(DateTime.fromSeconds(start)),
                                    })}
                                >
                                    <div className={styles.timeline_item_date_week}>
                                        {item.date.toFormat('EEE', { locale: intl.locale })}
                                    </div>
                                    <div
                                        className={classNames(
                                            styles.timeline_item_date_day,
                                            styles.timeline_item_date_day__epoch,
                                        )}
                                    >
                                        {item.date.toFormat('dd.LL')}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Scale
                        epochEnd={epochStore.epochEnd ?? 0}
                        epochStart={epochStore.epochStart ?? 0}
                        voteEnd={epochStore.voteEnd}
                        voteStart={epochStore.voteStart}
                    />
                </div>
            </div>
        </NativeScrollArea>
    )
}

export const Timeline = observer(TimelineInternal)
