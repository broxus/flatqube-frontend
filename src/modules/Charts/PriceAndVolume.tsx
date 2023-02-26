import * as React from 'react'
import type { IChartApi, LogicalRangeChangeEventHandler, PriceFormatterFn } from 'lightweight-charts'

import { Chart, type ChartProps, type SeriesApi } from '@/components/common/Chart'
import { usdPriceFormatter } from '@/modules/Charts/helpers'
import type { OhlcvData, Timeframe } from '@/modules/Charts/types'
import { debounce, error } from '@/utils'


type PriceAndVolumeChartProps = {
    fetch?: (from: number, to: number) => Promise<void>
    candlesPriceFormatter?: PriceFormatterFn
    data: OhlcvData[]
    isFetching?: boolean
    options?: ChartProps
    timeframe: Timeframe
}

export const PriceAndVolume = React.memo((props: PriceAndVolumeChartProps) => {
    const {
        candlesPriceFormatter = usdPriceFormatter,
        data,
        isFetching,
        options,
        timeframe,
    } = props

    const chart = React.useRef<IChartApi>(null)
    const candles = React.useRef<SeriesApi<'Candlestick'>>(null)
    const volume = React.useRef<SeriesApi<'Histogram'>>(null)

    const onVisibleLogicalRangeChange: LogicalRangeChangeEventHandler = debounce(logicalRange => {
        if (logicalRange == null) {
            return
        }
        const barsInfo = candles.current?.api().barsInLogicalRange(logicalRange)
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
        }, 5)
    }, [timeframe])

    React.useEffect(() => {
        chart.current?.timeScale().applyOptions({
            barSpacing: (chart.current?.timeScale().width() ?? 960) / (timeframe === 'D1' ? 30 : 7 * 24),
        })
    }, [chart.current, timeframe])

    React.useEffect(() => {
        candles.current?.api().priceScale().applyOptions({
            scaleMargins: {
                bottom: 0.5,
                top: 0.1,
            },
        })
        volume.current?.api().priceScale().applyOptions({
            scaleMargins: {
                bottom: 0.025,
                top: 0.6,
            },
        })
    }, [candles.current, volume.current])

    return (
        <Chart
            ref={chart}
            crosshair={{
                horzLine: { visible: data.length > 0 && !isFetching },
                vertLine: { visible: data.length > 0 && !isFetching },
            }}
            leftPriceScale={{ visible: true }}
            timeScale={{ minBarSpacing: 2 }}
            {...options}
            onVisibleLogicalRangeChange={
                data.length === 0 ? undefined : onVisibleLogicalRangeChange
            }
        >
            {data.length === 0 && isFetching && <Chart.Placeholder />}
            <Chart.Series
                ref={volume}
                data={data.map(d => (
                    { time: d.time, value: d.volume }
                ))}
                priceFormat={{
                    formatter: usdPriceFormatter,
                    type: 'custom',
                }}
                priceScaleId="left"
                type="Histogram"
                visible={data.length > 0}
            />
            <Chart.Series
                ref={candles}
                data={data}
                priceFormat={{
                    formatter: candlesPriceFormatter,
                    type: 'custom',
                }}
                priceScaleId="right"
                type="Candlestick"
                visible={data.length > 0}
            />
        </Chart>
    )
})
