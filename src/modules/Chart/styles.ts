import {
    AreaSeriesPartialOptions,
    AutoscaleInfo,
    BarPrice,
    BusinessDay,
    CandlestickSeriesPartialOptions,
    ChartOptions,
    ColorType,
    DeepPartial,
    HistogramSeriesPartialOptions,
    TickMarkType,
    UTCTimestamp,
} from 'lightweight-charts'
import { DateTime } from 'luxon'

import { formattedAmount } from '@/utils'


export const defaultAutoscaleInfoProvider = (original: () => AutoscaleInfo | null): AutoscaleInfo | null => {
    const res = original()
    return {
        ...res,
        margins: {
            above: 0,
            below: 0,
        },
        priceRange: {
            maxValue: res?.priceRange.maxValue ?? 100,
            minValue: 0,
        },
    }
}

export const chartOptions: DeepPartial<ChartOptions> = {
    crosshair: {
        horzLine: {
            color: 'rgba(255, 255, 255, 0.15)',
            labelBackgroundColor: 'rgba(197, 228, 243, 0.16)',
        },
        mode: 1,
        vertLine: {
            color: 'rgba(255, 255, 255, 0.15)',
            labelBackgroundColor: 'rgba(197, 228, 243, 0.16)',
        },
    },
    grid: {
        horzLines: {
            color: 'rgba(255, 255, 255, 0.05)',
        },
        vertLines: {
            color: 'rgba(255, 255, 255, 0.05)',
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
            color: 'rgba(0, 0, 0, 0)',
            type: ColorType.Solid,
        },
        textColor: '#d9d9d9',
    },
    rightPriceScale: {
        alignLabels: true,
        borderColor: 'rgba(0, 0, 0, 0)',
    },
    timeScale: {
        borderColor: 'rgba(0, 0, 0, 0)',
        fixRightEdge: true,
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
        horzLines: {
            color: 'rgba(255, 255, 255, 0.05)',
        },
        vertLines: {
            color: 'rgba(0, 0, 0, 0)',
        },
    },
    leftPriceScale: {
        borderVisible: false,
    },
    rightPriceScale: {
        borderVisible: false,
    },
}

export const areaStyles: AreaSeriesPartialOptions = {
    autoscaleInfoProvider: defaultAutoscaleInfoProvider,
    bottomColor: 'rgba(197, 228, 243, 0)',
    lineColor: '#c5e4f3',
    lineWidth: 1,
    priceFormat: {
        precision: 2,
        type: 'volume',
    },
    topColor: 'rgba(197, 228, 243, 0.16)',
}

export const candlestickOptions: DeepPartial<ChartOptions> = {
    localization: {
        priceFormatter: (price: BarPrice) => formattedAmount(price, undefined, {
            precision: 1,
        }),
    },
    timeScale: {
        minBarSpacing: 15,
    },
}

export const candlesticksStyles: CandlestickSeriesPartialOptions = {
    borderDownColor: '#eb4361',
    borderUpColor: '#4ab44a',
    downColor: '#eb4361',
    lastValueVisible: true,
    upColor: '#4ab44a',
    wickDownColor: 'rgba(235, 67, 97, 0.5)',
    wickUpColor: 'rgba(74, 180, 74, 0.5)',
}

export const histogramOptions: DeepPartial<ChartOptions> = {
    grid: {
        horzLines: {
            color: 'rgba(255, 255, 255, 0.05)',
        },
        vertLines: {
            color: 'rgba(0, 0, 0, 0)',
        },
    },
    rightPriceScale: {
        borderVisible: false,
    },
}

export const histogramStyles: HistogramSeriesPartialOptions = {
    autoscaleInfoProvider: defaultAutoscaleInfoProvider,
    color: '#c5e4f3',
    priceFormat: {
        precision: 2,
        type: 'volume',
    },
}
