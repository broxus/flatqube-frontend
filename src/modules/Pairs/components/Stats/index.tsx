import * as React from 'react'
import classNames from 'classnames'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { NativeScrollArea } from '@/components/common/NativeScrollArea'
import { TokenIcon } from '@/components/common/TokenIcon'
import { RateChange } from '@/components/common/RateChange'
import { Chart } from '@/modules/Chart'
import { usePairStore } from '@/modules/Pairs/providers/PairStoreProvider'
import { PairStoreState } from '@/modules/Pairs/types'
import { TokenCache } from '@/stores/TokensCacheService'
import { concatSymbols, formattedTokenAmount } from '@/utils'
import { Placeholder } from '@/components/common/Placeholder'

import './index.scss'

type Props = {
    baseToken?: TokenCache;
    counterToken?: TokenCache;
}


/* eslint-disable jsx-a11y/anchor-is-valid */
export function Stats({ baseToken, counterToken }: Props): JSX.Element {
    const intl = useIntl()
    const store = usePairStore()

    const leftLocked = React.useMemo(
        () => formattedTokenAmount(
            store.pair?.leftLocked ?? 0,
            baseToken?.decimals,
        ),
        [baseToken, store.pair?.leftLocked],
    )

    const rightLocked = React.useMemo(
        () => formattedTokenAmount(
            store.pair?.rightLocked ?? 0,
            counterToken?.decimals,
        ),
        [counterToken, store.pair?.rightLocked],
    )

    const toggleGraph = (value: PairStoreState['graph']) => async () => {
        store.changeData('graphData', {
            ohlcv: null,
            tvl: null,
            volume: null,
        })
        store.changeState('graph', value)
    }

    const toggleTimeframe = (value: PairStoreState['timeframe']) => () => {
        store.changeData('graphData', {
            ohlcv: null,
            tvl: null,
            volume: null,
        })
        store.changeState('timeframe', value)
    }

    return (
        <div className="pair-stats">
            <div className="pair-stats__sidebar">
                <div className="pair-stats__sidebar-item">
                    <div className="pair-stats__stat-term">
                        {intl.formatMessage({
                            id: 'PAIR_STATS_TTL_TERM',
                        })}
                    </div>
                    <div className="pair-stats__stat-value">
                        <div className="pair-stats__ttl">
                            <div>
                                {baseToken || store.pair ? (
                                    <>
                                        <div className="pair-stats__token">
                                            <TokenIcon
                                                address={baseToken?.root || store.pair?.meta.baseAddress}
                                                className="pair-stats__token-icon"
                                                name={baseToken?.symbol || store.pair?.meta.base}
                                                size="small"
                                                icon={baseToken?.icon}
                                            />
                                            <div className="pair-stats__token-name">
                                                {baseToken?.symbol || store.pair?.meta.base}
                                            </div>
                                        </div>
                                        <div className="pair-stats__token-locked-value">
                                            {leftLocked}
                                        </div>
                                    </>
                                ) : (
                                    <Placeholder height={24} width={70} />
                                )}
                            </div>
                            <div>
                                {counterToken || store.pair ? (
                                    <>
                                        <div className="pair-stats__token">
                                            <TokenIcon
                                                address={counterToken?.root || store.pair?.meta.counterAddress}
                                                className="pair-stats__token-icon"
                                                name={counterToken?.symbol || store.pair?.meta.counter}
                                                size="small"
                                                icon={counterToken?.icon}
                                            />
                                            <div className="pair-stats__token-name">
                                                {counterToken?.symbol || store.pair?.meta.counter}
                                            </div>
                                        </div>
                                        <div className="pair-stats__token-locked-value">
                                            {rightLocked}
                                        </div>
                                    </>
                                ) : (
                                    <Placeholder height={24} width={70} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pair-stats__sidebar-item">
                    <div className="pair-stats__stat-term">
                        {intl.formatMessage({
                            id: 'PAIR_STATS_TVL_TERM',
                        })}
                    </div>
                    <div className="pair-stats__stat-value">
                        {store.formattedTvl ? (
                            <strong>{store.formattedTvl}</strong>
                        ) : (
                            <Placeholder width={100} />
                        )}
                    </div>
                    {store.pair?.tvlChange !== undefined ? (
                        <RateChange value={store.pair.tvlChange} />
                    ) : (
                        <Placeholder height={20} width={50} />
                    )}
                </div>
                <div className="pair-stats__sidebar-item">
                    <div className="pair-stats__stat-term">
                        {intl.formatMessage({
                            id: 'PAIR_STATS_VOLUME24_TERM',
                        })}
                    </div>
                    <div className="pair-stats__stat-value">
                        {store.formattedVolume24h ? (
                            <strong>{store.formattedVolume24h}</strong>
                        ) : (
                            <Placeholder width={100} />
                        )}
                    </div>
                    {store.pair?.volumeChange24h !== undefined ? (
                        <RateChange value={store.pair.volumeChange24h} />
                    ) : (
                        <Placeholder height={20} width={50} />
                    )}
                </div>
                <div className="pair-stats__sidebar-item">
                    <div className="pair-stats__stat-term">
                        {intl.formatMessage({
                            id: 'PAIR_STATS_FEES24_TERM',
                        })}
                    </div>
                    <div className="pair-stats__stat-value">
                        {store.formattedFees24h ? (
                            <strong>{store.formattedFees24h}</strong>
                        ) : (
                            <Placeholder width={100} />
                        )}
                    </div>
                </div>
            </div>
            <div className="pair-stats__chart">
                <header className="pair-stats__chart-actions">
                    <Observer>
                        {() => (
                            <NativeScrollArea>
                                <ul className="tabs">
                                    <li
                                        className={classNames({
                                            active: store.timeframe === 'D1',
                                        })}
                                    >
                                        <a onClick={toggleTimeframe('D1')}>
                                            D
                                        </a>
                                    </li>
                                    <li
                                        className={classNames({
                                            active: store.timeframe === 'H1',
                                        })}
                                    >
                                        <a onClick={toggleTimeframe('H1')}>H</a>
                                    </li>
                                </ul>
                                <ul className="tabs">
                                    <li
                                        className={classNames({
                                            active: store.graph === 'ohlcv',
                                        })}
                                    >
                                        <a onClick={toggleGraph('ohlcv')}>
                                            {concatSymbols(
                                                baseToken?.symbol || store.pair?.meta.base,
                                                counterToken?.symbol || store.pair?.meta.counter,
                                            )}
                                        </a>
                                    </li>
                                    <li
                                        className={classNames({
                                            active: store.graph === 'ohlcv-inverse',
                                        })}
                                    >
                                        <a onClick={toggleGraph('ohlcv-inverse')}>
                                            {concatSymbols(
                                                counterToken?.symbol || store.pair?.meta.counter,
                                                baseToken?.symbol || store.pair?.meta.base,
                                            )}
                                        </a>
                                    </li>
                                    <li
                                        className={classNames({
                                            active: store.graph === 'volume',
                                        })}
                                    >
                                        <a onClick={toggleGraph('volume')}>
                                            {intl.formatMessage({
                                                id: 'PAIR_GRAPH_TAB_VOLUME',
                                            })}
                                        </a>
                                    </li>
                                    <li
                                        className={classNames({
                                            active: store.graph === 'tvl',
                                        })}
                                    >
                                        <a onClick={toggleGraph('tvl')}>
                                            {intl.formatMessage({
                                                id: 'PAIR_GRAPH_TAB_TVL',
                                            })}
                                        </a>
                                    </li>
                                </ul>
                            </NativeScrollArea>
                        )}
                    </Observer>
                </header>

                <Observer>
                    {() => (
                        <div className="pair-stats__chart-wrapper">
                            {store.graph === 'volume' && (
                                <Chart
                                    key="volumeGraph"
                                    data={store.volumeGraphData}
                                    load={store.loadVolumeGraph}
                                    loading={store.isVolumeGraphLoading}
                                    noDataMessage={intl.formatMessage({
                                        id: 'CHART_NO_DATA',
                                    })}
                                    timeframe={store.timeframe}
                                    type="Histogram"
                                />
                            )}

                            {store.graph === 'tvl' && (
                                <Chart
                                    key="tvlGraph"
                                    data={store.tvlGraphData}
                                    load={store.loadTvlGraph}
                                    loading={store.isTvlGraphLoading}
                                    noDataMessage={intl.formatMessage({
                                        id: 'CHART_NO_DATA',
                                    })}
                                    timeframe={store.timeframe}
                                    type="Area"
                                />
                            )}

                            {store.graph === 'ohlcv' && (
                                <Chart
                                    key="ohlcvGraph"
                                    data={store.ohlcvGraphData}
                                    load={store.loadOhlcvGraph}
                                    loading={store.isOhlcvGraphLoading}
                                    noDataMessage={intl.formatMessage({
                                        id: 'CHART_NO_DATA',
                                    })}
                                    timeframe={store.timeframe}
                                    type="Candlestick"
                                />
                            )}

                            {store.graph === 'ohlcv-inverse' && (
                                <Chart
                                    key="ohlcvInverseGraph"
                                    data={store.ohlcvGraphInverseData}
                                    load={store.loadOhlcvGraph}
                                    loading={store.isOhlcvGraphLoading}
                                    noDataMessage={intl.formatMessage({
                                        id: 'CHART_NO_DATA',
                                    })}
                                    options={{
                                        rightPriceScale: {
                                            invertScale: true,
                                        },
                                    }}
                                    timeframe={store.timeframe}
                                    type="Candlestick"
                                />
                            )}
                        </div>
                    )}
                </Observer>
            </div>
        </div>
    )
}
