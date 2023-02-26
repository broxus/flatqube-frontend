import * as React from 'react'
import type {
    IChartApi,
    ISeriesApi,
    SeriesPartialOptionsMap,
    SeriesType,
} from 'lightweight-charts'

import { chartOptions, getSeriesDefaultStyle } from '@/components/common/Chart/config'

export interface ChartApi {
    api(): IChartApi

    remove(): void
}

export interface SeriesApi<TSeriesType extends SeriesType> {
    api(): ISeriesApi<TSeriesType>

    remove(): void
}

export const ChartAppearanceContext = React.createContext({
    getDefaultChartOptions() {
        return chartOptions
    },
    getSeriesStyle<TSeriesType extends SeriesType>(
        type: TSeriesType,
    ): SeriesPartialOptionsMap[TSeriesType] {
        return getSeriesDefaultStyle(type)
    },
} as const)

if (process.env.NODE_ENV !== 'production') {
    ChartAppearanceContext.displayName = 'ChartAppearanceContext'
}

export const ChartApiContext = React.createContext<ChartApi>({
    api(): IChartApi {
        throw new Error('Method not implemented')
    },
    remove() {
        throw new Error('Method not implemented')
    },
})

if (process.env.NODE_ENV !== 'production') {
    ChartApiContext.displayName = 'ChartApiContext'
}

export const SeriesContext = React.createContext<SeriesApi<SeriesType>>({
    api<TSeriesType extends SeriesType>(): ISeriesApi<TSeriesType> {
        throw new Error('Method not implemented')
    },
    remove() {
        throw new Error('Method not implemented')
    },
})

if (process.env.NODE_ENV !== 'production') {
    SeriesContext.displayName = 'SeriesContext'
}
