import * as React from 'react'
import type {
    AutoscaleInfo,
    ISeriesApi,
    SeriesDataItemTypeMap,
    SeriesPartialOptionsMap,
    SeriesType,
} from 'lightweight-charts'

import {
    ChartApiContext,
    ChartAppearanceContext,
    type SeriesApi,
    SeriesContext,
} from '@/components/common/Chart/Context'
import { getChartOptions } from '@/components/common/Chart/config'
import { error } from '@/utils'

type Props<TSeriesType extends SeriesType> = SeriesPartialOptionsMap[TSeriesType] &
    React.PropsWithChildren<{
        data?: SeriesDataItemTypeMap[TSeriesType][] | null
        type: TSeriesType
    }>

const SeriesInternal = React.forwardRef(
    <TSeriesType extends SeriesType>(
        props: Props<TSeriesType>,
        ref?: React.Ref<SeriesApi<TSeriesType>> | undefined,
    ) => {
        const {
            children,
            data,
            type,
            autoscaleInfoProvider,
            priceScaleId = 'right',
            ...restProps
        } = props

        const appearance = React.useContext(ChartAppearanceContext)
        const chart = React.useContext(ChartApiContext)

        const internalSeriesApi = React.useRef<ISeriesApi<SeriesType>>()
        const seriesApi = React.useMemo<SeriesApi<TSeriesType>>(
            () => (
                {
                    api() {
                        if (internalSeriesApi.current === undefined) {
                            if (type === 'Area') {
                                internalSeriesApi.current = chart
                                    .api()
                                    .addAreaSeries(appearance.getSeriesStyle('Area'))
                                chart.api().applyOptions(getChartOptions('Area'))
                            }
                            else if (type === 'Bar') {
                                internalSeriesApi.current = chart
                                    .api()
                                    .addBarSeries(appearance.getSeriesStyle('Bar'))
                                chart.api().applyOptions(getChartOptions('Bar'))
                            }
                            else if (type === 'Baseline') {
                                internalSeriesApi.current = chart
                                    .api()
                                    .addBaselineSeries(appearance.getSeriesStyle('Baseline'))
                                chart.api().applyOptions(getChartOptions('Baseline'))
                            }
                            else if (type === 'Candlestick') {
                                internalSeriesApi.current = chart
                                    .api()
                                    .addCandlestickSeries(appearance.getSeriesStyle('Candlestick'))
                                chart.api().applyOptions(getChartOptions('Candlestick'))
                            }
                            else if (type === 'Histogram') {
                                internalSeriesApi.current = chart
                                    .api()
                                    .addHistogramSeries(appearance.getSeriesStyle('Histogram'))
                                chart.api().applyOptions(getChartOptions('Histogram'))
                            }
                            else if (type === 'Line') {
                                internalSeriesApi.current = chart
                                    .api()
                                    .addLineSeries(appearance.getSeriesStyle('Line'))
                                chart.api().applyOptions(getChartOptions('Line'))
                            }

                            internalSeriesApi.current?.applyOptions(restProps)
                            internalSeriesApi.current?.setData(data ?? [])
                        }
                        return internalSeriesApi.current as ISeriesApi<TSeriesType>
                    },
                    remove() {
                        if (internalSeriesApi.current) {
                            try {
                                chart.api().removeSeries(internalSeriesApi.current)
                            }
                            catch (e) {}
                        }
                    },
                }
            ),
            [type],
        )

        React.useEffect(() => {
            seriesApi.api()
            return () => {
                seriesApi.remove()
                internalSeriesApi.current = undefined
            }
        }, [type])

        React.useLayoutEffect(() => {
            seriesApi.api()
            return () => seriesApi.remove()
        }, [])

        React.useLayoutEffect(() => {
            seriesApi.api().applyOptions({
                autoscaleInfoProvider: (
                    original: () => AutoscaleInfo | null,
                ): AutoscaleInfo | null => (
                    typeof autoscaleInfoProvider === 'function'
                        ? autoscaleInfoProvider(original)
                        : original()
                ),
                ...restProps,
                priceScaleId,
            })
        })

        React.useImperativeHandle(ref, () => seriesApi, [type])

        React.useEffect(() => {
            try {
                if (data) {
                    seriesApi.api().setData(data)
                }
                else {
                    seriesApi.remove()
                }
            }
            catch (e) {
                error(e)
            }
        }, [data])

        return <SeriesContext.Provider value={seriesApi}>{children}</SeriesContext.Provider>
    },
)

export const Series = React.memo(SeriesInternal)

if (process.env.NODE_ENV !== 'production') {
    Series.displayName = 'Series'
    SeriesInternal.displayName = 'Series.Forwarded'
}
