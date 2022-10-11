import * as React from 'react'
import { useIntl } from 'react-intl'

import { AverageLockTimeUnits } from '@/modules/QubeDao/types'

type Props = {
    units: AverageLockTimeUnits;
}

export function AverageLockTime({ units }: Props): JSX.Element {
    const intl = useIntl()

    switch (true) {
        case units.years > 0:
            return (
                <>
                    {intl.formatMessage(
                        { id: 'QUBE_DAO_STATS_AVERAGE_LOCK_TIME' },
                        {
                            days: 0,
                            hours: 0,
                            minutes: 0,
                            months: units.months.toFixed(0),
                            years: units.years.toFixed(0),
                        },
                    )}
                </>
            )

        case units.months > 0:
            return (
                <>
                    {intl.formatMessage(
                        { id: 'QUBE_DAO_STATS_AVERAGE_LOCK_TIME' },
                        {
                            days: units.days.toFixed(0),
                            hours: 0,
                            minutes: 0,
                            months: units.months.toFixed(0),
                            years: 0,
                        },
                    )}
                </>
            )

        case units.days > 0:
            return (
                <>
                    {intl.formatMessage(
                        { id: 'QUBE_DAO_STATS_AVERAGE_LOCK_TIME' },
                        {
                            days: units.days.toFixed(0),
                            hours: units.hours.toFixed(0),
                            minutes: 0,
                            months: 0,
                            years: 0,
                        },
                    )}
                </>
            )

        case units.hours > 0:
            return (
                <>
                    {intl.formatMessage(
                        { id: 'QUBE_DAO_STATS_AVERAGE_LOCK_TIME' },
                        {
                            days: 0,
                            hours: units.hours.toFixed(0),
                            minutes: units.minutes.toFixed(0),
                            months: 0,
                            years: 0,
                        },
                    )}
                </>
            )

        case units.minutes > 0:
            return (
                <>
                    {intl.formatMessage(
                        { id: 'QUBE_DAO_STATS_AVERAGE_LOCK_TIME' },
                        {
                            days: 0,
                            hours: 0,
                            minutes: units.minutes.toFixed(0),
                            months: 0,
                            years: 0,
                        },
                    )}
                </>
            )

        default:
            return <>—</>
    }
}
