import * as React from 'react'
import BigNumber from 'bignumber.js'
import type {
    AreaSeriesPartialOptions,
    IChartApi,
    IPriceLine,
    ISeriesApi,
    LineData,
    MouseEventHandler,
} from 'lightweight-charts'
import { LogicalRangeChangeEventHandler } from 'lightweight-charts'
import { DateTime } from 'luxon'
import { useIntl } from 'react-intl'

import { Checkbox } from '@/components/common/Checkbox'
import { Chart, type ChartProps, SeriesApi } from '@/components/common/Chart'
import { getSeriesDefaultStyle } from '@/components/common/Chart/config'
import { useForceUpdate } from '@/hooks/useForceUpdate'
import { Timeframe } from '@/modules/Charts/types'
import { PoolTokenData } from '@/modules/Pools/stores'
import type { OhlcvBarData } from '@/modules/Pools/types'
import {
    blend,
    debounce,
    error,
    formattedAmount,
    hexToRgba,
    invertColor,
    isGoodBignumber,
    makeArray,
} from '@/utils'

import styles from './index.module.scss'

type Props = {
    currencies: PoolTokenData[];
    data: OhlcvBarData[];
    fetch?: (from: number, to: number) => Promise<void>
    isFetching?: boolean
    options?: ChartProps;
    timeframe: Timeframe
    onVisibleLogicalRangeChange?: LogicalRangeChangeEventHandler
}

type AreaData = LineData & {
    share?: string;
    volume?: string;
    [key: string]: any;
}

type AreasMap = {
    address: string;
    data?: AreaData[];
    enabled: boolean;
    label: string;
    priceLine?: IPriceLine;
    series?: ISeriesApi<'Area'>;
}

const colorsMap = [
    '#69b99c',
    '#c5e4f3',
    '#ad90e9',
    '#e4572e',
    '#17bebb',
    '#ffc914',
    '#47e000',
    '#9448bc',
    '#0D70D3',
    '#C5E4F3',
    '#69B99C',
    '#EFA2C5',
    '#FCF1F1',
    '#AD90E9',
    '#3A458C',
]

function getChartStyles(color: string): AreaSeriesPartialOptions {
    return {
        bottomColor: blend(color, '#191e3e'),
        lineColor: color,
        lineWidth: 2,
        priceLineVisible: false,
        topColor: blend(color, '#191e3e'),
    }
}

const toolTipMargin = 20

