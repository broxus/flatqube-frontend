import * as React from 'react'
import { DateTime, Interval } from 'luxon'
import { useIntl } from 'react-intl'

type Props = {
    epochEnd: number;
    epochStart: number;
    voteEnd?: number | null;
    voteStart?: number | null;
}

export function StatusLabel(props: Props): JSX.Element {
    const intl = useIntl()

    const { epochEnd, epochStart, voteEnd, voteStart } = props

    const now = DateTime.local()
    const startDate = DateTime.fromSeconds(epochStart || 0)
    const endDate = DateTime.fromSeconds(epochEnd || 0)
    const voteStartDate = voteStart ? DateTime.fromSeconds(voteStart) : null
    const voteEndDate = voteEnd ? DateTime.fromSeconds(voteEnd) : null

    if (now.toSeconds() < epochStart) {
        return (
            <div className="label label--default">
                {intl.formatMessage({ id: 'QUBE_DAO_EPOCH_STATUS_NOT_STARTED' })}
            </div>
        )
    }

    if (
        (voteStartDate && Interval.fromDateTimes(startDate, voteStartDate).contains(now))
        || (voteStartDate == null && Interval.fromDateTimes(startDate, endDate).contains(now))
    ) {
        return (
            <div className="label label--default">
                {intl.formatMessage({ id: 'QUBE_DAO_EPOCH_STATUS_AWAITING' })}
            </div>
        )
    }

    if (voteStartDate && voteEndDate && Interval.fromDateTimes(voteStartDate, voteEndDate).contains(now)) {
        return (
            <div className="label label--success">
                {intl.formatMessage({ id: 'QUBE_DAO_EPOCH_STATUS_VOTING' })}
            </div>
        )
    }

    if (voteEndDate && Interval.fromDateTimes(voteEndDate, endDate).contains(now)) {
        return (
            <div className="label label--default">
                {intl.formatMessage({ id: 'QUBE_DAO_EPOCH_STATUS_QUEUED' })}
            </div>
        )
    }

    return (
        <div className="label label--default">
            {intl.formatMessage({ id: 'QUBE_DAO_EPOCH_STATUS_FINISHED' })}
        </div>
    )
}
