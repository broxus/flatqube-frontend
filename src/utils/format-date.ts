import { DateTime } from 'luxon'

const DATE_FORMAT = 'MMM dd, yyyy, HH:mm'

export function formatDate(timestamp: number, format = DATE_FORMAT): string {
    return DateTime.fromMillis(timestamp).toFormat(format)
}

export function formatDateUTC(timestamp: number, format = DATE_FORMAT): string {
    return DateTime.fromMillis(timestamp).toUTC().toFormat(format)
}
