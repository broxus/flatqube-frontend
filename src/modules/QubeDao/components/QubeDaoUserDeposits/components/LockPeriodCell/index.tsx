import * as React from 'react'
import { DateTime } from 'luxon'
import { useIntl } from 'react-intl'


type Props = {
    end: number;
    start: number;
}

export function LockPeriodCell({ end, start }: Props): JSX.Element {
    const intl = useIntl()

    const startDateTime = DateTime.fromSeconds(start)
    const endDateTime = DateTime.fromSeconds(end)
    const diff = endDateTime.diff(startDateTime, ['year', 'months', 'days', 'hours', 'minutes', 'seconds']).toObject()
    const isUndefined = Object.values(diff).every(unit => !unit)

    return (
        <div>
            <div>
                {isUndefined ? '-' : intl.formatMessage({
                    id: 'QUBE_DAO_USER_DEPOSITS_LIST_VALUE_PERIOD_CELL',
                }, {
                    days: diff.days || 0,
                    hours: diff.hours || 0,
                    minutes: diff.minutes || 0,
                    months: diff.months || 0,
                    years: diff.years || 0,
                })}
            </div>
            <div className="text-muted text-sm">
                {`${startDateTime.toFormat('dd.MM.yyyy')} - ${endDateTime.toFormat('dd.MM.yyyy')}`}
            </div>
        </div>
    )
}
