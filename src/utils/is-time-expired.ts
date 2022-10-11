import { DateTime } from 'luxon'

export function isTimeExpired(end: number): boolean {
    const now = DateTime.now()
    const diff = DateTime.fromSeconds(end).diff(now, ['year', 'months', 'days', 'hours', 'minutes', 'seconds']).toObject()
    return Object.values(diff).every(unit => !unit || unit <= 0)
}
