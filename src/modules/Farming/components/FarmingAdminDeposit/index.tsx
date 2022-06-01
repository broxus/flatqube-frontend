import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { Warning } from '@/components/common/Warning'
import { FarmingAdminDepositBalance } from '@/modules/Farming/components/FarmingAdminDeposit/balance'
import { FarmingAdminDepositInput } from '@/modules/Farming/components/FarmingAdminDeposit/input'
import { useTokensCache } from '@/stores/TokensCacheService'
import { formattedTokenAmount } from '@/utils'
import { useFarmingDataStore } from '@/modules/Farming/stores/FarmingDataStore'
import { useFarmingAdminDepositStore } from '@/modules/Farming/stores/FarmingAdminDepositStore'

import './index.scss'

function FarmingAdminDepositInner(): JSX.Element {
    const intl = useIntl()
    const tokensCache = useTokensCache()
    const farmingData = useFarmingDataStore()
    const farmingAdminDepositStore = useFarmingAdminDepositStore()

    const formData = (farmingData.rewardTokensAddress || []).map((address, index) => ({
        tokenRoot: address,
        amount: farmingAdminDepositStore.amounts[index],
        loading: farmingAdminDepositStore.loadings[index],
        valid: farmingAdminDepositStore.amountsIsValid[index],
        userBalance: (farmingData.userRewardTokensBalance || [])[index],
        poolBalance: (farmingData.rewardTokensBalanceCumulative || [])[index],
    }))

    const tokens = formData.map(({ tokenRoot }) => tokensCache.get(tokenRoot))

    const showWarning = !farmingAdminDepositStore.enoughTokensBalance
        && farmingData.rewardTokensBalanceCumulative !== undefined

    React.useEffect(() => () => {
        farmingAdminDepositStore.dispose()
    }, [])

    return (
        <div className="farming-panel">
            <div className="farming-panel__rows">
                <div>
                    <h3 className="farming-panel__title">
                        {intl.formatMessage({
                            id: 'FARMING_ADMIN_DEPOSIT_TITLE',
                        })}
                    </h3>
                    <div className="farming-panel__text">
                        {intl.formatMessage({
                            id: 'FARMING_ADMIN_DEPOSIT_TEXT',
                        })}
                    </div>
                </div>

                {showWarning === true && (
                    <div>
                        <Warning
                            title={intl.formatMessage({
                                id: 'FARMING_ADMIN_DEPOSIT_WARNING_TITLE',
                            })}
                            text={intl.formatMessage({
                                id: 'FARMING_ADMIN_DEPOSIT_WARNING_TEXT',
                            })}
                        />
                    </div>
                )}

                {tokens.map((token, index) => (
                    token && (
                        <div key={token.root}>
                            <FarmingAdminDepositBalance
                                tokenRoot={token.root}
                                symbol={token.symbol}
                                amount={formattedTokenAmount(formData[index].poolBalance, token.decimals)}
                            />

                            <FarmingAdminDepositInput
                                balance={formData[index].userBalance}
                                amount={formData[index].amount}
                                decimals={token.decimals}
                                symbol={token.symbol}
                                valid={formData[index].valid}
                                loading={formData[index].loading}
                                index={index}
                                onChange={farmingAdminDepositStore.setAmount}
                                onSubmit={farmingAdminDepositStore.deposit}
                            />
                        </div>
                    )
                ))}
            </div>
        </div>
    )
}

export const FarmingAdminDeposit = observer(FarmingAdminDepositInner)
