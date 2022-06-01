import * as React from 'react'
import { useIntl } from 'react-intl'
import BigNumber from 'bignumber.js'
import { observer } from 'mobx-react-lite'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { appRoutes } from '@/routes'
import { useTokensCache } from '@/stores/TokensCacheService'
import { formattedAmount, storage } from '@/utils'
import { useFarmingDataStore } from '@/modules/Farming/stores/FarmingDataStore'

import './index.scss'

const DISABLED_STORAGE_KEY = 'farming_message_get_lp_disabled'

function FarmingMessageGetLpInner(): JSX.Element | null {
    const intl = useIntl()
    const tokensCache = useTokensCache()
    const farmingData = useFarmingDataStore()
    const leftToken = tokensCache.get(farmingData.leftTokenAddress)
    const rightToken = tokensCache.get(farmingData.rightTokenAddress)
    const [disabled, setDisabled] = React.useState(
        storage.get(DISABLED_STORAGE_KEY) === '1',
    )

    const dismiss = () => {
        storage.set(DISABLED_STORAGE_KEY, '1')
        setDisabled(true)
    }

    if (
        leftToken
        && rightToken
        && !disabled
        && !farmingData.isAdmin
        && farmingData.isActive
        && farmingData.userLpWalletAmount
        && farmingData.userLpFarmingAmount
        && new BigNumber(farmingData.userLpWalletAmount).isZero()
        && new BigNumber(farmingData.userLpFarmingAmount).isZero()
    ) {
        return (
            <div className="farming-message">
                <Button
                    className="farming-message__close"
                    onClick={dismiss}
                >
                    <Icon icon="close" ratio={0.9} />
                </Button>

                <div>
                    {farmingData.apr && (
                        <h3>
                            {intl.formatMessage({
                                id: 'FARMING_MESSAGE_GET_LP_TITLE',
                            }, {
                                apr: formattedAmount(farmingData.apr),
                            })}
                        </h3>
                    )}
                    <p>
                        {intl.formatMessage({
                            id: 'FARMING_MESSAGE_GET_LP_ACCEPTS',
                        }, {
                            symbol: farmingData.lpTokenSymbol,
                        })}
                    </p>
                    <p>
                        {intl.formatMessage({
                            id: 'FARMING_MESSAGE_GET_LP_DEPOSIT',
                        }, {
                            left: leftToken.symbol,
                            right: rightToken.symbol,
                        })}
                    </p>
                </div>

                <div className="farming-message__actions">
                    <Button
                        ghost
                        href="https://docs.flatqube.io/use/pools/how-to/add-liquidity"
                        rel="nofollow noopener noreferrer"
                        size="md"
                        target="_blank"
                        type="primary"
                    >
                        {intl.formatMessage({
                            id: 'FARMING_MESSAGE_GET_LP_GUIDE',
                        })}
                    </Button>

                    <Button
                        link={appRoutes.poolCreate.makeUrl({
                            leftTokenRoot: farmingData.leftTokenAddress,
                            rightTokenRoot: farmingData.rightTokenAddress,
                        })}
                        size="md"
                        type="dark"
                    >
                        {intl.formatMessage({
                            id: 'FARMING_MESSAGE_GET_LP_GET',
                        })}
                    </Button>
                </div>
            </div>
        )
    }

    return null
}

export const FarmingMessageGetLp = observer(FarmingMessageGetLpInner)
