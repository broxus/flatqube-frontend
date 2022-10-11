import * as React from 'react'
import { observer } from 'mobx-react-lite'
import BigNumber from 'bignumber.js'

import { useContext } from '@/hooks/useContext'
import { GaugesUserDataContext } from '@/modules/Gauges/providers/GaugesUserDataProvider'
import { GaugesUserPerformanceContext } from '@/modules/Gauges/providers/GaugesUserPerformanceProvider'
import { UserPerformanceApr } from '@/modules/Gauges/components/GaugesUserPerformance/Apr'
import { UserPerformanceManagement } from '@/modules/Gauges/components/GaugesUserPerformance/Management'
import { UserPerformanceDepositForm } from '@/modules/Gauges/components/GaugesUserPerformance/DepositForm'
import { UserPerformancePopup } from '@/modules/Gauges/components/GaugesUserPerformance/Popup'
import { GaugesDepositFormProvider } from '@/modules/Gauges/providers/GaugesDepositFormProvider'
import { UserPerformanceStep } from '@/modules/Gauges/stores/GaugesUserPerformanceStore'
import { GaugesWithdrawFormProvider } from '@/modules/Gauges/providers/GaugesWithdrawFormProvider'
import { UserPerformanceWithdrawForm } from '@/modules/Gauges/components/GaugesUserPerformance/WithdrawForm'

function UserStatusMobileInner(): JSX.Element {
    const userData = useContext(GaugesUserDataContext)
    const userPerformance = useContext(GaugesUserPerformanceContext)

    const hasBalance = userData.balance
        ? new BigNumber(userData.balance).gt(0)
        : false
    const hasWalletBalance = userData.walletBalance
        ? new BigNumber(userData.walletBalance).gt(0)
        : false


    return (
        <>
            <UserPerformanceApr />

            {
                (hasWalletBalance || hasBalance)
                && !userData.balanceIsLoading
                && (
                    <UserPerformanceManagement
                        asToolBar
                        withdrawVisible={hasBalance}
                        depositVisible={hasWalletBalance}
                    />
                )
            }

            {userPerformance.step === UserPerformanceStep.Deposit && (
                <UserPerformancePopup
                    onClose={userPerformance.setRoot}
                >
                    <GaugesDepositFormProvider>
                        <UserPerformanceDepositForm
                            asPopup
                            onCancel={userPerformance.setRoot}
                        />
                    </GaugesDepositFormProvider>
                </UserPerformancePopup>
            )}

            {userPerformance.step === UserPerformanceStep.Withdraw && (
                <UserPerformancePopup
                    onClose={userPerformance.setRoot}
                >
                    <GaugesWithdrawFormProvider>
                        <UserPerformanceWithdrawForm
                            asPopup
                            onCancel={userPerformance.setRoot}
                        />
                    </GaugesWithdrawFormProvider>
                </UserPerformancePopup>
            )}
        </>
    )
}

export const UserStatusMobile = observer(UserStatusMobileInner)
