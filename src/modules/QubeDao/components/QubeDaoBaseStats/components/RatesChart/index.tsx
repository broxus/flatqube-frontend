import * as React from 'react'
import {
    AreaSeriesPartialOptions, BarPrice, BarPrices,
    ChartOptions,
    DeepPartial,
    SingleValueData,
} from 'lightweight-charts'
import { DateTime } from 'luxon'

import { Chart } from '@/modules/Chart'
import type { ChartApi } from '@/modules/Chart'

import styles from './index.module.scss'

type Props = {
    chartStyles?: AreaSeriesPartialOptions;
    data: SingleValueData[];
    legendFormatter?: (value: BarPrice | BarPrices | undefined) => string;
    loading: boolean;
    options?: DeepPartial<ChartOptions>;
}

export const goodRateStyle = {
    bottomColor: 'rgba(74, 180, 74, 0)',
    lineColor: '#4AB44A',
    topColor: 'rgba(74, 180, 74, 0.16)',
}

export const badRateStyle = {
    bottomColor: 'rgba(235, 67, 97, 0)',
    lineColor: '#EB4361',
    topColor: 'rgba(235, 67, 97, 0.16)',
}

const defaultChartStyles: AreaSeriesPartialOptions = {
    crosshairMarkerVisible:  true,
    lastValueVisible: true,
    priceLineVisible: false,
}

const defaultOptions: DeepPartial<ChartOptions> = {
    grid: {
        horzLines: {
            visible: false,
        },
        vertLines: {
            visible: false,
        },
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


export function RatesChart({ chartStyles, data, legendFormatter, loading, options }: Props): JSX.Element {
    const ref = React.useRef<ChartApi>()
    const [legend, setLegend] = React.useState<any>()


    React.useEffect(() => {
        try {
            const dates = data.slice(1, data.length - 1)
            if (dates.length > 1) {
                const from = dates.shift()?.time
                const to = dates.pop()?.time
                if (from && to) {
                    ref.current?.api?.timeScale().setVisibleRange({
                        from,
                        to,
                    })
                }
            }
        }
        catch (e) {

        }
    }, [data])
    React.useEffect(() => {
        ref.current?.api?.applyOptions({ ...options })
        ref.current?.series?.applyOptions({ ...chartStyles })
    }, [chartStyles, loading, options])
    React.useEffect(() => {
        ref.current?.api?.subscribeCrosshairMove(params => {
            if (ref.current?.series) {
                const value = params.seriesPrices.get(ref.current.series)
                setLegend(value ? (legendFormatter?.(value) ?? value?.toString()) : undefined)
            }
        })
        return () => {
            ref.current?.api?.unsubscribeCrosshairMove(() => {
                setLegend(undefined)
            })
        }
    }, [ref.current])

    return (
        <div className={styles.chart_wrapper}>
            <div className={styles.chart_wrapper__legend}>
                {legend}
            </div>
            <Chart
                ref={ref}
                chartStyles={defaultChartStyles}
                data={loading ? [] : data}
                loading={loading}
                options={defaultOptions}
                timeframe="H1"
                type="Area"
            />
        </div>
    )
}
