import * as React from 'react'
import { Link } from 'react-router-dom'
import { useIntl } from 'react-intl'
import BigNumber from 'bignumber.js'

import { Icon } from '@/components/common/Icon'
import { RateChange } from '@/components/common/RateChange'
import { TokenIcons } from '@/components/common/TokenIcons'
import { FarmingPair } from '@/modules/Farming/components/FarmingPair'
import { useTokensCache } from '@/stores/TokensCacheService'
import {
    concatSymbols, formattedAmount, formattedTokenAmount, parseCurrencyBillions,
} from '@/utils'
import { FarmingPoolsItemResponse } from '@/modules/Farming/types'
import { appRoutes } from '@/routes'

import './index.scss'

type Props = {
    item: FarmingPoolsItemResponse;
    vestedRewards?: string[];
    entitledRewards?: string[];
    rewardsLoading?: boolean;
}

export function FarmingTableItem({
    item,
    rewardsLoading,
    ...props
}: Props): JSX.Element {
    const intl = useIntl()
    const tokensCache = useTokensCache()

    const nullMessage = intl.formatMessage({
        id: 'FARMING_TABLE_NULL',
    })

    const leftToken = item.left_address && item.right_address ? {
        icon: tokensCache.get(item.left_address)?.icon,
        name: item.left_currency,
        root: item.left_address,
    } : {
        icon: tokensCache.get(item.token_root_address)?.icon,
        name: item.token_root_currency,
        root: item.token_root_address,
    }

    const rightToken = item.right_address ? {
        icon: tokensCache.get(item.right_address)?.icon,
        name: item.right_currency,
        root: item.right_address,
    } : undefined

    const vestedRewards = item.reward_token_root_info
        .map((rewardInfo, idx) => (props.vestedRewards?.[idx]
            ? `${formattedTokenAmount(
                props.vestedRewards[idx],
                rewardInfo.reward_scale,
            )} ${rewardInfo.reward_currency}`
            : `0 ${rewardInfo.reward_currency}`))

    const entitledRewards = item.reward_token_root_info
        .map((rewardInfo, idx) => (props.entitledRewards?.[idx]
            ? `${formattedTokenAmount(
                props.entitledRewards[idx],
                rewardInfo.reward_scale,
            )} ${rewardInfo.reward_currency}`
            : `0 ${rewardInfo.reward_currency}`))

    const tvl = item.left_address && item.right_address ? item.tvl : null

    const tvlChange = item.left_address && item.right_address ? item.tvl_change : null

    const tvlFormatted = tvl ? parseCurrencyBillions(tvl) : undefined

    const share = formattedAmount(item.share, undefined, { preserve: true })

    const apr = item.apr ? `${new BigNumber(item.apr).decimalPlaces(2).toFixed()}%` : undefined

    return (
        <Link
            className="list__row"
            to={appRoutes.farmingItem.makeUrl({
                address: item.pool_address,
            })}
        >
            <div className="list__cell list__cell--left">
                <FarmingPair
                    startTime={item.farm_start_time}
                    endTime={item.farm_end_time}
                    pairIcons={{ leftToken, rightToken }}
                    pairLabel={concatSymbols(leftToken.name, rightToken?.name)}
                    balanceWarning={item.is_low_balance}
                />
            </div>

            <div className="list__cell list__cell--left">
                <TokenIcons
                    limit={2}
                    title={intl.formatMessage({ id: 'FARMING_TABLE_REWARDS_TITLE' })}
                    icons={item.reward_token_root_info.map(rewardInfo => ({
                        address: rewardInfo.reward_root_address,
                        icon: tokensCache.get(rewardInfo.reward_root_address)?.icon,
                        name: rewardInfo.reward_currency,
                        root: rewardInfo.reward_root_address,
                    }))}
                />
            </div>

            <div
                className="list__cell list__cell--left list__cell--right"
                title={tvlFormatted}
            >
                <div>{tvl === null ? nullMessage : tvlFormatted}</div>
                {tvlChange && (
                    <RateChange
                        size="sm"
                        value={tvlChange}
                        className="farming-table__rate-change"
                    />
                )}
            </div>

            <div
                className="list__cell list__cell--left list__cell--right"
                title={apr}
            >
                <div>{apr ?? nullMessage}</div>
                {item.apr_change && (
                    <RateChange
                        size="sm"
                        value={item.apr_change}
                        className="farming-table__rate-change"
                    />
                )}
            </div>

            <div
                className="list__cell list__cell--left list__cell--right"
                title={share ? `${share}%` : undefined}
            >
                {share ? `${share}%` : nullMessage}
            </div>

            <div className="list__cell list__cell--left list__cell--right">
                {rewardsLoading ? (
                    <Icon
                        icon="loader"
                        ratio={0.6}
                        className="spin farming-table__loading"
                    />
                ) : (
                    vestedRewards.map(reward => (
                        <div key={reward}>{reward}</div>
                    ))
                )}
            </div>

            <div className="list__cell list__cell--left list__cell--right">
                {rewardsLoading ? (
                    <Icon
                        icon="loader"
                        ratio={0.6}
                        className="spin farming-table__loading"
                    />
                ) : (
                    entitledRewards.map(reward => (
                        <div key={reward}>{reward}</div>
                    ))
                )}
            </div>
        </Link>
    )
}
