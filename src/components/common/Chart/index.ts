import * as React from 'react'
import type { IChartApi } from 'lightweight-charts'

import './index.scss'

import { Chart as InternalChart, type ChartProps } from '@/components/common/Chart/Chart'
import { Container } from '@/components/common/Chart/Container'
import {
    type ChartApi,
    ChartApiContext,
    ChartAppearanceContext,
    type SeriesApi,
    SeriesContext,
} from '@/components/common/Chart/Context'
import { Placeholder } from '@/components/common/Chart/Placeholder'
import { Series } from '@/components/common/Chart/Series'

interface Chart
    extends React.MemoExoticComponent<
        React.ForwardRefExoticComponent<ChartProps & React.RefAttributes<IChartApi>>
    > {
    Container: typeof Container
    Placeholder: typeof Placeholder
    Series: typeof Series
}

export {
    type ChartApi,
    ChartApiContext,
    ChartAppearanceContext,
    type ChartProps,
    type SeriesApi,
    SeriesContext,
}

export const Chart = InternalChart as Chart

Chart.Container = Container
Chart.Placeholder = Placeholder
Chart.Series = Series
