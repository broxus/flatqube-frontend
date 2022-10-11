import * as React from 'react'
import { useIntl } from 'react-intl'

import { FarmingPoolsItemResponse } from '@/modules/Farming/types'
import { useTokensCache } from '@/stores/TokensCacheService'
import { FarmingPair } from '@/modules/Farming/components/FarmingPair'
import { concatSymbols, formattedAmount, parseCurrencyBillions } from '@/utils'
import { TokenIcons } from '@/components/common/TokenIcons'

type Props = {
    item: FarmingPoolsItemResponse;
}

export function FarmingTableListItem({
    item,
}: Props): JSX.Element {
    const intl = useIntl()
    const tokensCache = useTokensCache()

    const nullMessage = intl.formatMessage({
        id: 'FARMING_TABLE_NULL',
    })

    const leftToken = item.left_address && item.right_address ? {
        root: item.left_address,
        icon: tokensCache.get(item.left_address)?.icon,
        name: item.left_currency,
    } : {
        root: item.token_root_address,
        icon: tokensCache.get(item.token_root_address)?.icon,
        name: item.token_root_currency,
    }

    const rightToken = item.right_address ? {
        root: item.right_address,
        icon: tokensCache.get(item.right_address)?.icon,
        name: item.right_currency,
    } : undefined

    const tvl = item.left_address && item.right_address ? item.tvl : null
    const tvlFormatted = tvl ? parseCurrencyBillions(tvl) : undefined

    const share = formattedAmount(item.share, undefined, { preserve: true })

    const aprMin = '10%'
    const aprMax = '20%'

    return (
        <div className="farming-table-list__item">
            <div className="farming-table-list__line">
                <FarmingPair
                    className="farming-table-list__pair"
                    startTime={item.farm_start_time}
                    endTime={item.farm_end_time}
                    pairIcons={{ leftToken, rightToken }}
                    pairLabel={concatSymbols(leftToken.name, rightToken?.name)}
                    balanceWarning={item.is_low_balance}
                />

                <div className="farming-table-list__rewards">
                    <svg
                        width="32" height="24" viewBox="0 0 32 24"
                        fill="none" xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M23 6L29 12M29 12L23 18M29 12H3" stroke="white" strokeOpacity="0.48"
                            strokeWidth="1.6"
                        />
                    </svg>

                    <TokenIcons
                        limit={3}
                        title={intl.formatMessage({ id: 'FARMING_TABLE_REWARDS_TITLE' })}
                        icons={item.reward_token_root_info.map(rewardInfo => ({
                            address: rewardInfo.reward_root_address,
                            root: rewardInfo.reward_root_address,
                            name: rewardInfo.reward_currency,
                            icon: tokensCache.get(rewardInfo.reward_root_address)?.icon,
                        }))}
                    />
                </div>
            </div>

            <div className="farming-table-list__line">
                <div className="farming-table-list__apr">
                    {concatSymbols(aprMin, aprMax, ' – ')}
                </div>
            </div>

            <div className="farming-table-list__line">
                <div className="farming-table-list__label">
                    {intl.formatMessage({
                        id: 'FARMING_TABLE_TVL',
                    })}
                </div>
                <div className="farming-table-list__value">
                    {tvlFormatted ?? nullMessage}
                </div>
            </div>

            <div className="farming-table-list__line">
                <div className="farming-table-list__label">
                    {intl.formatMessage({
                        id: 'FARMING_TABLE_SHARE',
                    })}
                </div>
                <div className="farming-table-list__value">
                    {share ?? nullMessage}
                </div>
            </div>
        </div>
    )
}
