import BigNumber from 'bignumber.js'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { FarmingAction } from '@/modules/Farming/components/FarmingAction'
import { formattedAmount } from '@/utils'
import { useFarmingDataStore } from '@/modules/Farming/stores/FarmingDataStore'
import { useFarmingDepositStore } from '@/modules/Farming/stores/FarmingDepositStore'

export function FarmingDepositInner(): JSX.Element {
    const intl = useIntl()
    const farmingData = useFarmingDataStore()
    const farmingDepositStore = useFarmingDepositStore()

    const maxValue = React.useMemo(
        () => (farmingData.userLpWalletAmount !== undefined && farmingData.lpTokenDecimals !== undefined
            ? new BigNumber(farmingData.userLpWalletAmount).shiftedBy(-farmingData.lpTokenDecimals).toFixed()
            : '0'),
        [farmingData.userLpWalletAmount, farmingData.lpTokenDecimals],
    )

    const balance = React.useMemo(
        () => formattedAmount(farmingData.userLpWalletAmount, farmingData.lpTokenDecimals, { preserve: true }),
        [farmingData.userLpWalletAmount, farmingData.lpTokenDecimals],
    )

    React.useEffect(() => () => {
        farmingDepositStore.dispose()
    }, [])

    return (
        <div className="farming-balance-panel farming-balance-panel_deposit">
            <div className="farming-balance-panel__title">
                {intl.formatMessage({
                    id: 'FARMING_BALANCE_DEPOSIT_TITLE',
                })}
            </div>

            <div className="farming-balance-panel__text">
                {intl.formatMessage({
                    id: 'FARMING_BALANCE_DEPOSIT_TEXT',
                })}
            </div>

            <FarmingAction
                loading={farmingDepositStore.loading}
                decimals={farmingData.lpTokenDecimals}
                value={farmingDepositStore.amount || ''}
                maxValue={maxValue}
                submitDisabled={!farmingDepositStore.amountIsValid}
                action={intl.formatMessage({
                    id: 'FARMING_BALANCE_DEPOSIT_ACTION',
                })}
                hint={intl.formatMessage({
                    id: 'FARMING_BALANCE_DEPOSIT_BALANCE',
                }, {
                    value: balance,
                    symbol: farmingData.lpTokenSymbol,
                })}
                onChange={farmingDepositStore.setAmount}
                onSubmit={farmingDepositStore.deposit}
            />
        </div>
    )
}

export const FarmingDeposit = observer(FarmingDepositInner)