export function TvlRatio(props: Props): JSX.Element {
    const intl = useIntl()

    const forceUpdate = useForceUpdate()
    const {
        currencies,
        data,
        fetch,
        isFetching,
        options,
        timeframe,
        onVisibleLogicalRangeChange: onVisibleLogicalRangeChangeCallback,
    } = props

    const areas = React.useRef<AreasMap[]>(currencies.map(currency => (
        {
            address: currency.address,
            enabled: true,
            label: currency.symbol,
            priceLine: undefined,
            series: undefined,
        }
    )))
    const chart = React.useRef<IChartApi>(null)
    const base = React.useRef<SeriesApi<'Area'>>(null)
    const container = React.useRef<HTMLDivElement>(null)
    const tooltip = React.useRef<HTMLDivElement>(null)

    const totalValueLocked = React.useMemo<LineData[]>(() => data?.map(bar => (
        {
            time: bar.time,
            value: bar.tvl,
        }
    )) ?? [], [data])

    const tooltipHandler = React.useCallback<MouseEventHandler>(params => {
        if (!tooltip.current || !container.current) {
            return
        }
        if (
            params.point === undefined
            || !params.time
            || params.point.x < 0
            || params.point.x > container.current.clientWidth
            || params.point.y < 0
            || params.point.y > container.current.clientWidth
        ) {
            tooltip.current.style.display = 'none'
        }
        else {
            const barIndex = totalValueLocked.findIndex(bar => bar.time === params.time)

            const info: [string, string][] = []
            areas.current.forEach(area => {
                if (area.enabled && area.series) {
                    const bar = area.data?.[barIndex]
                    if (bar?.volume && bar.share) {
                        info.push([bar.volume, bar.share])
                    }
                }
            })

            if (info.length === 0) {
                tooltip.current.style.display = 'none'
                return
            }

            tooltip.current.innerHTML = `<div class="${styles.tooltip_wrapper}">
<div class="${styles.tooltip_date}">
${DateTime.fromSeconds(params.time as number ?? 0)
        .toFormat(timeframe === 'D1' ? 'dd.MM.yyyy' : 'dd.MM.yyyy HH:mm')}
</div>
${info.map(([volume, share], i) => (
        `<div class="${styles.tooltip_item}">
                <div class="${styles.tooltip_currency}">
                    <div style="background: ${colorsMap[i]}; height: 8px; width: 8px;"></div>
                    <span>${isGoodBignumber(volume) ? formattedAmount(volume) : 0}</span>
                    <span>${areas.current[i].label}</span>
                </div>
                <div>${isGoodBignumber(share) ? formattedAmount(share) : 0}%</div>
            </div>`
    )).join('')}</div>`

            const { y } = params.point
            let left = params.point.x + toolTipMargin
            if (left > container.current.clientWidth - tooltip.current.clientWidth - 70) {
                left = params.point.x - toolTipMargin - tooltip.current.clientWidth
            }

            let top = y + toolTipMargin
            if (top > container.current.clientHeight - tooltip.current.clientHeight - 80) {
                top = y - tooltip.current.clientHeight - toolTipMargin
            }

            tooltip.current.style.display = 'block'
            tooltip.current.style.left = `${left}px`
            tooltip.current.style.top = `${top}px`
        }
    }, [areas.current, chart.current, tooltip.current, timeframe])

    const onVisibleLogicalRangeChange: LogicalRangeChangeEventHandler = debounce(logicalRange => {
        onVisibleLogicalRangeChangeCallback?.(logicalRange)
        if (logicalRange == null) {
            return
        }
        const barsInfo = base.current?.api().barsInLogicalRange(logicalRange)
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
            fetch?.(from, barsInfo.from * 1000).catch(error)
        }
    }, 50)

    const onSelect = React.useCallback((checked: boolean, value: any) => {
        areas.current = areas.current.map(area => {
            if (area.address === value) {
                area.series?.applyOptions({ visible: checked })
                return { ...area, enabled: checked }
            }
            return area
        })
        forceUpdate()
    }, [areas.current])

    React.useEffect(() => {
        setTimeout(() => {
            chart.current?.timeScale().resetTimeScale()
            chart.current?.timeScale().scrollToRealTime()
        }, 5)
    }, [timeframe])

    React.useEffect(() => {
        areas.current = areas.current.reduceRight<AreasMap[]>((acc, area, idx) => {
            const series = area.series ? area.series : chart.current?.addAreaSeries({
                ...getSeriesDefaultStyle('Area'),
                visible: area.enabled,
            })
            series?.applyOptions({ ...getChartStyles(colorsMap[idx]) })
            acc.unshift({ ...area, series })
            return acc
        }, [])
    }, [chart.current])

    React.useEffect(() => {
        const dataset: AreaData[][] = makeArray(areas.current.length, () => [])
        data?.forEach(datum => {
            const tvlSummary = datum.currencyVolumes.reduce<BigNumber>((acc, value, idx) => {
                if (areas.current[idx].enabled) {
                    return acc.plus(value || 0)
                }
                return acc
            }, new BigNumber(0))
            let prevVolume = new BigNumber(0)
            datum.currencyVolumes.forEach((volume, idx) => {
                const currentVolume = new BigNumber(volume || 0)/*  */
                dataset[idx].push({
                    share: currentVolume.div(isGoodBignumber(tvlSummary) ? tvlSummary : 1)
                        .times(100)
                        .toFixed(),
                    time: datum.time,
                    value: parseFloat(currentVolume.plus(prevVolume).toFixed()),
                    volume,
                    volumes: datum.currencyVolumes,
                })
                if (areas.current[idx].enabled) {
                    prevVolume = prevVolume.plus(volume || 0)
                }
            })
        })

        dataset.forEach((set, idx) => {
            areas.current[idx].data = set
            areas.current[idx].series?.setData(set)
        })
    }, [data, areas.current])

    React.useEffect(() => {
        base.current?.api().priceScale().applyOptions({
            scaleMargins: {
                bottom: 0.025,
                top: 0.1,
            },
        })
    }, [base.current])

    return (
        <div ref={container} className={styles.chart}>
            <div ref={tooltip} className={styles.tooltip} />
            <Chart
                ref={chart}
                crosshair={{
                    horzLine: {
                        labelVisible: false,
                        visible: data.length > 0 && !isFetching,
                    },
                    vertLine: {
                        labelVisible: false,
                        visible: data.length > 0 && !isFetching,
                    },
                }}
                rightPriceScale={{ ticksVisible: false }}
                {...options}
                onCrosshairMove={tooltipHandler}
                onVisibleLogicalRangeChange={
                    data.length === 0 ? undefined : onVisibleLogicalRangeChange
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
                                    ref={base}
                                    data={totalValueLocked}
                                    lastPriceAnimation={0}
                                    type="Area"
                                    visible={false}
                                    {...getChartStyles('#000')}
                                />
                            )
                    }
                })()}
            </Chart>
            <div className={styles.currencies}>
                {areas.current.map((area, idx) => (
                    <Checkbox
                        key={area.address}
                        checked={area.enabled}
                        label={area.label}
                        value={area.address}
                        style={{
                            // @ts-ignore
                            '--checkbox-border': hexToRgba(colorsMap[idx], 48),
                            '--checkbox-checked-background': colorsMap[idx],
                            '--checkbox-checked-border': colorsMap[idx],
                            '--checkbox-icon-color': invertColor(colorsMap[idx], true),
                        }}
                        onChange={onSelect}
                    />
                ))}
            </div>
        </div>
    )
}
