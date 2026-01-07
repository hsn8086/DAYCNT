import dayjs from 'dayjs'
import type { CountdownEvent } from '@/stores/types'

export const getTargetDate = (event: CountdownEvent) => {
    let target = dayjs(event.date).startOf('day')
    const now = dayjs().startOf('day')

    if (event.repeat !== 'none' && target.isBefore(now)) {
        while (target.isBefore(now)) {
            if (event.repeat === 'daily') target = target.add(1, 'day')
            else if (event.repeat === 'weekly') target = target.add(1, 'week')
            else if (event.repeat === 'monthly') target = target.add(1, 'month')
            else if (event.repeat === 'yearly') target = target.add(1, 'year')
        }
    }
    return target
}

export const getDiffDays = (event: CountdownEvent) => {
    const target = getTargetDate(event)
    const now = dayjs().startOf('day')
    return target.diff(now, 'day')
}

export const getIsSoon = (event: CountdownEvent) => {
    const target = getTargetDate(event)
    const diffHours = target.diff(dayjs(), 'hour')
    return diffHours >= 0 && diffHours <= 24
}

export const formatTimeDiff = (event: CountdownEvent, format: string) => {
    const target = getTargetDate(event)
    const now = dayjs().startOf('day')
    const diff = target.diff(now, 'day')

    if (format === 'month-day') {
        const totalMonths = Math.abs(target.diff(now, 'month'))
        const remainingDays = Math.abs(target.subtract(target.diff(now, 'month'), 'month').diff(now, 'day'))
        return `${totalMonths}m ${remainingDays}d`
    } else if (format === 'year-month-day') {
        const years = Math.abs(target.diff(now, 'year'))
        const months = Math.abs(target.subtract(target.diff(now, 'year'), 'year').diff(now, 'month'))
        const remainingDays = Math.abs(target.subtract(target.diff(now, 'year'), 'year').subtract(target.subtract(target.diff(now, 'year'), 'year').diff(now, 'month'), 'month').diff(now, 'day'))
        return `${years}y ${months}m ${remainingDays}d`
    }
    return `${Math.abs(diff)}`
}
