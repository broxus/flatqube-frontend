import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { Icon } from '@/components/common/Icon'
import { PairIcons } from '@/components/common/PairIcons'
import { TokenIcons } from '@/components/common/TokenIcons'
import { AccountExplorerLink } from '@/components/common/AccountExplorerLink'
import { FarmingStatus } from '@/modules/Farming/components/FarmingStatus'
import { FarmingToggleButton } from '@/modules/Farming/components/FarmingToggleButton'
import { useTokensCache } from '@/stores/TokensCacheService'
import { useFarmingDataStore } from '@/modules/Farming/stores/FarmingDataStore'
import { Placeholder } from '@/components/common/Placeholder'
import { Button } from '@/components/common/Button'
import { appRoutes } from '@/routes'
import {
    formatDate,
    formattedAmount,
    isExists,
} from '@/utils'

import './index.scss'

export function FarmingHeadInner(): JSX.Element {
    const intl = useIntl()
    const tokensCache = useTokensCache()
    const farmingData = useFarmingDataStore()

    const leftToken = farmingData.leftTokenAddress
        && tokensCache.get(farmingData.leftTokenAddress)

    const rightToken = farmingData.rightTokenAddress
        && tokensCache.get(farmingData.rightTokenAddress)

    const rewardTokens = farmingData.rewardTokensAddress
        ?.map(root => tokensCache.get(root))
        .filter(isExists)

    if (!farmingData.hasBaseData) {
        return (
            <div className="farming-header">
                <div className="farming-header__info">
                    <Placeholder circle width={32} />
                    <div className="farming-header__main">
                        <h2 className="section-title">
                            <Placeholder width={370} />
                        </h2>
                        <div className="farming-header__status">
                            <Placeholder width={50} />
                            <Placeholder width={130} />
                            <Placeholder width={50} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="farming-header">
            <div className="farming-header__info">
                {leftToken && rightToken ? (
                    <PairIcons
                        leftToken={{
                            icon: leftToken.icon,
                            root: leftToken.root,
                            name: leftToken.symbol,
                        }}
                        rightToken={{
                            icon: rightToken.icon,
                            root: rightToken.root,
                            name: rightToken.symbol,
                        }}
                    />
                ) : (
                    farmingData.lpTokenAddress && (
                        <PairIcons
                            leftToken={{
                                root: farmingData.lpTokenAddress,
                            }}
                        />
                    )
                )}

                <div className="farming-header__main">
                    <h2 className="section-title">
                        {farmingData.symbol ? (
                            intl.formatMessage({
                                id: 'FARMING_ITEM_TITLE',
                            }, {
                                symbol: farmingData.symbol,
                            })
                        ) : (
                            '\u200B'
                        )}
                    </h2>

                    <div className="farming-header__status">
                        {farmingData.apr && (
                            <div>
                                {intl.formatMessage({
                                    id: 'FARMING_ITEM_APR',
                                }, {
                                    value: formattedAmount(farmingData.apr),
                                })}
                            </div>
                        )}

                        <div>
                            {farmingData.startTime ? formatDate(farmingData.startTime) : '\u200B'}
                            {farmingData.endTime ? ` - ${formatDate(farmingData.endTime)}` : ''}
                        </div>

                        {farmingData.startTime && (
                            <FarmingStatus
                                startTime={farmingData.startTime}
                                endTime={farmingData.endTime}
                            />
                        )}
                    </div>
                </div>

                {rewardTokens && (
                    <>
                        <Icon icon="directionRight" ratio={1.8} />
                        <TokenIcons
                            size="medium"
                            icons={rewardTokens.map(item => ({
                                address: item.root,
                                icon: item.icon,
                            }))}
                        />
                    </>
                )}
            </div>

            {farmingData.poolAddress && (
                <div className="farming-header__actions">
                    <div>
                        <FarmingToggleButton
                            poolAddress={farmingData.poolAddress}
                        />
                        <AccountExplorerLink
                            address={farmingData.poolAddress}
                            className="btn btn-md btn-square btn-icon"
                        >
                            <Icon icon="externalLink" />
                        </AccountExplorerLink>
                    </div>
                    {farmingData.leftTokenAddress && farmingData.rightTokenAddress && (
                        <Button
                            size="md"
                            type="secondary"
                            link={appRoutes.poolCreate.makeUrl({
                                leftTokenRoot: farmingData.leftTokenAddress,
                                rightTokenRoot: farmingData.rightTokenAddress,
                            })}
                        >
                            {intl.formatMessage({ id: 'FARMING_MESSAGE_GET_LP_GET' })}
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}

export const FarmingHead = observer(FarmingHeadInner)
