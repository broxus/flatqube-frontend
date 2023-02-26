import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { NativeScrollArea } from '@/components/common/NativeScrollArea'
import { Placeholder } from '@/components/common/Placeholder'
import { RateChange } from '@/components/common/RateChange'
import { Tabs } from '@/components/common/Tabs'
import { Area } from '@/modules/Charts/Area'
import { usdPriceFormatter } from '@/modules/Charts/helpers'
import { useCurrencyStoreContext } from '@/modules/Currencies/providers'
import type { CurrencyStoreState } from '@/modules/Currencies/stores/CurrencyStore'
import { formattedAmount } from '@/utils'
import { Candlestick } from '@/modules/Charts/Candlestick'
import { Histogram } from '@/modules/Charts/Histogram'

import styles from './index.module.scss'


/* eslint-disable jsx-a11y/anchor-is-valid */
function CurrencyStatsInternal(): JSX.Element {
    const intl = useIntl()
    const currencyStore = useCurrencyStoreContext()

    const fetchGraph = async () => {
        switch (currencyStore.graph) {
            case 'tvl':
                await currencyStore.fetchTvlGraph()
                break

            case 'volume':
                await currencyStore.fetchVolumeGraph()
                break

            case 'prices':
            default:
                await currencyStore.fetchPricesGraph()
        }
    }

    const toggleGraph = (value: CurrencyStoreState['graph']) => async () => {
        if (value === currencyStore.graph) {
            return
        }
        currencyStore.setData('graphs', {
            prices: null,
            tvl: null,
            volume: null,
        })
        currencyStore.setState({
            graph: value,
            isFetchingGraph: false,
        })
        await fetchGraph()
    }

    const toggleTimeframe = (value: CurrencyStoreState['timeframe']) => async () => {
        if (value === currencyStore.timeframe) {
            return
        }
        currencyStore.setData('graphs', {
            prices: null,
            tvl: null,
            volume: null,
        })
        currencyStore.setState({
            isFetchingGraph: false,
            timeframe: value,
        })
        await fetchGraph()
    }

    const isFetching = currencyStore.isFetching === undefined || currencyStore.isFetching
    const isFetchingGraph = currencyStore.isFetchingGraph === undefined || currencyStore.isFetchingGraph

    return (
        <div className={styles.currency_stats}>
            <div className={styles.currency_stats__sidebar}>
                <div className={styles.currency_stats__sidebar_item}>
                    <div className={styles.currency_stats__stat_term}>
                        {intl.formatMessage({
                            id: 'CURRENCY_STATS_TVL_TERM',
                        })}
                    </div>
                    <div className={styles.currency_stats__stat_value}>
                        {isFetching ? (
                            <Placeholder height={28} width={100} />
                        ) : `$${formattedAmount(currencyStore.currency?.tvl ?? 0)}`}
                        <div>
                            {isFetching ? (
                                <Placeholder width={50} />
                            ) : <RateChange value={currencyStore.currency?.tvlChange ?? '0'} />}
                        </div>
                    </div>
                </div>
                <div className={styles.currency_stats__sidebar_item}>
                    <div className={styles.currency_stats__stat_term}>
                        {intl.formatMessage({
                            id: 'CURRENCY_STATS_VOLUME24_TERM',
                        })}
                    </div>
                    <div className={styles.currency_stats__stat_value}>
                        {isFetching ? (
                            <Placeholder width={100} />
                        ) : `$${formattedAmount(currencyStore.currency?.volume24h ?? 0)}`}
                        <div>
                            {isFetching ? (
                                <Placeholder width={50} />
                            ) : <RateChange value={currencyStore.currency?.volumeChange24h ?? '0'} />}
                        </div>
                    </div>
                </div>
                <div className={styles.currency_stats__sidebar_item}>
                    <div className={styles.currency_stats__stat_term}>
                        {intl.formatMessage({
                            id: 'CURRENCY_STATS_VOLUME7_TERM',
                        })}
                    </div>
                    <div className={styles.currency_stats__stat_value}>
                        {isFetching ? (
                            <Placeholder height={28} width={100} />
                        ) : `$${formattedAmount(currencyStore.currency?.volume7d ?? 0)}`}
                    </div>
                </div>
                <div className={styles.currency_stats__sidebar_item}>
                    <div className={styles.currency_stats__stat_term}>
                        {intl.formatMessage({
                            id: 'CURRENCY_STATS_TRANSACTIONS24_TERM',
                        })}
                    </div>
                    <div className={styles.currency_stats__stat_value}>
                        {isFetching ? (
                            <Placeholder height={28} width={100} />
                        ) : formattedAmount(currencyStore.currency?.transactionsCount24h ?? 0)}
                    </div>
                </div>
            </div>
            <div className={styles.currency_stats__chart}>
                <header className={styles.currency_stats__chart_actions}>
                    <NativeScrollArea>
                        {isFetching ? (
                            <>
                                <div>
                                    <Placeholder height={36} width={100} />
                                    &nbsp;
                                    &nbsp;
                                    <Placeholder height={36} width={100} />
                                </div>
                                <Placeholder height={36} width={60} />
                            </>
                        ) : (
                            <>
                                <Tabs
                                    items={[{
                                        active: currencyStore.graph === 'prices',
                                        label: intl.formatMessage({
                                            id: 'CURRENCY_GRAPH_TAB_PRICES',
                                        }),
                                        onClick: toggleGraph('prices'),
                                    }, {
                                        active: currencyStore.graph === 'volume',
                                        label: intl.formatMessage({
                                            id: 'CURRENCY_GRAPH_TAB_VOLUME',
                                        }),
                                        onClick: toggleGraph('volume'),
                                    }, {
                                        active: currencyStore.graph === 'tvl',
                                        label: intl.formatMessage({
                                            id: 'CURRENCY_GRAPH_TAB_TVL',
                                        }),
                                        onClick: toggleGraph('tvl'),
                                    }]} size="s"
                                />
                                <Tabs
                                    items={[{
                                        active: currencyStore.timeframe === 'H1',
                                        label: '1H',
                                        onClick: toggleTimeframe('H1'),
                                    }, {
                                        active: currencyStore.timeframe === 'D1',
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
                    {currencyStore.graph === 'prices' ? (
                        <Candlestick
                            key="pricesGraph"
                            id={`pricesGraph_${currencyStore.timeframe}`}
                            data={currencyStore.pricesGraphData ?? []}
                            fetch={currencyStore.fetchPricesGraph}
                            isFetching={isFetching || isFetchingGraph}
                            options={{
                                localization: {
                                    locale: intl.locale,
                                    priceFormatter: usdPriceFormatter,
                                },
                            }}
                            timeframe={currencyStore.timeframe}
                        />
                    ) : null}

                    {currencyStore.graph === 'volume' ? (
                        <Histogram
                            key="volumeGraph"
                            id={`volumeGraph_${currencyStore.timeframe}`}
                            data={currencyStore.volumeGraphData ?? []}
                            fetch={currencyStore.fetchVolumeGraph}
                            isFetching={isFetching || isFetchingGraph}
                            options={{
                                localization: {
                                    locale: intl.locale,
                                    priceFormatter: usdPriceFormatter,
                                },
                            }}
                            timeframe={currencyStore.timeframe}
                        />
                    ) : null}

                    {currencyStore.graph === 'tvl' ? (
                        <Area
                            key="tvlGraph"
                            id={`tvlGraph_${currencyStore.timeframe}`}
                            data={currencyStore.tvlGraphData ?? []}
                            fetch={currencyStore.fetchTvlGraph}
                            isFetching={isFetching || isFetchingGraph}
                            options={{
                                localization: {
                                    locale: intl.locale,
                                    priceFormatter: usdPriceFormatter,
                                },
                            }}
                            timeframe={currencyStore.timeframe}
                        />
                    ) : null}
                </div>
            </div>
        </div>
    )
}

export const CurrencyStats = observer(CurrencyStatsInternal)
