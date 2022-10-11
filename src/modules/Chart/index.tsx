import * as React from 'react'
import classNames from 'classnames'
import type {
    AreaSeriesPartialOptions,
    AutoscaleInfo,
    CandlestickSeriesPartialOptions,
    ChartOptions,
    DeepPartial,
    HistogramSeriesPartialOptions,
    IChartApi,
    ISeriesApi,
    SeriesType,
} from 'lightweight-charts'
import { createChart } from 'lightweight-charts'

import { ContentLoader } from '@/components/common/ContentLoader'
import { useLocalizationContext } from '@/context/Localization'
import {
    areaOptions,
    areaStyles,
    candlestickOptions,
    candlesticksStyles,
    chartOptions,
    histogramOptions,
    histogramStyles,
} from '@/modules/Chart/styles'
import {
    CandlestickGraphShape,
    CommonGraphShape,
    Timeframe,
} from '@/modules/Chart/types'
import { debounce, noop } from '@/utils'

import './index.scss'


type Props = {
    chartStyles?: AreaSeriesPartialOptions | CandlestickSeriesPartialOptions | HistogramSeriesPartialOptions;
    className?: string;
    data: CommonGraphShape[] | CandlestickGraphShape[] | null;
    id?: string;
    load?: (from?: number, to?: number) => Promise<void>;
    loading?: boolean;
    locale?: string;
    noDataMessage?: React.ReactNode;
    options?: DeepPartial<ChartOptions>;
    timeframe: Timeframe;
    type: SeriesType;
}

export type ChartApi = {
    api?: IChartApi;
    series?: ISeriesApi<SeriesType>;
}


export const Chart = React.forwardRef<ChartApi | undefined, Props>((props, ref) => {
    const localization = useLocalizationContext()

    const {
        chartStyles,
        className,
        data,
        id,
        load,
        loading,
        locale,
        noDataMessage,
        options,
        timeframe,
        type,
    } = props

    const mergedLocale = locale ?? localization.locale

    const chartRef = React.useRef<HTMLDivElement | null>(null)
    const chart = React.useRef<IChartApi>()
    const listener = React.useRef<typeof handler>()

    const [series, setSeries] = React.useState<ISeriesApi<SeriesType>>()

    const handler = React.useCallback(debounce(async () => {
        const lr = chart.current?.timeScale().getVisibleLogicalRange()
        if (lr != null) {
            const barsInfo = series?.barsInLogicalRange(lr)
            if (
                barsInfo?.barsBefore !== undefined
                && barsInfo.barsBefore < 0
                && barsInfo?.from !== undefined
                && typeof barsInfo.from === 'number'
            ) {
                await load?.(
                    (barsInfo.from + Math.ceil(barsInfo?.barsBefore) * (timeframe === 'D1' ? 86400 : 3600)) * 1000,
                    barsInfo.from * 1000,
                )
            }
        }
    }, 50), [chart.current, series, timeframe, load])

    const handleResize = React.useCallback(() => {
        if (chart.current != null && chartRef.current != null) {
            chart.current?.resize(
                chartRef.current.clientWidth,
                chartRef.current.clientHeight,
                true,
            )
        }
    }, [chart.current])

    React.useImperativeHandle(ref, () => ({
        api: chart.current,
        series,
    }), [chart.current, series])

    // Listen window resizes
    React.useEffect(() => {
        window.addEventListener('resize', handleResize)
        window.addEventListener('orientationchange', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('orientationchange', handleResize)
        }
    }, [])

    // Create chart and observe resizing
    React.useEffect(() => {
        if (chartRef.current != null) {
            if (chart.current === undefined) {
                chart.current = createChart(chartRef.current, {
                    height: chartRef.current.clientHeight,
                    localization: {
                        locale,
                    },
                    width: chartRef.current.clientWidth,
                })

                chart.current?.applyOptions(chartOptions)

                if (type === 'Area') {
                    chart.current?.applyOptions(areaOptions)
                    setSeries(chart.current?.addAreaSeries(areaStyles))
                }
                else if (type === 'Bar') {
                    setSeries(chart.current?.addBarSeries())
                }
                else if (type === 'Candlestick') {
                    chart.current?.applyOptions(candlestickOptions)
                    setSeries(chart.current?.addCandlestickSeries(candlesticksStyles))
                }
                else if (type === 'Histogram') {
                    chart.current?.applyOptions(histogramOptions)
                    setSeries(chart.current?.addHistogramSeries(histogramStyles))
                }
                else if (type === 'Line') {
                    setSeries(chart.current?.addLineSeries())
                }
                chart.current?.applyOptions({ ...options })
                try {
                    chart.current?.timeScale().resetTimeScale()
                    chart.current?.timeScale().fitContent()
                }
                catch (e) {}
            }

            const resizeObserver = new ResizeObserver(handleResize)
            resizeObserver.observe(chartRef.current)

            return () => {
                resizeObserver.disconnect()
            }
        }
        return noop
    }, [chartRef.current])

    // Apply series styles and chart options
    React.useEffect(() => {
        chart.current?.applyOptions({
            ...options,
            localization: {
                locale: mergedLocale,
                ...options?.localization,
            },
        })
    }, [options])

    React.useEffect(() => {
        chart.current?.applyOptions({
            localization: {
                locale: mergedLocale,
            },
        })
    }, [mergedLocale])

    React.useEffect(() => {
        if (data?.length === 0) {
            (async () => {
                await load?.()
                try {
                    chart.current?.timeScale().resetTimeScale()
                    chart.current?.timeScale().fitContent()
                }
                catch (e) {}
            })()
        }
    }, [data])

    React.useEffect(() => {
        if (chart.current === undefined || data == null) {
            return
        }

        if (listener.current !== undefined) {
            chart.current?.timeScale().unsubscribeVisibleTimeRangeChange(listener.current)
            listener.current = undefined
        }

        let seriesMaxValue: number | undefined

        series?.applyOptions({
            ...chartStyles,
            autoscaleInfoProvider: (original: () => AutoscaleInfo | null): AutoscaleInfo | null => {
                const res = original()
                if (res !== null && seriesMaxValue !== undefined) {
                    if (res.priceRange.maxValue < seriesMaxValue) {
                        res.priceRange.maxValue = seriesMaxValue
                    }
                }
                return res
            },
        })

        series?.setData(data)

        data?.forEach(datum => {
            const { value } = datum as CommonGraphShape
            if (value !== undefined) {
                if (seriesMaxValue !== undefined) {
                    if (seriesMaxValue < value) {
                        seriesMaxValue = value
                    }
                }
                else {
                    seriesMaxValue = value
                }
            }
        })

        listener.current = handler

        chart.current?.timeScale().subscribeVisibleTimeRangeChange(listener.current)
    }, [data, series, timeframe, handler])

    return (
        <div
            ref={chartRef}
            className={classNames('chart', {
                'chart--loading': data?.length === 0 && loading,
                'chart--no-data': data?.length === 0,
            }, className)}
            id={id}
        >
            {(data?.length === 0 && loading) && (
                <ContentLoader />
            )}
            {(noDataMessage !== undefined && data?.length === 0 && !loading) && (
                <div className="chart__no-data-message">
                    {noDataMessage}
                </div>
            )}
        </div>
    )
})
