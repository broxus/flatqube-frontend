import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { TokenIcon } from '@/components/common/TokenIcon'
import { useTokensCache } from '@/stores/TokensCacheService'
import { formattedAmount, formattedTokenAmount, parseCurrencyBillions } from '@/utils'
import { useFarmingDataStore } from '@/modules/Farming/stores/FarmingDataStore'
import { Placeholder } from '@/components/common/Placeholder'
import { useWallet } from '@/stores/WalletService'

import './index.scss'

function FarmingBaseInfoInner(): JSX.Element {
    const intl = useIntl()
    const wallet = useWallet()
    const tokensCache = useTokensCache()
    const farmingData = useFarmingDataStore()
    const rewardTokens = farmingData.rewardTokensAddress?.map(root => tokensCache.get(root))
    const leftToken = farmingData.leftTokenAddress && tokensCache.get(farmingData.leftTokenAddress)
    const rightToken = farmingData.rightTokenAddress && tokensCache.get(farmingData.rightTokenAddress)
    const nullMessage = intl.formatMessage({ id: 'FARMING_BASE_INFO_NULL' })

    return (
        <div className="farming-base-info">
            <div className="farming-panel farming-panel_compact">
                <div className="farming-panel__rows">
                    <div key="tvl">
                        <div className="farming-panel__label">
                            {intl.formatMessage({
                                id: 'FARMING_BASE_INFO_TVL',
                            })}
                        </div>
                        <div className="farming-panel__value">
                            {farmingData.tvl === undefined ? (
                                <Placeholder width={120} />
                            ) : (
                                <>
                                    {farmingData.tvl === null
                                        ? nullMessage
                                        : parseCurrencyBillions(farmingData.tvl)}
                                </>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="farming-panel__label">
                            {intl.formatMessage({
                                id: 'FARMING_BASE_INFO_LP_TOKENS',
                            }, {
                                symbol: farmingData.lpTokenSymbol,
                            })}
                        </div>

                        {farmingData.lpTokenBalance === undefined ? (
                            <Placeholder width={70} />
                        ) : (
                            formattedAmount(farmingData.lpTokenBalance)
                        )}
                    </div>

                    <div>
                        <div className="farming-panel__label">
                            {intl.formatMessage({
                                id: 'FARMING_BASE_INFO_TOKENS',
                            })}
                        </div>

                        {farmingData.isExternalLpToken ? (
                            nullMessage
                        ) : (
                            <>
                                <div className="farming-panel__token">
                                    {leftToken ? (
                                        <>
                                            <TokenIcon
                                                size="xsmall"
                                                icon={leftToken.icon}
                                                address={leftToken.root}
                                            />

                                            {intl.formatMessage({
                                                id: 'FARMING_TOKEN',
                                            }, {
                                                amount: formattedTokenAmount(farmingData.leftTokenBalance),
                                                symbol: leftToken.symbol,
                                            })}
                                        </>
                                    ) : (
                                        <Placeholder width={100} />
                                    )}
                                </div>
                                <div className="farming-panel__token">
                                    {rightToken ? (
                                        <>
                                            <TokenIcon
                                                size="xsmall"
                                                icon={rightToken.icon}
                                                address={rightToken.root}
                                            />
                                            {intl.formatMessage({
                                                id: 'FARMING_TOKEN',
                                            }, {
                                                amount: formattedTokenAmount(farmingData.rightTokenBalance),
                                                symbol: rightToken.symbol,
                                            })}
                                        </>
                                    ) : (
                                        <Placeholder width={100} />
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="farming-panel farming-panel_compact">
                <div className="farming-panel__label">
                    {intl.formatMessage({
                        id: 'FARMING_BASE_INFO_APR',
                    })}
                </div>

                {farmingData.apr === undefined ? (
                    <Placeholder width={70} />
                ) : (
                    <>
                        {farmingData.apr === null ? nullMessage : intl.formatMessage({
                            id: 'FARMING_BASE_INFO_APR_VALUE',
                        }, {
                            value: formattedAmount(farmingData.apr),
                        })}
                    </>
                )}
            </div>

            {wallet.isConnected && (
                <div className="farming-panel farming-panel_compact">
                    <div className="farming-panel__label">
                        {intl.formatMessage({
                            id: 'FARMING_BASE_INFO_REWARD',
                        })}
                    </div>

                    {(farmingData.rewardTokensBalance === undefined || rewardTokens === undefined) ? (
                        <>
                            <div className="farming-panel__token">
                                <Placeholder width={100} />
                            </div>
                            <div className="farming-panel__token">
                                <Placeholder width={100} />
                            </div>
                        </>
                    ) : (
                        rewardTokens?.map((token, index) => (
                            token && (
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
                                            farmingData.rewardTokensBalance?.[index],
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

            <div className="farming-panel farming-panel_compact">
                <div className="farming-panel__label">
                    {intl.formatMessage({
                        id: 'FARMING_BASE_INFO_SPEED',
                    })}
                </div>

                {(farmingData.rpsAmount === undefined || rewardTokens === undefined) ? (
                    <>
                        <div className="farming-panel__token">
                            <Placeholder width={100} />
                        </div>
                        <div className="farming-panel__token">
                            <Placeholder width={100} />
                        </div>
                    </>
                ) : (
                    rewardTokens.map((token, index) => (
                        token && (
                            <div className="farming-panel__token" key={token.root}>
                                <TokenIcon
                                    size="xsmall"
                                    icon={token.icon}
                                    address={token.root}
                                />
                                {intl.formatMessage({
                                    id: 'FARMING_TOKEN',
                                }, {
                                    amount: formattedAmount(farmingData.rpsAmount?.[index], undefined, {
                                        preserve: true,
                                    }),
                                    symbol: token.symbol,
                                })}
                            </div>
                        )
                    ))
                )}
            </div>
        </div>
    )
}

export const FarmingBaseInfo = observer(FarmingBaseInfoInner)
