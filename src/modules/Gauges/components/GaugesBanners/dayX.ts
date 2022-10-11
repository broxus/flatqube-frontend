import { DateTime, Duration } from 'luxon'

export const dayX = DateTime.fromFormat('27.10.2022', 'dd.LL.y').toMillis()

export const getDays = (): number => {
    const period = dayX - Date.now()
    if (period > 0) {
        const d = Duration.fromMillis(period)
            .shiftTo('days')
            .toObject()
        return Math.round(d.days as number)
    }
    return 0
}
