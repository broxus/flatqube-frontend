import * as React from 'react'
import type {
    AreaSeriesPartialOptions,
    ChartOptions,
    DeepPartial,
    IChartApi, LineData,
    MouseEventHandler,
    SingleValueData,
} from 'lightweight-charts'
import { DateTime } from 'luxon'

import { Chart, type SeriesApi } from '@/components/common/Chart'
import { blend } from '@/utils'

import styles from './index.module.scss'

type Props = {
    chartStyles?: AreaSeriesPartialOptions;
    data: SingleValueData[];
    legendFormatter?: (value: LineData | undefined) => string;
    loading: boolean;
    options?: DeepPartial<ChartOptions>;
}

export const goodRateStyle: AreaSeriesPartialOptions = {
    bottomColor: 'rgba(74, 180, 74, 0)',
    crosshairMarkerBackgroundColor: blend('#c5e4f3', '#191e3e', 0.7),
    crosshairMarkerBorderColor: '#4AB44A',
    lineColor: '#4AB44A',
    topColor: 'rgba(74, 180, 74, 0.16)',
}

export const badRateStyle: AreaSeriesPartialOptions = {
    bottomColor: 'rgba(235, 67, 97, 0)',
    crosshairMarkerBackgroundColor: blend('#c5e4f3', '#191e3e', 0.7),
    crosshairMarkerBorderColor: '#EB4361',
    crosshairMarkerBorderWidth: 1,
    lineColor: '#EB4361',
    topColor: 'rgba(235, 67, 97, 0.16)',
}

const defaultChartStyles: AreaSeriesPartialOptions = {
    crosshairMarkerVisible: true,
    lastValueVisible: true,
    lineWidth: 1,
    priceLineVisible: false,
}

const defaultOptions: DeepPartial<ChartOptions> = {
    grid: {
        horzLines: { visible: false },
        vertLines: { visible: false },
    },
    handleScale: false,
    handleScroll: false,
    leftPriceScale: {
        borderVisible: false,
        visible: false,
    },
    rightPriceScale: {
        borderVisible: false,
        visible: false,
    },
    timeScale: {
        borderVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
        tickMarkFormatter: (time: any) => DateTime.fromObject(time).toFormat('LLL, dd'),
    },
}


export function RatesChart({
    chartStyles, data, legendFormatter, loading, options,
}: Props): JSX.Element {
    const chart = React.useRef<IChartApi>(null)
    const series = React.useRef<SeriesApi<'Area'>>(null)
    const [legend, setLegend] = React.useState<any>()

    const onCrosshairMove: MouseEventHandler = params => {
        if (series.current) {
            const value = params.seriesData.get(series.current.api()) as LineData
            setLegend(value ? (legendFormatter?.(value) ?? value?.value.toString()) : undefined)
        }
    }

    React.useEffect(() => {
        chart.current?.applyOptions({ ...options })
        series.current?.api().applyOptions({ ...chartStyles })
    }, [chartStyles, loading, options])

    React.useEffect(() => {
        try {
            const dates = data.slice(1, data.length - 1)
            if (dates.length > 1) {
                const from = dates.shift()?.time
                const to = dates.pop()?.time
                if (from && to) {
                    chart.current?.timeScale().setVisibleRange({ from, to })
                }
            }
        }
        catch (e) {}
    }, [data])

    return (
        <div className={styles.chart_wrapper}>
            <div className={styles.chart_wrapper__legend}>
                {legend}
            </div>
            <Chart
                ref={chart}
                {...defaultOptions}
                onCrosshairMove={onCrosshairMove}
            >
                {data.length === 0 && loading && <Chart.Placeholder />}
                <Chart.Series
                    ref={series}
                    data={data}
                    {...defaultChartStyles}
                    type="Area"
                />
            </Chart>
        </div>
    )
}
