import * as React from 'react'
import type {
    IChartApi,
    LogicalRangeChangeEventHandler,
    SeriesDataItemTypeMap,
} from 'lightweight-charts'
import { useIntl } from 'react-intl'

import { Chart, type ChartProps, type SeriesApi } from '@/components/common/Chart'
import type { Timeframe } from '@/modules/Charts/types'
import { debounce, error } from '@/utils'


type HistogramChartProps = {
    fetch?: (from: number, to: number) => Promise<void>
    data?: SeriesDataItemTypeMap['Histogram'][] | null
    id?: string
    isFetching?: boolean
    options?: ChartProps
    timeframe: Timeframe
}

export const Histogram = React.memo((props: HistogramChartProps) => {
    const intl = useIntl()

    const {
        data,
        id,
        isFetching,
        options,
        timeframe,
    } = props

    const chart = React.useRef<IChartApi>(null)
    const series = React.useRef<SeriesApi<'Histogram'>>(null)

    const onVisibleLogicalRangeChange: LogicalRangeChangeEventHandler = debounce(logicalRange => {
        if (logicalRange == null) {
            return
        }
        const barsInfo = series.current?.api().barsInLogicalRange(logicalRange)
        if (
            barsInfo?.barsBefore !== undefined
            && Math.ceil(barsInfo.barsBefore) < 0
            && barsInfo?.from !== undefined
            && typeof barsInfo.from === 'number'
        ) {
            const from = (
                barsInfo.from + (
                    Math.ceil(barsInfo?.barsBefore) - 2
                ) * (
                    timeframe === 'D1' ? 86400 : 3600
                )
            ) * 1000
            props.fetch?.(from, barsInfo.from * 1000).catch(error)
        }
    }, 50)

    React.useEffect(() => {
        setTimeout(() => {
            chart.current?.timeScale().resetTimeScale()
            chart.current?.timeScale().scrollToRealTime()
        }, 50)
    }, [timeframe])

    React.useEffect(() => {
        chart.current?.timeScale().applyOptions({
            barSpacing: (chart.current?.timeScale().width() ?? 960) / (timeframe === 'D1' ? 30 : 7 * 24),
        })
    }, [chart.current, timeframe])

    React.useEffect(() => {
        series.current?.api().priceScale().applyOptions({
            scaleMargins: {
                bottom: 0.025,
                top: 0.1,
            },
        })
    }, [series.current])

    return (
        <Chart
            id={id}
            ref={chart}
            crosshair={{
                horzLine: { visible: !!data && data.length > 0 && !isFetching },
                vertLine: { visible: !!data && data.length > 0 && !isFetching },
            }}
            timeScale={{ minBarSpacing: 2 }}
            {...options}
            onVisibleLogicalRangeChange={
                data?.length === 0 ? undefined : onVisibleLogicalRangeChange
            }
        >
            {(() => {
                switch (true) {
                    case data?.length === 0 && isFetching:
                        return <Chart.Placeholder />

                    case data?.length === 0 && !isFetching:
                        return (
                            <div className="chart__no-data-message">
                                <div>
                                    {intl.formatMessage({
                                        id: 'CHART_NO_DATA',
                                    })}
                                </div>
                            </div>
                        )

                    default:
                        return (
                            <Chart.Series
                                ref={series}
                                data={data}
                                type="Histogram"
                                visible={!!data && data.length > 0}
                            />
                        )
                }
            })()}
        </Chart>
    )
})
