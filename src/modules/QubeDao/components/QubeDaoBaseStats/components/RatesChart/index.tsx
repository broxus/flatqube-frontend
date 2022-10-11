import * as React from 'react'
import {
    AreaSeriesPartialOptions,
    ChartOptions,
    DeepPartial,
    SingleValueData,
} from 'lightweight-charts'
import { DateTime } from 'luxon'

import { Chart } from '@/modules/Chart'
import type { ChartApi } from '@/modules/Chart'


type Props = {
    chartStyles?: AreaSeriesPartialOptions;
    data: SingleValueData[];
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
    crosshairMarkerVisible:  false,
    priceLineVisible: false,
}

const defaultOptions: DeepPartial<ChartOptions> = {
    crosshair: {
        horzLine: {
            labelVisible: false,
            visible: false,
        },
        vertLine: {
            labelVisible: false,
            visible: false,
        },
    },
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
        tickMarkFormatter: (time: any) => DateTime.fromObject(time).toFormat('EEE'),
    },
}


export function RatesChart({ chartStyles, data, loading, options }: Props): JSX.Element {
    const ref = React.useRef<ChartApi>()

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

    return (
        <Chart
            ref={ref}
            chartStyles={defaultChartStyles}
            data={loading ? [] : data}
            loading={loading}
            options={defaultOptions}
            timeframe="H1"
            type="Area"
        />
    )
}
