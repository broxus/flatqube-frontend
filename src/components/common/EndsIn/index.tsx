import { DateTime } from 'luxon'
import { injectIntl, useIntl } from 'react-intl'
import type { IntlShape } from 'react-intl'


type Props = {
    end: number;
    intl: IntlShape;
}

export function EndsIn({ end }: Props): string {
    const intl = useIntl()

    const diff = DateTime.fromSeconds(end).diffNow([
        'year',
        'months',
        'days',
        'hours',
        'minutes',
        'seconds',
    ]).toObject()

    if (diff.years && diff.years > 0) {
        return intl.formatMessage(
            { id: 'ENDS_IN_YEARS' },
            { years: diff.years.toFixed(0) || 0 },
        )
    }

    if (diff.months && diff.months > 0) {
        return intl.formatMessage(
            { id: 'ENDS_IN_MONTHS' },
            { months: diff.months.toFixed(0) || 0 },
        )
    }

    if (diff.days && diff.days > 0) {
        return intl.formatMessage(
            { id: 'ENDS_IN_DAYS' },
            { days: diff.days.toFixed(0) || 0 },
        )
    }

    if (diff.hours && diff.hours > 0) {
        return intl.formatMessage(
            { id: 'ENDS_IN_HOURS' },
            { hours: diff.hours.toFixed(0) || 0 },
        )
    }

    if (diff.minutes && diff.minutes > 0) {
        return intl.formatMessage(
            { id: 'ENDS_IN_MINUTES' },
            { minutes: diff.minutes.toFixed(0) || 0 },
        )
    }

    if (diff.seconds && diff.seconds > 0) {
        return intl.formatMessage(
            { id: 'ENDS_IN_SECONDS' },
            { seconds: diff.seconds.toFixed(0) || 0 },
        )
    }

    return '—'
}

// @ts-ignore
export const endsIn = injectIntl(EndsIn)
