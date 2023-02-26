import {
    type AreaSeriesPartialOptions,
    type BarSeriesPartialOptions,
    type BaselineSeriesPartialOptions,
    type BusinessDay,
    type CandlestickSeriesPartialOptions,
    type ChartOptions,
    ColorType,
    type DeepPartial,
    type HistogramSeriesPartialOptions,
    LastPriceAnimationMode,
    type LineSeriesPartialOptions, LineType,
    type SeriesPartialOptionsMap,
    type SeriesType,
    TickMarkType,
    type UTCTimestamp,
} from 'lightweight-charts'
import { DateTime } from 'luxon'

import { blend } from '@/utils'

export const chartOptions: DeepPartial<ChartOptions> = {
    crosshair: {
        horzLine: {
            color: 'rgba(255, 255, 255, 0.15)',
            labelBackgroundColor: blend('#c5e4f3', '#191e3e', 0.9),
        },
        vertLine: {
            color: 'rgba(255, 255, 255, 0.15)',
            labelBackgroundColor: blend('#c5e4f3', '#191e3e', 0.9),
        },
    },
    grid: {
        horzLines: {
            color: 'rgba(255, 255, 255, 0.025)',
        },
        vertLines: {
            color: 'rgba(255, 255, 255, 0.025)',
        },
    },
    handleScale: {
        axisDoubleClickReset: true,
        axisPressedMouseMove: {
            price: false,
        },
    },
    layout: {
        background: {
            color: 'transparent',
            type: ColorType.Solid,
        },
        textColor: '#d9d9d9',
    },
    leftPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.05)',
        borderVisible: false,
    },
    rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.05)',
        borderVisible: false,
    },
    timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.05)',
        borderVisible: false,
        fixRightEdge: true,
        rightBarStaysOnScroll: true,
        secondsVisible: false,
        tickMarkFormatter: (time: UTCTimestamp | BusinessDay, tickMarkType: TickMarkType) => {
            let datetime = typeof time === 'number' ? DateTime.fromSeconds(time) : undefined

            if (typeof time === 'object' && !Array.isArray(time)) {
                datetime = DateTime.fromObject(time)
            }

            if (tickMarkType === TickMarkType.Year) {
                return datetime?.toFormat('LLL, yyyy')
            }
            if (tickMarkType === TickMarkType.DayOfMonth) {
                return datetime?.toFormat('ccc, dd')
            }
            if (tickMarkType === TickMarkType.Month) {
                return datetime?.toFormat('LLL, yyyy')
            }
            if (tickMarkType === TickMarkType.Time) {
                return datetime?.toFormat('HH:mm')
            }
            return datetime?.toFormat('ccc, dd')
        },
        timeVisible: true,
    },
}

export const areaOptions: DeepPartial<ChartOptions> = {
    grid: {
        vertLines: {
            visible: false,
        },
    },
    leftPriceScale: {
        scaleMargins: {
            bottom: 0.025,
            top: 0.1,
        },
    },
    rightPriceScale: {
        scaleMargins: {
            bottom: 0.025,
            top: 0.1,
        },
    },
}

export const areaStyles: AreaSeriesPartialOptions = {
    bottomColor: 'rgba(197, 228, 243, 0)',
    crosshairMarkerBackgroundColor: blend('#c5e4f3', '#191e3e', 0.7),
    crosshairMarkerBorderColor: '#c5e4f3',
    lastPriceAnimation: LastPriceAnimationMode.OnDataUpdate,
    lineColor: '#c5e4f3',
    lineType: LineType.Curved,
    lineWidth: 2,
    priceFormat: {
        type: 'volume',
    },
    topColor: 'rgba(197, 228, 243, 0.32)',
}

export const barOptions: DeepPartial<ChartOptions> = {}

export const barsStyles: BarSeriesPartialOptions = {
    downColor: '#eb4361',
    lastValueVisible: true,
    priceFormat: {
        type: 'price',
    },
    thinBars: true,
    upColor: '#4ab44a',
}

export const baselineOptions: DeepPartial<ChartOptions> = {
    grid: {
        vertLines: {
            visible: false,
        },
    },
}

export const baselineStyles: BaselineSeriesPartialOptions = {
    baseLineWidth: 2,
    bottomFillColor1: '#eb436130',
    bottomFillColor2: '#eb436190',
    bottomLineColor: '#eb4361',
    lastPriceAnimation: LastPriceAnimationMode.OnDataUpdate,
    lineType: LineType.Curved,
    lineWidth: 2,
    priceFormat: {
        type: 'volume',
    },
    topFillColor1: '#4ab44a90',
    topFillColor2: '#4ab44a30',
    topLineColor: '#4ab44a',
}

export const candlestickOptions: DeepPartial<ChartOptions> = {}

export const candlesticksStyles: CandlestickSeriesPartialOptions = {
    borderDownColor: '#eb4361',
    borderUpColor: '#4ab44a',
    downColor: '#eb4361',
    priceFormat: {
        type: 'price',
    },
    upColor: '#4ab44a',
    wickDownColor: 'rgba(235, 67, 97, 0.5)',
    wickUpColor: 'rgba(74, 180, 74, 0.5)',
}

export const histogramOptions: DeepPartial<ChartOptions> = {
    leftPriceScale: {
        scaleMargins: {
            bottom: 0.025,
            top: 0.1,
        },
    },
    rightPriceScale: {
        scaleMargins: {
            bottom: 0.025,
            top: 0.1,
        },
    },
}

export const histogramStyles: HistogramSeriesPartialOptions = {
    base: 0,
    color: '#c5e4f3',
    priceFormat: {
        type: 'volume',
    },
}

export const lineOptions: DeepPartial<ChartOptions> = {
    grid: {
        vertLines: {
            visible: false,
        },
    },
}

export const lineStyle: LineSeriesPartialOptions = {
    color: '#c5e4f3',
    crosshairMarkerBackgroundColor: blend('#c5e4f3', '#191e3e', 0.7),
    crosshairMarkerBorderColor: '#c5e4f3',
    lastPriceAnimation: LastPriceAnimationMode.OnDataUpdate,
    lineType: LineType.Curved,
    lineWidth: 2,
    priceFormat: {
        type: 'volume',
    },
}

export const chartOptionsMap: Record<SeriesType, DeepPartial<ChartOptions>> = {
    Area: areaOptions,
    Bar: barOptions,
    Baseline: baselineOptions,
    Candlestick: candlestickOptions,
    Histogram: histogramOptions,
    Line: lineOptions,
} as const

export function getChartOptions<TSeriesType extends SeriesType>(
    type: TSeriesType,
): typeof chartOptionsMap[TSeriesType] {
    return chartOptionsMap[type]
}

export const seriesStylesMap: SeriesPartialOptionsMap = {
    Area: areaStyles,
    Bar: barsStyles,
    Baseline: baselineStyles,
    Candlestick: candlesticksStyles,
    Histogram: histogramStyles,
    Line: lineStyle,
} as const

export function getSeriesDefaultStyle<TSeriesType extends SeriesType>(
    type: TSeriesType,
): typeof seriesStylesMap[TSeriesType] {
    return seriesStylesMap[type]
}
