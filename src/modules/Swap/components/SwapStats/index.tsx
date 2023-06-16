import * as React from 'react'
import classNames from 'classnames'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { concatSymbols, debug } from '@/utils'
import { DEFAULT_GRAPH_DATA } from '@/modules/LimitOrders/constants'
import { PairIcons } from '@/components/common/PairIcons'
import { Candlestick } from '@/modules/Charts/Candlestick'
import { useSwapGraphStoreContext } from '@/modules/Swap/context/SwapGraphStoreContext'
import { SwapGraphStoreState } from '@/modules/Swap/stores/SwapGraphStore'
import { Timeframe } from '@/modules/Gauges/api/models'
import { Tabs } from '@/components/common/Tabs'
import { ChartHeader } from '@/components/common/ChartHeader'
import { inversePriceFormatter, priceFormatter } from '@/modules/Charts/helpers'

import './index.scss'

type Props = {
    small?: boolean;
}

/* eslint-disable jsx-a11y/anchor-is-valid */
export function SwapStats({ small }: Props): JSX.Element {
    const swapGraph = useSwapGraphStoreContext()
    const intl = useIntl()

    const toggleTimeframe = (value: SwapGraphStoreState['timeframe']) => () => {
        if (value === swapGraph.timeframe) return
        swapGraph.setData('graphData', DEFAULT_GRAPH_DATA)
        swapGraph.setState('timeframe', value)
    }
    return (
        <div className={classNames('swap-stats__chart', { 'visible@s': !small })}>
            <Observer>
                {() => (
                    <ChartHeader
                        title={(
                            <>
                                <PairIcons
                                    leftToken={swapGraph.leftToken}
                                    rightToken={swapGraph.rightToken}
                                    small
                                />
                                <b>
                                    {concatSymbols(
                                        swapGraph.leftToken?.symbol,
                                        swapGraph.rightToken?.symbol,
                                    )}
                                </b>
                            </>
                        )}
                        rightActions={(
                            <Tabs
                                size="s"
                                type="card"
                                items={[{
                                    active: swapGraph.timeframe === Timeframe.H1,
                                    label: '1H',
                                    onClick: toggleTimeframe(Timeframe.H1),
                                }, {
                                    active: swapGraph.timeframe === Timeframe.D1,
                                    label: '1D',
                                    onClick: toggleTimeframe(Timeframe.D1),
                                }]}
                            />
                        )}
                    />

                )}
            </Observer>

            <Observer>
                {() => {
                    const isFetching = swapGraph.isOhlcvGraphLoading === undefined
                        || swapGraph.isOhlcvGraphLoading
                        || swapGraph.isToggling
                    debug('isOhlcvGraphLoading isFetching swapGraph.isToggling', swapGraph.isOhlcvGraphLoading, isFetching, swapGraph.isToggling)
                    const invertScale = swapGraph.isInvertGraph !== undefined && swapGraph.isInvertGraph
                    const options = {
                        localization: {
                            locale: intl.locale,
                            priceFormatter: invertScale ? inversePriceFormatter : priceFormatter,
                        },
                        rightPriceScale: {
                            invertScale,
                        },
                    }
                    return (
                        <div className="swap-stats__chart-wrapper">
                            <Candlestick
                                key="ohlcvGraph"
                                // eslint-disable-next-line no-nested-ternary
                                data={swapGraph.isInvertGraph === undefined
                                    ? undefined
                                    : swapGraph.isInvertGraph
                                        ? swapGraph.ohlcvGraphInverseData
                                        : swapGraph.ohlcvGraphData}
                                fetch={swapGraph.loadOhlcvGraph}
                                isFetching={isFetching}
                                timeframe={swapGraph.timeframe}
                                options={options}
                            />
                        </div>
                    )
                }}
            </Observer>
        </div>

    )
}
