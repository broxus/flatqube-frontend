import * as React from 'react'
import BigNumber from 'bignumber.js'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { Icon } from '@/components/common/Icon'
import { Tooltip } from '@/components/common/Tooltip'
import { formatDateUTC } from '@/utils'
import { useTokensCache } from '@/stores/TokensCacheService'
import { useFarmingDataStore } from '@/modules/Farming/stores/FarmingDataStore'
import { Placeholder } from '@/components/common/Placeholder'

export function FarmingVestingInner(): JSX.Element {
    const intl = useIntl()
    const tokensCache = useTokensCache()
    const farmingData = useFarmingDataStore()
    const ratioRef = React.useRef<HTMLDivElement | null>(null)
    const periodRef = React.useRef<HTMLDivElement | null>(null)
    const untilRef = React.useRef<HTMLDivElement | null>(null)
    const nullMessage = intl.formatMessage({
        id: 'FARMING_VESTING_NULL',
    })
    const rewardTokens = (farmingData.rewardTokensAddress || []).map(root => tokensCache.get(root))

    return (
        <div className="farming-panel">
            <h2 className="farming-panel__title">
                {intl.formatMessage({
                    id: 'FARMING_VESTING_TITLE',
                })}
            </h2>
            <div className="farming-map">
                <div className="farming-map__item">
                    <div className="farming-map__label">
                        {intl.formatMessage({
                            id: 'FARMING_VESTING_RATIO_TITLE',
                        })}
                        <div className="farming-map__info" ref={ratioRef}>
                            <Icon icon="infoFill" />
                        </div>
                        <Tooltip target={ratioRef} alignY="top" width={270}>
                            {intl.formatMessage({
                                id: 'FARMING_VESTING_RATIO_HINT',
                            })}
                        </Tooltip>
                    </div>
                    <div className="farming-map__value">
                        {farmingData.hasBaseData ? (
                            <>
                                {farmingData.vestingRatio === undefined
                                    ? nullMessage
                                    : intl.formatMessage({
                                        id: 'FARMING_VESTING_RATIO_VALUE',
                                    }, {
                                        value: new BigNumber(farmingData.vestingRatio)
                                            .div(10)
                                            .decimalPlaces(1, BigNumber.ROUND_DOWN)
                                            .toFixed(),
                                    })}
                            </>
                        ) : (
                            <Placeholder width={120} />
                        )}
                    </div>
                </div>

                <div className="farming-map__item">
                    <div className="farming-map__label">
                        {intl.formatMessage({
                            id: 'FARMING_VESTING_PERIOD_TITLE',
                        })}
                        <div className="farming-map__info" ref={periodRef}>
                            <Icon icon="infoFill" />
                        </div>
                        <Tooltip target={periodRef} alignY="top" width={270}>
                            {intl.formatMessage({
                                id: 'FARMING_VESTING_PERIOD_HINT',
                            })}
                        </Tooltip>
                    </div>
                    <div className="farming-map__value">
                        {farmingData.hasBaseData ? (
                            <>
                                {farmingData.vestingPeriodDays === undefined
                                    ? nullMessage
                                    : intl.formatMessage({
                                        id: 'FARMING_VESTING_PERIOD_VALUE',
                                    }, {
                                        days: farmingData.vestingPeriodDays,
                                    })}
                            </>
                        ) : (
                            <Placeholder width={120} />
                        )}
                    </div>
                </div>

                <div className="farming-map__item">
                    <div className="farming-map__label">
                        {intl.formatMessage({
                            id: 'FARMING_VESTING_VESTING_UNTIL',
                        })}

                        <div className="farming-map__info" ref={untilRef}>
                            <Icon icon="infoFill" />
                        </div>

                        <Tooltip target={untilRef} alignY="top" width={270}>
                            {intl.formatMessage({
                                id: 'FARMING_VESTING_VESTING_HINT',
                            })}
                        </Tooltip>
                    </div>

                    <div className="farming-map__value">
                        {farmingData.hasBaseData ? (
                            <>
                                {farmingData.vestingTime ? (
                                    <div>
                                        {[...new Set(farmingData.vestingTime)].length > 1 ? (
                                            rewardTokens.map((token, index) => (
                                                token && farmingData.vestingTime && (
                                                    <div key={token.root}>
                                                        {intl.formatMessage({
                                                            id: 'FARMING_VESTING_VESTING_TOKEN_DATE',
                                                        }, {
                                                            token: token.symbol,
                                                            date: formatDateUTC(farmingData.vestingTime[index]),
                                                        })}
                                                    </div>
                                                )
                                            ))
                                        ) : (
                                            formatDateUTC(farmingData.vestingTime[0])
                                        )}
                                    </div>
                                ) : nullMessage}
                            </>
                        ) : (
                            <Placeholder width={120} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export const FarmingVesting = observer(FarmingVestingInner)
