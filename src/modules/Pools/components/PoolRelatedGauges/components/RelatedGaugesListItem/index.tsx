import * as React from 'react'
import { Observer } from 'mobx-react-lite'

import { Placeholder } from '@/components/common/Placeholder'
import { RateChange } from '@/components/common/RateChange'
import { TokenAmountBadge } from '@/components/common/TokenAmountBadge'
import { TokenIcons } from '@/components/common/TokenIcons'
import { GaugeStatus, GaugeTokensBadge } from '@/modules/Pools/components/PoolsCommon'
import { usePoolStoreContext } from '@/modules/Pools/context'
import type { GaugeItem } from '@/modules/Pools/types'
import { formattedAmount, makeArray, uniqueId } from '@/utils'

type Props = {
    gauge: GaugeItem;
}

export function RelatedGaugesListItem({ gauge }: Props): JSX.Element {
    const poolStore = usePoolStoreContext()

    const items = React.useMemo(() => gauge.poolTokens.map(poolToken => {
        const token = poolStore.tokensCache.get(poolToken.tokenRoot)
        return {
            address: poolToken.tokenRoot,
            icon: token?.icon,
            symbol: token?.symbol ?? poolToken.tokenSymbol,
        }
    }), [gauge.poolTokens])

    const rewards = React.useMemo(() => gauge.rewardTokens.map(rewardToken => {
        const token = poolStore.tokensCache.get(rewardToken.tokenRoot)
        return {
            address: rewardToken.tokenRoot,
            decimals: token?.decimals,
            icon: token?.icon,
            lockedReward: rewardToken.lockedReward,
            symbol: token?.symbol ?? rewardToken.tokenSymbol,
            unlockedReward: rewardToken.unlockedReward,
        }
    }), [gauge.rewardTokens])

    return (
        <div className="list__row">
            <div className="list__cell list__cell--left">
                <div className="list__cell-inner">
                    <GaugeStatus gauge={gauge} />
                    <GaugeTokensBadge
                        gaugeAddress={gauge.address}
                        items={items}
                    />
                </div>
            </div>
            <div className="list__cell list__cell--left">
                <TokenIcons icons={rewards} />
            </div>
            <div className="list__cell list__cell--right">
                <div>{`$${formattedAmount(gauge.tvl)}`}</div>
                <RateChange size="sm" value={formattedAmount(gauge.tvlChange)} />
            </div>
            <div className="list__cell list__cell--right">
                <div>{`${formattedAmount(gauge.minApr)}%`}</div>
                <RateChange size="sm" value={formattedAmount(gauge.minAprChange)} />
            </div>
            <div className="list__cell list__cell--right">
                <div>{`${formattedAmount(gauge.maxApr)}%`}</div>
                <RateChange size="sm" value={formattedAmount(gauge.maxAprChange)} />
            </div>
            <Observer>
                {() => (
                    <>
                        <div className="list__cell list__cell--right">
                            {gauge.isSyncing ? (
                                <Placeholder height={20} width={50} />
                            ) : `${formattedAmount(gauge.userShare)}%`}
                        </div>
                        <div className="list__cell list__cell--right">
                            {gauge.isSyncing ? (
                                <div className="list__cell-inner--stack">
                                    {makeArray(rewards.length, uniqueId).map(key => (
                                        <Placeholder key={key} height={20} width={50} />
                                    ))}
                                </div>
                            ) : rewards.map(token => (
                                <TokenAmountBadge
                                    key={token.address}
                                    amount={formattedAmount(token.unlockedReward, token.decimals)}
                                    className="text-right width-expand"
                                    size="xsmall"
                                    symbol={token.symbol}
                                />
                            ))}
                        </div>
                        <div className="list__cell list__cell--right" data-sync={gauge.isSyncing}>
                            {gauge.isSyncing ? (
                                <div className="list__cell-inner--stack">
                                    {makeArray(rewards.length, uniqueId).map(key => (
                                        <Placeholder key={key} height={20} width={50} />
                                    ))}
                                </div>
                            ) : rewards.map(token => (
                                <TokenAmountBadge
                                    key={token.address}
                                    amount={formattedAmount(token.lockedReward, token.decimals)}
                                    className="text-right width-expand"
                                    size="xsmall"
                                    symbol={token.symbol}
                                />
                            ))}
                        </div>
                    </>
                )}
            </Observer>
        </div>
    )
}
