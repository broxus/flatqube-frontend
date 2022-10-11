import * as React from 'react'
import { useParams } from 'react-router-dom'
import { Observer } from 'mobx-react-lite'

import { GaugesDataProvider } from '@/modules/Gauges/providers/GaugesDataProvider'
import { GaugesItemBreadcrumb } from '@/modules/Gauges/components/GaugesItemBreadcrumb'
import { GaugesUserPerformanceProvider } from '@/modules/Gauges/providers/GaugesUserPerformanceProvider'
import { GaugesUserPerformance } from '@/modules/Gauges/components/GaugesUserPerformance'
import { GaugesItemHeader } from '@/modules/Gauges/components/GaugesItemHeader'
import { GaugesUserDataProvider } from '@/modules/Gauges/providers/GaugesUserDataProvider'
import { GaugesTokensProvider } from '@/modules/Gauges/providers/GaugesTokensProvider'
import { GaugesDeposits } from '@/modules/Gauges/components/GaugesDeposits'
import { GaugesStatistics } from '@/modules/Gauges/components/GaugesStatistics'
import { GaugesVesting } from '@/modules/Gauges/components/GaugesVesting'
import { GaugesQubeSpeed } from '@/modules/Gauges/components/GaugesQubeSpeed'
import { GaugesTokensSpeed } from '@/modules/Gauges/components/GaugesTokensSpeed'
import { GaugesTransactions } from '@/modules/Gauges/components/GaugesTransactions'
import { GaugesFavoritesProvider } from '@/modules/Gauges/providers/GaugesFavoritesProvider'
import { GaugesAdmin } from '@/modules/Gauges/components/GaugesAdmin'
import { GaugesAutoResyncProvider } from '@/modules/Gauges/providers/GaugesAutoResyncProvider'
import { GaugesClaimRewardProvider } from '@/modules/Gauges/providers/GaugesClaimRewardProvider'
import { GaugesDepositsProvider } from '@/modules/Gauges/providers/GaugesDepositsProvider'
import { useWallet } from '@/stores/WalletService'
import { GaugesQubeSpeedProvider } from '@/modules/Gauges/providers/GaugesQubeSpeedProvider'
import { GaugesTokensSpeedProvider } from '@/modules/Gauges/providers/GaugesTokensSpeedProvider'
import { GaugesTransactionsProvider } from '@/modules/Gauges/providers/GaugesTransactionsProvider'
import { GaugesPriceProvider } from '@/modules/Gauges/providers/GaugesPriceProvider'
import { GaugesAdminPopupProvider } from '@/modules/Gauges/providers/GaugesAdminPopupProvider'
import { MediaTypeProvider } from '@/context/MediaType'
import { GaugesChartProvider } from '@/modules/Gauges/providers/GaugesChartProvider'
import { GaugesMessageLowBalance } from '@/modules/Gauges/components/GaugesMessage/LowBalance'
import { GaugesMessageLowBalanceAdmin } from '@/modules/Gauges/components/GaugesMessage/LowBalanceAdmin'
import { GaugesMessageEnded } from '@/modules/Gauges/components/GaugesMessage/Ended'

export function GaugesItem(): JSX.Element {
    const params = useParams<any>()
    const wallet = useWallet()

    return (
        <MediaTypeProvider>
            <GaugesAutoResyncProvider>
                <GaugesPriceProvider>
                    <GaugesFavoritesProvider>
                        <GaugesTokensProvider>
                            <GaugesDataProvider id={params.address}>
                                <GaugesUserDataProvider>
                                    <div className="container container--large">
                                        <GaugesItemBreadcrumb />
                                        <GaugesItemHeader />

                                        <GaugesMessageLowBalance />
                                        <GaugesMessageLowBalanceAdmin />
                                        <GaugesMessageEnded />

                                        <GaugesAdminPopupProvider>
                                            <GaugesAdmin />
                                        </GaugesAdminPopupProvider>

                                        <GaugesUserPerformanceProvider>
                                            <GaugesClaimRewardProvider>
                                                <GaugesUserPerformance />
                                            </GaugesClaimRewardProvider>
                                        </GaugesUserPerformanceProvider>

                                        <Observer>
                                            {() => (
                                                <GaugesDepositsProvider
                                                    user={wallet.address}
                                                    id={params.address}
                                                >
                                                    <GaugesDeposits />
                                                </GaugesDepositsProvider>
                                            )}
                                        </Observer>

                                        <GaugesChartProvider id={params.address}>
                                            <GaugesStatistics />
                                        </GaugesChartProvider>

                                        <GaugesVesting />

                                        <GaugesQubeSpeedProvider id={params.address}>
                                            <GaugesQubeSpeed />
                                        </GaugesQubeSpeedProvider>

                                        <GaugesTokensSpeedProvider id={params.address}>
                                            <GaugesTokensSpeed />
                                        </GaugesTokensSpeedProvider>

                                        <Observer>
                                            {() => (
                                                <GaugesTransactionsProvider
                                                    user={wallet.address}
                                                    id={params.address}
                                                >
                                                    <GaugesTransactions />
                                                </GaugesTransactionsProvider>
                                            )}
                                        </Observer>
                                    </div>
                                </GaugesUserDataProvider>
                            </GaugesDataProvider>
                        </GaugesTokensProvider>
                    </GaugesFavoritesProvider>
                </GaugesPriceProvider>
            </GaugesAutoResyncProvider>
        </MediaTypeProvider>
    )
}
