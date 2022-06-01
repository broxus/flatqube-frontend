import BigNumber from 'bignumber.js'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { TokenIcon } from '@/components/common/TokenIcon'
import { useTokensCache } from '@/stores/TokensCacheService'
import { useFarmingDataStore } from '@/modules/Farming/stores/FarmingDataStore'
import { Placeholder } from '@/components/common/Placeholder'
import {
    formatDateUTC, formattedAmount,
    formattedTokenAmount,
    parseCurrencyBillions,
    shareAmount,
} from '@/utils'

import './index.scss'

function FarmingUserInfoInner() {
    const intl = useIntl()
    const tokensCache = useTokensCache()
    const farmingData = useFarmingDataStore()
    const leftToken = farmingData.leftTokenAddress && tokensCache.get(farmingData.leftTokenAddress)
    const rightToken = farmingData.rightTokenAddress && tokensCache.get(farmingData.rightTokenAddress)
    const rewardTokens = farmingData.rewardTokensAddress?.map(root => tokensCache.get(root))
    const nullMessage = intl.formatMessage({
        id: 'FARMING_USER_INFO_NULL',
    })
    const hasDebt = (farmingData.userPendingRewardDebt ?? []).findIndex(amount => (
        new BigNumber(amount).isGreaterThan(0)
    )) > -1

    return (
        <div className="farming-user-info">
            <div className="farming-panel">
                <div className="farming-panel__rows">
                    <div>
                        <div className="farming-panel__label">
                            {intl.formatMessage({
                                id: 'FARMING_USER_INFO_FARMING_BALANCE',
                            })}
                        </div>
                        <div className="farming-panel__value">
                            {farmingData.userUsdtBalance === undefined ? (
                                <Placeholder width={150} />
                            ) : (
                                <>
                                    {farmingData.userUsdtBalance === null
                                        ? nullMessage
                                        : parseCurrencyBillions(farmingData.userUsdtBalance)}
                                </>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="farming-panel__label">
                            {intl.formatMessage({
                                id: 'FARMING_USER_INFO_TOKENS',
                            })}
                        </div>
                        {
                            leftToken
                            && rightToken
                            && farmingData.pairBalanceLp
                            && farmingData.pairBalanceRight
                            && farmingData.pairBalanceLeft
                            && farmingData.userLpFarmingAmount
                                ? (
                                    <>
                                        <div className="farming-panel__token">
                                            <TokenIcon
                                                size="xsmall"
                                                icon={leftToken.icon}
                                                address={leftToken.root}
                                            />
                                            {intl.formatMessage({
                                                id: 'FARMING_TOKEN',
                                            }, {
                                                amount: formattedTokenAmount(shareAmount(
                                                    farmingData.userLpFarmingAmount,
                                                    farmingData.pairBalanceLeft,
                                                    farmingData.pairBalanceLp,
                                                    leftToken.decimals,
                                                )),
                                                symbol: leftToken.symbol,
                                            })}
                                        </div>
                                        <div className="farming-panel__token">
                                            <TokenIcon
                                                size="xsmall"
                                                icon={rightToken.icon}
                                                address={rightToken.root}
                                            />
                                            {intl.formatMessage({
                                                id: 'FARMING_TOKEN',
                                            }, {
                                                amount: formattedTokenAmount(shareAmount(
                                                    farmingData.userLpFarmingAmount,
                                                    farmingData.pairBalanceRight,
                                                    farmingData.pairBalanceLp,
                                                    rightToken.decimals,
                                                )),
                                                symbol: rightToken.symbol,
                                            })}
                                        </div>
                                    </>
                                )
                                : (
                                    <>
                                        <div className="farming-panel__token">
                                            <Placeholder width={120} />
                                        </div>
                                        <div className="farming-panel__token">
                                            <Placeholder width={120} />
                                        </div>
                                    </>
                                )
                        }
                    </div>

                    <div>
                        <div className="farming-panel__label">
                            {intl.formatMessage({
                                id: 'FARMING_USER_INFO_LP_TOKENS',
                            }, {
                                symbol: farmingData.lpTokenSymbol,
                            })}
                        </div>
                        {farmingData.userLpFarmingAmount ? (
                            formattedTokenAmount(
                                farmingData.userLpFarmingAmount,
                                farmingData.lpTokenDecimals,
                            )
                        ) : (
                            <Placeholder width={100} />
                        )}
                    </div>

                    <div>
                        <div className="farming-panel__label">
                            {intl.formatMessage({
                                id: 'FARMING_USER_INFO_SHARE',
                            })}
                        </div>
                        {farmingData.userShare ? (
                            intl.formatMessage({
                                id: 'FARMING_USER_INFO_SHARE_VALUE',
                            }, {
                                value: farmingData.userShare,
                            })
                        ) : (
                            <Placeholder width={80} />
                        )}
                    </div>
                </div>
            </div>

            <div className="farming-panel">
                <div className="farming-panel__rows">
                    <div>
                        <div className="farming-panel__label">
                            {intl.formatMessage({
                                id: 'FARMING_USER_INFO_HISTORY_BALANCE',
                            })}
                        </div>
                        <div className="farming-panel__value">
                            {farmingData.userHistoryUsdtBalance === undefined ? (
                                <Placeholder width={150} />
                            ) : (
                                <>
                                    {farmingData.userHistoryUsdtBalance === null
                                        ? nullMessage
                                        : parseCurrencyBillions(farmingData.userHistoryUsdtBalance)}
                                </>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="farming-panel__label">
                            {intl.formatMessage({
                                id: 'FARMING_USER_INFO_HISTORY_TOKENS',
                            })}
                        </div>
                        {
                            leftToken
                            && rightToken
                            && farmingData.userHistoryLeftAmount !== undefined
                            && farmingData.userHistoryRightAmount !== undefined
                                ? (
                                    <>
                                        <div className="farming-panel__token">
                                            <TokenIcon
                                                size="xsmall"
                                                icon={leftToken.icon}
                                                address={leftToken.root}
                                            />
                                            {
                                                farmingData.userHistoryLeftAmount === null
                                                    ? nullMessage
                                                    : intl.formatMessage({
                                                        id: 'FARMING_TOKEN',
                                                    }, {
                                                        amount: formattedTokenAmount(farmingData.userHistoryLeftAmount),
                                                        symbol: leftToken.symbol,
                                                    })
                                            }
                                        </div>
                                        <div className="farming-panel__token">
                                            <TokenIcon
                                                size="xsmall"
                                                icon={rightToken.icon}
                                                address={rightToken.root}
                                            />
                                            {
                                                farmingData.userHistoryRightAmount === null
                                                    ? nullMessage
                                                    : intl.formatMessage({
                                                        id: 'FARMING_TOKEN',
                                                    }, {
                                                        amount: formattedTokenAmount(
                                                            farmingData.userHistoryRightAmount,
                                                        ),
                                                        symbol: rightToken.symbol,
                                                    })
                                            }
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="farming-panel__token">
                                            <Placeholder width={120} />
                                        </div>
                                        <div className="farming-panel__token">
                                            <Placeholder width={120} />
                                        </div>
                                    </>
                                )
                        }
                    </div>

                    <div>
                        <div className="farming-panel__label">
                            {intl.formatMessage({
                                id: 'FARMING_USER_INFO_HISTORY_LAST_UPD',
                            })}
                        </div>
                        {farmingData.userHistoryLastUpdateTime ? (
                            formatDateUTC(farmingData.userHistoryLastUpdateTime)
                        ) : (
                            <Placeholder width={100} />
                        )}
                    </div>
                </div>
            </div>

            <div className="farming-panel">
                <div className="farming-panel__rows">
                    <div>
                        <div className="farming-panel__label">
                            {intl.formatMessage({
                                id: 'FARMING_USER_INFO_TOTAL_REWARD',
                            })}
                        </div>
                        <div className="farming-panel__value">
                            {farmingData.rewardTotalBalance === undefined ? (
                                <Placeholder width={150} />
                            ) : (
                                <>
                                    {farmingData.rewardTotalBalance === null
                                        ? nullMessage
                                        : `$${formattedAmount(farmingData.rewardTotalBalance, undefined, {
                                            truncate: 2,
                                        })}`}
                                </>
                            )}
                        </div>
                    </div>

                    <div key="unclaimed">
                        <div className="farming-panel__label">
                            {intl.formatMessage({
                                id: 'FARMING_USER_INFO_UNCLAIMED_TITLE',
                            })}
                        </div>
                        {(rewardTokens === undefined || farmingData.userPendingRewardVested === undefined) ? (
                            <>
                                <div className="farming-panel__token">
                                    <Placeholder width={120} />
                                </div>
                                <div className="farming-panel__token">
                                    <Placeholder width={120} />
                                </div>
                            </>
                        ) : (
                            rewardTokens.map((token, index) => (
                                token && farmingData.userPendingRewardVested?.[index] && (
                                    <div className="farming-panel__token" key={token.root}>
                                        <TokenIcon
                                            size="xsmall"
                                            icon={token.icon}
                                            address={token.root}
                                        />
                                        {intl.formatMessage({
                                            id: 'FARMING_TOKEN',
                                        }, {
                                            amount: formattedTokenAmount(
                                                farmingData.userPendingRewardVested[index],
                                                token.decimals,
                                            ),
                                            symbol: token.symbol,
                                        })}
                                    </div>
                                )
                            ))
                        )}
                    </div>

                    {hasDebt && (
                        <div key="debt">
                            <div className="farming-panel__label">
                                {intl.formatMessage({
                                    id: 'FARMING_USER_INFO_DEBT_TITLE',
                                })}
                            </div>
                            {(rewardTokens === undefined || farmingData.userPendingRewardDebt === undefined) ? (
                                <>
                                    <div className="farming-panel__token">
                                        <Placeholder width={120} />
                                    </div>
                                    <div className="farming-panel__token">
                                        <Placeholder width={120} />
                                    </div>
                                </>
                            ) : (
                                rewardTokens?.map((token, index) => (
                                    token && farmingData.userPendingRewardDebt?.[index] && (
                                        <div className="farming-panel__token" key={token.root}>
                                            <TokenIcon
                                                size="xsmall"
                                                icon={token.icon}
                                                address={token.root}
                                            />
                                            {intl.formatMessage({
                                                id: 'FARMING_TOKEN',
                                            }, {
                                                amount: formattedTokenAmount(
                                                    farmingData.userPendingRewardDebt[index],
                                                    token.decimals,
                                                ),
                                                symbol: token.symbol,
                                            })}
                                        </div>
                                    )
                                ))
                            )}
                        </div>
                    )}

                    <div key="entitled">
                        <div className="farming-panel__label">
                            {intl.formatMessage({
                                id: 'FARMING_USER_INFO_ENTITLED_TITLE',
                            })}
                        </div>
                        {(rewardTokens === undefined || farmingData.userPendingRewardEntitled === undefined) ? (
                            <>
                                <div className="farming-panel__token">
                                    <Placeholder width={120} />
                                </div>
                                <div className="farming-panel__token">
                                    <Placeholder width={120} />
                                </div>
                            </>
                        ) : (
                            rewardTokens?.map((token, index) => (
                                token && farmingData.userPendingRewardEntitled?.[index] && (
                                    <div className="farming-panel__token" key={token.root}>
                                        <TokenIcon
                                            size="xsmall"
                                            icon={token.icon}
                                            address={token.root}
                                        />
                                        {intl.formatMessage({
                                            id: 'FARMING_TOKEN',
                                        }, {
                                            amount: formattedTokenAmount(
                                                farmingData.userPendingRewardEntitled[index],
                                                token.decimals,
                                            ),
                                            symbol: token.symbol,
                                        })}
                                    </div>
                                )
                            ))
                        )}
                    </div>

                    <div>
                        <div className="farming-panel__label">
                            {intl.formatMessage({
                                id: 'FARMING_USER_INFO_VESTING_TIME',
                            })}
                        </div>

                        {farmingData.vestingTime === undefined ? (
                            <>
                                <div className="farming-panel__token">
                                    <Placeholder width={120} />
                                </div>
                                <div className="farming-panel__token">
                                    <Placeholder width={120} />
                                </div>
                            </>
                        ) : (
                            <>
                                {[...new Set(farmingData.vestingTime)].length > 1 ? (
                                    rewardTokens?.map((token, index) => (
                                        token && farmingData.vestingTime?.[index] && (
                                            <div className="farming-panel__token" key={token.root}>
                                                <TokenIcon
                                                    size="xsmall"
                                                    icon={token.icon}
                                                    address={token.root}
                                                />
                                                {formatDateUTC(farmingData.vestingTime[index])}
                                            </div>
                                        )
                                    ))
                                ) : (
                                    formatDateUTC(farmingData.vestingTime[0])
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export const FarmingUserInfo = observer(FarmingUserInfoInner)
