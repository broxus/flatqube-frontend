import * as React from 'react'
import classNames from 'classnames'
import { Observer } from 'mobx-react-lite'

import { TokenCache } from '@/stores/TokensCacheService'
import { concatSymbols, debug } from '@/utils'
import { useP2PGraphStoreContext } from '@/modules/LimitOrders/context/P2PGraphStoreContext'
import { P2PGraphStoreState } from '@/modules/LimitOrders/types'
import { DEFAULT_GRAPH_DATA } from '@/modules/LimitOrders/constants'
import { PairIcons } from '@/components/common/PairIcons'
import { OrderBookWrap } from '@/modules/LimitOrders/components/OrderBook'
import { Candlestick } from '@/modules/Charts/Candlestick'
import { Tabs } from '@/components/common/Tabs'
import { ChartHeader } from '@/components/common/ChartHeader'

import './index.scss'

type Props = {
    baseToken?: TokenCache;
    counterToken?: TokenCache;
    small?: boolean;
}


/* eslint-disable jsx-a11y/anchor-is-valid */
export function LimitGraph({ baseToken, counterToken, small }: Props): JSX.Element {
    const p2pGraph = useP2PGraphStoreContext()
    const [orderBookPercent, setOrderBookPercent] = React.useState<number | undefined>(5)
    const toggleGraph = (value: P2PGraphStoreState['graph']) => async () => {
        if (value === p2pGraph.graph) return
        p2pGraph.setData('graphData', DEFAULT_GRAPH_DATA)
        p2pGraph.setState('graph', value)
        if (value === 'ohlcv') {
            p2pGraph.loadOhlcvGraph() // TODO temp fix to load in Chart instead of (load={p2p.loadOhlcvGraph})
        }
    }

    const toggleTimeframe = (value: P2PGraphStoreState['timeframe']) => () => {
        debug('value === p2p.timeframe', value, p2pGraph.timeframe)
        if (value === p2pGraph.timeframe) return
        p2pGraph.setData('graphData', DEFAULT_GRAPH_DATA)
        p2pGraph.setState('timeframe', value)
    }
    return (
        <div className={classNames('limit-stats__chart full-height', { 'visible@s': !small })}>
            <Observer>
                {() => (
                    <ChartHeader
                        title={(
                            <>
                                <PairIcons
                                    leftToken={p2pGraph.leftToken}
                                    rightToken={p2pGraph.rightToken}
                                    small
                                />
                                <b>
                                    {concatSymbols(
                                        baseToken?.symbol,
                                        counterToken?.symbol,
                                    )}
                                </b>
                            </>
                        )}
                        leftActions={(
                            <ul className="tabs">
                                <li
                                    className={classNames({
                                        active: p2pGraph.graph === 'ohlcv',
                                    })}
                                >
                                    <a onClick={toggleGraph('ohlcv')}>Price</a>
                                </li>
                                <li
                                    className={classNames({
                                        active: p2pGraph.graph === 'depth',
                                    })}
                                >
                                    <a onClick={toggleGraph('depth')}>Depth </a>
                                </li>

                            </ul>
                        )}
                        rightActions={(
                            <>
                                {p2pGraph.graph === 'ohlcv'
                                    && (
                                        <Tabs
                                            size="s"
                                            type="card"
                                            items={[{
                                                active: p2pGraph.timeframe === 'H1',
                                                label: '1H',
                                                onClick: toggleTimeframe('H1'),
                                            }, {
                                                active: p2pGraph.timeframe === 'D1',
                                                label: '1D',
                                                onClick: toggleTimeframe('D1'),
                                            }]}
                                        />

                                    )}
                                {p2pGraph.graph === 'depth' && (
                                    <Tabs
                                        size="s"
                                        type="card"
                                        items={[{
                                            active: orderBookPercent === 5,
                                            label: '5%',
                                            onClick: () => setOrderBookPercent(5),
                                        }, {
                                            active: orderBookPercent === 10,
                                            label: '10%',
                                            onClick: () => setOrderBookPercent(10),
                                        }, {
                                            active: orderBookPercent === undefined,
                                            label: 'MAX',
                                            onClick: () => setOrderBookPercent(undefined),
                                        }]}
                                    />
                                )}
                            </>

                        )}
                    />
                )}
            </Observer>

            <div className="limit-stats__chart-wrapper full-height">
                <Observer>
                    {() => {
                        const isDepthGraphLoading = p2pGraph.isDepthGraphLoading === undefined
                            || p2pGraph.isDepthGraphLoading
                            || p2pGraph.tokensCache.isFetching
                            || !p2pGraph.tokensCache.isReady
                        const isValidTokens = p2pGraph.isValidTokens === undefined || p2pGraph.isValidTokens
                        // debug(
                        //     '+++isDepthGraphLoading',
                        //     isDepthGraphLoading,
                        //     isValidTokens,
                        //     p2pGraph.isDepthGraphLoading,
                        //     p2pGraph.tokensCache.isFetching,
                        //     !p2pGraph.tokensCache.isReady,
                        // )
                        return (p2pGraph.graph === 'depth'
                            ? (
                                <OrderBookWrap
                                    orderBookPercent={orderBookPercent}
                                    data={p2pGraph.graphData.depth}
                                    load={p2pGraph.loadDepthGraph}
                                    loading={isDepthGraphLoading && isValidTokens}
                                />
                            )
                            : <> </>
                        )
                    }}
                </Observer>
                <Observer>
                    {() => {
                        const isFetching = p2pGraph.isOhlcvGraphLoading === undefined || p2pGraph.isOhlcvGraphLoading
                        return p2pGraph.graph === 'ohlcv'
                            ? (
                                <Candlestick
                                    key="ohlcvGraph"
                                    data={p2pGraph.ohlcvGraphData}
                                    fetch={p2pGraph.loadOhlcvGraph}
                                    isFetching={isFetching}
                                    timeframe={p2pGraph.timeframe}
                                />
                            )
                            : <> </>
                    }}
                </Observer>
            </div>
        </div>

    )
}
