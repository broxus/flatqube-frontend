import BigNumber from 'bignumber.js'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { FarmingAction } from '@/modules/Farming/components/FarmingAction'
import { useTokensCache } from '@/stores/TokensCacheService'
import { formattedAmount, isExists } from '@/utils'
import { useFarmingDataStore } from '@/modules/Farming/stores/FarmingDataStore'
import { useFarmingClaimStore } from '@/modules/Farming/stores/FarmingClaimStore'
import { useFarmingWithdrawStore } from '@/modules/Farming/stores/FarmingWithdrawStore'

enum Tab {
    Claim = 1,
    Withdraw = 2,
}

export function FarmingWithdrawInner(): JSX.Element {
    const intl = useIntl()
    const tokensCache = useTokensCache()
    const farmingData = useFarmingDataStore()
    const farmingClaimStore = useFarmingClaimStore()
    const farmingWithdrawStore = useFarmingWithdrawStore()
    const [activeTab, setActiveTab] = React.useState(Tab.Claim)

    const rewardTokens = farmingData.rewardTokensAddress?.map(root => tokensCache.get(root))

    const rewards = farmingData.userPendingRewardVested && rewardTokens
        ? rewardTokens
            .map((token, index) => (
                token && farmingData.userPendingRewardVested
                    ? {
                        symbol: token.symbol,
                        amount: formattedAmount(
                            farmingData.userPendingRewardVested[index],
                            token.decimals,
                            { preserve: true },
                        ),
                    }
                    : undefined
            ))
            .filter(isExists)
        : undefined

    const maxValue = React.useMemo(
        () => (farmingData.userLpFarmingAmount !== undefined && farmingData.lpTokenDecimals !== undefined
            ? new BigNumber(farmingData.userLpFarmingAmount).shiftedBy(-farmingData.lpTokenDecimals).toFixed()
            : '0'),
        [farmingData.userLpFarmingAmount, farmingData.lpTokenDecimals],
    )

    const balance = React.useMemo(
        () => formattedAmount(farmingData.userLpFarmingAmount, farmingData.lpTokenDecimals, { preserve: true }),
        [farmingData.userLpFarmingAmount, farmingData.lpTokenDecimals],
    )

    const onClickClaimTab = () => {
        setActiveTab(Tab.Claim)
    }

    const onClickWithdrawTab = () => {
        setActiveTab(Tab.Withdraw)
    }

    React.useEffect(() => () => {
        farmingWithdrawStore.dispose()
        farmingClaimStore.dispose()
    }, [])

    return (
        <div className="farming-balance-panel farming-balance-panel_withdraw">
            <div className="farming-balance-panel__title">
                {intl.formatMessage({
                    id: 'FARMING_BALANCE_WITHDRAW_TITLE',
                })}
            </div>

            <ul className="farming-balance-panel__tabs">
                <li
                    className={activeTab === Tab.Claim ? 'active' : undefined}
                    onClick={onClickClaimTab}
                >
                    {intl.formatMessage({
                        id: 'FARMING_BALANCE_WITHDRAW_CLAIM_TAB',
                    })}
                </li>
                <li
                    className={activeTab === Tab.Withdraw ? 'active' : undefined}
                    onClick={onClickWithdrawTab}
                >
                    {intl.formatMessage({
                        id: 'FARMING_BALANCE_WITHDRAW_WITHDRAW_TAB',
                    })}
                </li>
            </ul>

            {activeTab === Tab.Claim && (
                <FarmingAction
                    decimals={farmingData.lpTokenDecimals}
                    inputDisabled
                    loading={farmingWithdrawStore.loading || farmingClaimStore.loading}
                    submitDisabled={!farmingClaimStore.claimIsAvailable}
                    action={intl.formatMessage({
                        id: 'FARMING_BALANCE_WITHDRAW_ACTION_CLAIM',
                    })}
                    value={rewards
                        ?.map(({ amount, symbol }) => (
                            intl.formatMessage({
                                id: 'FARMING_BALANCE_TOKEN',
                            }, {
                                amount,
                                symbol,
                            })
                        ))
                        .join(', ')}
                    onSubmit={farmingClaimStore.claim}
                />
            )}

            {activeTab === Tab.Withdraw && (
                <FarmingAction
                    decimals={farmingData.lpTokenDecimals}
                    loading={farmingWithdrawStore.loading || farmingClaimStore.loading}
                    value={farmingWithdrawStore.amount || ''}
                    maxValue={maxValue}
                    submitDisabled={!farmingWithdrawStore.amountIsValid}
                    action={intl.formatMessage({
                        id: 'FARMING_BALANCE_WITHDRAW_ACTION_WITHDRAW',
                    })}
                    hint={intl.formatMessage({
                        id: 'FARMING_BALANCE_WITHDRAW_BALANCE',
                    }, {
                        value: balance,
                        symbol: farmingData.lpTokenSymbol,
                    })}
                    onChange={farmingWithdrawStore.setAmount}
                    onSubmit={farmingWithdrawStore.withdraw}
                />
            )}
        </div>
    )
}

export const FarmingWithdraw = observer(FarmingWithdrawInner)
