import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { NativeScrollArea } from '@/components/common/NativeScrollArea'
import { Placeholder } from '@/components/common/Placeholder'
import { RateChange } from '@/components/common/RateChange'
import { Tabs } from '@/components/common/Tabs'
import { TokenAmountBadge } from '@/components/common/TokenAmountBadge'
import { TvlRatio } from '@/modules/Pools/components/Charts/TvlRatio'
import { usePoolStoreContext } from '@/modules/Pools/context'
import { PoolGraphType } from '@/modules/Pools/stores'
import type { PoolStoreState } from '@/modules/Pools/stores'
import { formattedAmount, formattedTokenAmount } from '@/utils'
import { Area } from '@/modules/Charts/Area'
import { Histogram } from '@/modules/Charts/Histogram'
import { inversePriceFormatter, priceFormatter, usdPriceFormatter } from '@/modules/Charts/helpers'
import { Candlestick } from '@/modules/Charts/Candlestick'

import styles from './index.module.scss'

function PoolStatsInternal(): JSX.Element {
    const intl = useIntl()
    const poolStore = usePoolStoreContext()

    const toggleGraph = (value: PoolStoreState['graphType']) => async () => {
        if (value === poolStore.graphType) {
            return
        }
        poolStore.setState('graphType', value)
        poolStore.setData('graph', null)
        await poolStore.fetchGraph()
    }

    const toggleTimeframe = (value: PoolStoreState['timeframe']) => async () => {
        if (value === poolStore.timeframe) {
            return
        }
        poolStore.setState('timeframe', value)
        poolStore.setData('graph', null)
        await poolStore.fetchGraph()
    }

    const isFetching = poolStore.isFetching === undefined || poolStore.isFetching
    const isFetchingGraph = poolStore.isFetchingGraph === undefined || poolStore.isFetchingGraph
    const isSyncingCustomTokens = (poolStore.isSyncingCustomTokens === undefined || poolStore.isSyncingCustomTokens)

    const graphs = [
        {
            active: poolStore.graphType === PoolGraphType.Volume,
            label: intl.formatMessage({ id: 'POOL_GRAPH_TAB_VOLUME' }),
            onClick: toggleGraph(PoolGraphType.Volume),
        },
    ]

    if (poolStore.isNPool) {
        graphs.unshift(
            {
                active: poolStore.graphType === PoolGraphType.TvlRatio,
                label: intl.formatMessage({ id: 'POOL_GRAPH_TAB_TVL_RATIO' }),
                onClick: toggleGraph(PoolGraphType.TvlRatio),
            },
        )
    }
    else {
        const [leftToken, rightToken] = poolStore.tokens
        graphs.unshift(
            {
                active: poolStore.graphType === PoolGraphType.Ohlcv,
                label: [leftToken?.symbol, rightToken?.symbol].join('/') as string,
                onClick: toggleGraph(PoolGraphType.Ohlcv),
            },
            {
                active: poolStore.graphType === PoolGraphType.OhlcvInverse,
                label: [rightToken?.symbol, leftToken?.symbol].join('/') as string,
                onClick: toggleGraph(PoolGraphType.OhlcvInverse),
            },
        )
        graphs.push({
            active: poolStore.graphType === PoolGraphType.Tvl,
            label: intl.formatMessage({ id: 'POOL_GRAPH_TAB_TVL' }),
            onClick: toggleGraph(PoolGraphType.Tvl),
        })
    }

    return (
        <div className={styles.pool_stats}>
            <div className={styles.pool_stats__sidebar}>
                <div className={styles.pool_stats__sidebar_item}>
                    <div className={styles.pool_stats__stat_term}>
                        {intl.formatMessage({ id: 'POOL_STATS_TVL_TERM' })}
                    </div>
                    <div className={styles.pool_stats__stat_value}>
                        {isFetching ? (
                            <Placeholder height={28} width={100} />
                        ) : `$${formattedAmount(poolStore.pool?.tvl ?? 0)}`}
                        <div className={styles.pool_stats__tvl}>
                            {(isFetching || isSyncingCustomTokens) ? (
                                <>
                                    {poolStore.isNPool ? (
                                        <Placeholder height={22} width={100} />
                                    ) : null}
                                    <Placeholder height={22} width={100} />
                                    <Placeholder height={22} width={100} />
                                </>
                            ) : poolStore.tokens.map(token => (
                                <TokenAmountBadge
                                    key={token.address}
                                    address={token.address}
                                    amount={formattedTokenAmount(token.tvl, token.decimals)}
                                    icon={token.icon}
                                    size="xsmall"
                                    symbol={token.symbol}
                                />
                            ))}
                        </div>
                        <div>
                            {isFetching ? (
                                <Placeholder width={50} />
                            ) : <RateChange value={poolStore.pool?.tvlChange ?? '0'} />}
                        </div>
                    </div>
                </div>
                <div className={styles.pool_stats__sidebar_items}>
                    <div className={styles.pool_stats__sidebar_item}>
                        <div className={styles.pool_stats__stat_term}>
                            {intl.formatMessage({ id: 'POOL_STATS_VOLUME24_TERM' })}
                        </div>
                        <div className={styles.pool_stats__stat_value}>
                            {isFetching ? (
                                <Placeholder width={100} />
                            ) : `$${formattedAmount(poolStore.pool?.volume24h ?? 0)}`}
                            <div>
                                {isFetching ? (
                                    <Placeholder width={50} />
                                ) : <RateChange value={poolStore.pool?.volume24hChange ?? '0'} />}
                            </div>
                        </div>
                    </div>
                    <div className={styles.pool_stats__sidebar_item}>
                        <div className={styles.pool_stats__stat_term}>
                            {intl.formatMessage({ id: 'POOL_STATS_VOLUME7_TERM' })}
                        </div>
                        <div className={styles.pool_stats__stat_value}>
                            {isFetching ? (
                                <Placeholder width={100} />
                            ) : `$${formattedAmount(poolStore.pool?.volume7d ?? 0)}`}
                        </div>
                    </div>
                    <div className={styles.pool_stats__sidebar_item}>
                        <div className={styles.pool_stats__stat_term}>
                            {intl.formatMessage({ id: 'POOL_STATS_FEES24_TERM' })}
                        </div>
                        <div className={styles.pool_stats__stat_value}>
                            {isFetching ? (
                                <Placeholder width={100} />
                            ) : `$${formattedAmount(poolStore.pool?.fee24h ?? 0)}`}
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.pool_stats__chart}>
                <header className={styles.pool_stats__chart_actions}>
                    <NativeScrollArea>
                        {isFetching ? (
                            <>
                                <div>
                                    <Placeholder height={36} width={100} />
                                    &nbsp;
                                    &nbsp;
                                    <Placeholder height={36} width={100} />
                                </div>
                                <Placeholder height={33} width={60} />
                            </>
                        ) : (
                            <>
                                <Tabs items={graphs} size="s" />
                                <Tabs
                                    items={[{
                                        active: poolStore.timeframe === 'H1',
                                        label: '1H',
                                        onClick: toggleTimeframe('H1'),
                                    }, {
                                        active: poolStore.timeframe === 'D1',
                                        label: '1D',
                                        onClick: toggleTimeframe('D1'),
                                    }]}
                                    size="s"
                                    type="card"
                                />
                            </>
                        )}
                    </NativeScrollArea>
                </header>

                <div>
                    {poolStore.graphType === PoolGraphType.TvlRatio ? (
                        <TvlRatio
                            key="tvlRatioGraph"
                            currencies={poolStore.tokens}
                            data={poolStore.ohlcvGraphData}
                            fetch={poolStore.fetchGraph}
                            isFetching={isFetching || isSyncingCustomTokens || isFetchingGraph}
                            options={{
                                localization: {
                                    locale: intl.locale,
                                },
                            }}
                            timeframe={poolStore.timeframe}
                        />
                    ) : null}

                    {poolStore.graphType === PoolGraphType.Ohlcv ? (
                        <Candlestick
                            key="ohlcvGraph"
                            id={`ohlcvGraph_${poolStore.timeframe}`}
                            data={poolStore.ohlcvGraphData}
                            fetch={poolStore.fetchGraph}
                            isFetching={isFetching || isSyncingCustomTokens || isFetchingGraph}
                            options={{
                                localization: {
                                    locale: intl.locale,
                                    priceFormatter,
                                },
                            }}
                            timeframe={poolStore.timeframe}
                        />
                    ) : null}

                    {poolStore.graphType === PoolGraphType.OhlcvInverse ? (
                        <Candlestick
                            key="ohlcvInverseGraph"
                            id={`ohlcvInverseGraph_${poolStore.timeframe}`}
                            data={poolStore.ohlcvGraphInverseData}
                            fetch={poolStore.fetchGraph}
                            isFetching={isFetching || isSyncingCustomTokens || isFetchingGraph}
                            options={{
                                localization: {
                                    locale: intl.locale,
                                    priceFormatter: inversePriceFormatter,
                                },
                                rightPriceScale: {
                                    invertScale: true,
                                },
                            }}
                            timeframe={poolStore.timeframe}
                        />
                    ) : null}

                    {poolStore.graphType === PoolGraphType.Volume && (
                        <Histogram
                            key="volumeGraph"
                            id={`volumeGraph_${poolStore.timeframe}`}
                            data={poolStore.volumeGraphData}
                            fetch={poolStore.fetchGraph}
                            isFetching={isFetching || isSyncingCustomTokens || isFetchingGraph}
                            options={{
                                localization: {
                                    locale: intl.locale,
                                    priceFormatter: usdPriceFormatter,
                                },
                            }}
                            timeframe={poolStore.timeframe}
                        />
                    )}

                    {poolStore.graphType === PoolGraphType.Tvl && !poolStore.isNPool && (
                        <Area
                            key="tvlGraph"
                            id={`tvlGraph_${poolStore.timeframe}`}
                            data={poolStore.tvlGraphData}
                            fetch={poolStore.fetchGraph}
                            isFetching={isFetching || isSyncingCustomTokens || isFetchingGraph}
                            options={{
                                localization: {
                                    locale: intl.locale,
                                    priceFormatter: usdPriceFormatter,
                                },
                            }}
                            timeframe={poolStore.timeframe}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

export const PoolStats = observer(PoolStatsInternal)
