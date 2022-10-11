import * as React from 'react'
import { useHistory, useLocation } from 'react-router-dom'

import { GaugesFilters } from '@/modules/Gauges/types'

export type GaugesLocationFilters = {
    filters: GaugesFilters;
    set: (value: GaugesFilters) => void;
}

const filterKeys = {
    aprMaxFrom: 'apr-max-from',
    aprMaxTo: 'apr-max-to',
    aprMinFrom: 'apr-min-from',
    aprMinTo: 'apr-min-to',
    isLowBalance: 'low-balance',
    tvlFrom: 'tvl-from',
    tvlTo: 'tvl-to',
} as const

const makeKey = (prefix: string, key: string) => `${prefix ? `${prefix}-` : ''}${key}`

export function useGaugesLocationFilters(prefix = ''): GaugesLocationFilters {
    const location = useLocation()
    const history = useHistory()

    const searchParams = React.useMemo(
        () => new URLSearchParams(location.search),
        [location.search],
    )

    const filters = React.useMemo(
        () => [...searchParams.entries()]
            .reduce<GaugesFilters>((acc, [key, value]) => {
                switch (key) {
                    case makeKey(prefix, filterKeys.isLowBalance):
                        return {
                            ...acc,
                            isLowBalance: value === 'true',
                        }
                    case makeKey(prefix, filterKeys.aprMaxFrom):
                        return {
                            ...acc,
                            aprMaxFrom: value,
                        }
                    case makeKey(prefix, filterKeys.aprMaxTo):
                        return {
                            ...acc,
                            aprMaxTo: value,
                        }
                    case makeKey(prefix, filterKeys.aprMinFrom):
                        return {
                            ...acc,
                            aprMinFrom: value,
                        }
                    case makeKey(prefix, filterKeys.aprMinTo):
                        return {
                            ...acc,
                            aprMinTo: value,
                        }
                    case makeKey(prefix, filterKeys.tvlFrom):
                        return {
                            ...acc,
                            tvlFrom: value,
                        }
                    case makeKey(prefix, filterKeys.tvlTo):
                        return {
                            ...acc,
                            tvlTo: value,
                        }
                    default:
                        return acc
                }
            }, {}),
        [searchParams],
    )

    const set = React.useMemo(
        () => (value: GaugesFilters) => {
            const nextSearchParams = new URLSearchParams(location.search)

            Object.entries(filters).forEach(([key]) => {
                nextSearchParams.delete(
                    makeKey(prefix, filterKeys[key as keyof GaugesFilters]),
                )
            })

            Object.entries(value).forEach(([key, val]) => {
                if (value[key as keyof GaugesFilters]) {
                    nextSearchParams.set(
                        makeKey(prefix, filterKeys[key as keyof GaugesFilters]),
                        val.toString(),
                    )
                }
                else {
                    nextSearchParams.delete(
                        makeKey(prefix, filterKeys[key as keyof GaugesFilters]),
                    )
                }
            })

            history.replace({ search: nextSearchParams.toString() })
        },
        [filters, location.search, history],
    )

    return React.useMemo(
        () => ({
            filters,
            set,
        }),
        [filters, set],
    )
}
