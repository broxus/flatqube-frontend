import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { Button } from '@/components/common/Button'
import { TokenIcon } from '@/components/common/TokenIcon'
import { useTokensCache } from '@/stores/TokensCacheService'
import { formattedTokenAmount } from '@/utils'
import { useFarmingDataStore } from '@/modules/Farming/stores/FarmingDataStore'
import { useFarmingAdminWithdrawStore } from '@/modules/Farming/stores/FarmingAdminWithdrawStore'
import { Placeholder } from '@/components/common/Placeholder'

function FarmingAdminWithdrawInner(): JSX.Element {
    const intl = useIntl()
    const tokensCache = useTokensCache()
    const farmingData = useFarmingDataStore()
    const farmingAdminWithdrawStore = useFarmingAdminWithdrawStore()
    const tokens = farmingData.rewardTokensAddress?.map(root => tokensCache.get(root))

    return (
        <div className="farming-panel">
            <div className="farming-panel__rows">
                <div>
                    <h3 className="farming-panel__title">
                        {intl.formatMessage({
                            id: 'FARMING_ADMIN_WITHDRAW_TITLE',
                        })}
                    </h3>
                    <div className="farming-panel__text">
                        {intl.formatMessage({
                            id: 'FARMING_ADMIN_WITHDRAW_TEXT',
                        })}
                    </div>
                </div>

                <div>
                    <div className="farming-panel__title farming-panel__title_small">
                        {intl.formatMessage({
                            id: 'FARMING_ADMIN_WITHDRAW_TOKENS_TITLE',
                        })}
                    </div>

                    {tokens === undefined ? (
                        <>
                            <div className="farming-panel__token">
                                <Placeholder width={100} />
                            </div>
                            <div className="farming-panel__token">
                                <Placeholder width={100} />
                            </div>
                        </>
                    ) : (
                        tokens.map((token, index) => (
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

                <div>
                    <Button
                        disabled={farmingAdminWithdrawStore.loading
                            || !farmingAdminWithdrawStore.isEnabled}
                        type="secondary"
                        onClick={farmingAdminWithdrawStore.submit}
                    >
                        {intl.formatMessage({
                            id: 'FARMING_ADMIN_WITHDRAW_BTN',
                        })}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export const FarmingAdminWithdraw = observer(FarmingAdminWithdrawInner)
