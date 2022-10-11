import * as React from 'react'
import { observer } from 'mobx-react-lite'
import BigNumber from 'bignumber.js'

import { useContext } from '@/hooks/useContext'
import { GaugesUserDataContext } from '@/modules/Gauges/providers/GaugesUserDataProvider'
import { UserPerformanceStartBanner } from '@/modules/Gauges/components/GaugesUserPerformance/StartBanner'
import { StartBannerPlaceholder } from '@/modules/Gauges/components/GaugesUserPerformance/StartBannerPlaceholder'
import { UserPerformanceDepositForm } from '@/modules/Gauges/components/GaugesUserPerformance/DepositForm'
import { GaugesDepositFormProvider } from '@/modules/Gauges/providers/GaugesDepositFormProvider'
import { UserPerformanceApr } from '@/modules/Gauges/components/GaugesUserPerformance/Apr'
import { UserPerformanceManagement } from '@/modules/Gauges/components/GaugesUserPerformance/Management'
import { GaugesUserPerformanceContext } from '@/modules/Gauges/providers/GaugesUserPerformanceProvider'
import { UserPerformanceStep } from '@/modules/Gauges/stores/GaugesUserPerformanceStore'
import { UserPerformanceWithdrawForm } from '@/modules/Gauges/components/GaugesUserPerformance/WithdrawForm'
import { GaugesWithdrawFormProvider } from '@/modules/Gauges/providers/GaugesWithdrawFormProvider'

function UserStatusInner(): JSX.Element {
    const userData = useContext(GaugesUserDataContext)
    const userPerformance = useContext(GaugesUserPerformanceContext)

    if (userData.walletBalance && userData.balance && !userData.balanceIsLoading) {
        if (userPerformance.step === UserPerformanceStep.Deposit) {
            return (
                <GaugesDepositFormProvider>
                    <UserPerformanceDepositForm
                        onCancel={userPerformance.setRoot}
                    />
                </GaugesDepositFormProvider>
            )
        }

        if (userPerformance.step === UserPerformanceStep.Withdraw) {
            return (
                <GaugesWithdrawFormProvider>
                    <UserPerformanceWithdrawForm
                        onCancel={userPerformance.setRoot}
                    />
                </GaugesWithdrawFormProvider>
            )
        }

        if (new BigNumber(userData.balance).gt(0)) {
            return (
                <>
                    <UserPerformanceApr />
                    <UserPerformanceManagement />
                </>
            )
        }

        if (new BigNumber(userData.walletBalance).gt(0)) {
            return (
                <GaugesDepositFormProvider>
                    <UserPerformanceDepositForm />
                </GaugesDepositFormProvider>
            )
        }

        if (new BigNumber(userData.walletBalance).isZero()) {
            return <UserPerformanceStartBanner />
        }
    }

    return (
        <StartBannerPlaceholder />
    )
}

export const UserStatus = observer(UserStatusInner)
