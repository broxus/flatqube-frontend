import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { SectionTitle } from '@/components/common/SectionTitle'
import { FarmingHead } from '@/modules/Farming/components/FarmingHead'
import {
    FarmingMessageAdminLowBalance,
    FarmingMessageAdminZeroBalance,
    FarmingMessageFarmEnded,
    FarmingMessageGetLp,
    FarmingMessageLowBalance,
} from '@/modules/Farming/components/FarmingMessage'
import { FarmingDeposit } from '@/modules/Farming/components/FarmingDeposit'
import { FarmingWithdraw } from '@/modules/Farming/components/FarmingWithdraw'
import { FarmingAdminDeposit } from '@/modules/Farming/components/FarmingAdminDeposit'
import { FarmingAdminWithdraw } from '@/modules/Farming/components/FarmingAdminWithdraw'
import { FarmingUserInfo } from '@/modules/Farming/components/FarmingUserInfo'
import { FarmingBaseInfo } from '@/modules/Farming/components/FarmingBaseInfo'
import { FarmingConfig } from '@/modules/Farming/components/FarmingConfig'
import { FarmingVesting } from '@/modules/Farming/components/FarmingVesting'
import { FarmingAddresses } from '@/modules/Farming/components/FarmingAddresses'
import { FarmingSpeedTable } from '@/modules/Farming/components/FarmingSpeedTable'
import { FarmingTransactions } from '@/modules/Farming/components/FarmingTransactions'
import { FarmingCharts } from '@/modules/Farming/components/FarmingCharts'
import { useFarmingDataStore } from '@/modules/Farming/stores/FarmingDataStore'
import { useFarmingRoundConfigStore } from '@/modules/Farming/stores/FarmingRoundConfigStore'
import { useFarmingEndDateConfigStore } from '@/modules/Farming/stores/FarmingEndDateConfigStore'
import { useFarmingAdminWithdrawStore } from '@/modules/Farming/stores/FarmingAdminWithdrawStore'
import { FarmingBreadcrumb } from '@/modules/Farming/components/FarmingBreadcrumb'
import { NotFoundError } from '@/components/common/Error'
import { useWallet } from '@/stores/WalletService'

import './index.scss'

export function FarmingInner(): JSX.Element {
    const intl = useIntl()
    const params = useParams<{address: string}>()
    const [configVisible, setConfigVisible] = React.useState(false)
    const farmingData = useFarmingDataStore()
    const farmingRoundConfigStore = useFarmingRoundConfigStore()
    const farmingEndDateConfigStore = useFarmingEndDateConfigStore()
    const farmingAdminWithdrawStore = useFarmingAdminWithdrawStore()
    const wallet = useWallet()

    const showConfig = () => {
        setConfigVisible(true)
    }

    const hideConfig = () => {
        setConfigVisible(false)
    }

    React.useEffect(() => {
        if (!wallet.isConnecting && !wallet.isInitializing) {
            farmingData.getData(params.address)
        }

        return () => {
            farmingData.dispose()
            farmingRoundConfigStore.dispose()
            farmingEndDateConfigStore.dispose()
            farmingAdminWithdrawStore.dispose()
        }
    }, [
        wallet.isConnecting,
        wallet.isInitializing,
    ])

    React.useEffect(() => {
        if (!configVisible) {
            farmingRoundConfigStore.dispose()
            farmingEndDateConfigStore.dispose()
        }
    }, [configVisible])

    React.useEffect(() => {
        farmingData.dispose()
    }, [])

    return (
        <div className="container container--large">
            <section className="section">
                {farmingData.loaded && !farmingData.hasBaseData ? (
                    <NotFoundError />
                ) : (
                    <>
                        <FarmingBreadcrumb />
                        <FarmingHead />
                        <FarmingMessageGetLp />
                        <FarmingMessageFarmEnded />
                        <FarmingMessageLowBalance />
                        <FarmingMessageAdminLowBalance />
                        <FarmingMessageAdminZeroBalance />

                        {farmingData.userInFarming && (
                            <>
                                <div className="farming-title">
                                    <SectionTitle size="small">
                                        {intl.formatMessage({
                                            id: 'FARMING_ITEM_USER_INFO_TITLE',
                                        })}
                                    </SectionTitle>
                                </div>

                                <FarmingUserInfo />
                            </>
                        )}

                        {farmingData.isAdmin && (
                            <>
                                <div className="farming-title" id="pool-management">
                                    <SectionTitle size="small">
                                        {intl.formatMessage({
                                            id: 'FARMING_ITEM_MANAGEMENT_TITLE',
                                        })}
                                    </SectionTitle>

                                    <Button
                                        className="btn-square"
                                        size="md"
                                        type="icon"
                                        onClick={showConfig}
                                    >
                                        <Icon icon="config" />
                                    </Button>

                                    {configVisible && (
                                        <FarmingConfig
                                            onClose={hideConfig}
                                        />
                                    )}
                                </div>

                                <div className="farming-management">
                                    <FarmingAdminDeposit />
                                    <FarmingAdminWithdraw />
                                </div>
                            </>
                        )}

                        {wallet.isConnected && (
                            <>
                                <div className="farming-title">
                                    <SectionTitle size="small">
                                        {intl.formatMessage({
                                            id: 'FARMING_ITEM_BALANCE_TITLE',
                                        })}
                                    </SectionTitle>
                                </div>
                                <div className="farming-balance">
                                    <FarmingDeposit />
                                    <FarmingWithdraw />
                                </div>
                            </>
                        )}

                        <div className="farming-title">
                            <SectionTitle size="small">
                                {intl.formatMessage({
                                    id: 'FARMING_ITEM_BASE_INFO_TITLE',
                                })}
                            </SectionTitle>
                        </div>

                        <div className="farming-stats">
                            <FarmingBaseInfo />
                            <FarmingCharts poolAddress={params.address} />
                        </div>

                        <div className="farming-title">
                            <SectionTitle size="small">
                                {intl.formatMessage({
                                    id: 'FARMING_ITEM_SPEED_TITLE',
                                })}
                            </SectionTitle>

                            {farmingData.isAdmin && (
                                <Button
                                    size="md"
                                    type="icon"
                                    className="btn-square"
                                    onClick={showConfig}
                                >
                                    <Icon icon="config" />
                                </Button>
                            )}
                        </div>

                        <FarmingSpeedTable />

                        <div className="farming-title">
                            <SectionTitle size="small">
                                {intl.formatMessage({
                                    id: 'FARMING_ITEM_DETAILS_TITLE',
                                })}
                            </SectionTitle>
                        </div>

                        <div className="farming-details">
                            <FarmingVesting />
                            <FarmingAddresses />
                        </div>

                        <div className="farming-title">
                            <SectionTitle size="small">
                                {intl.formatMessage({
                                    id: 'FARMING_ITEM_TRANSACTIONS_TITLE',
                                })}
                            </SectionTitle>
                        </div>

                        <FarmingTransactions
                            poolAddress={params.address}
                        />
                    </>
                )}
            </section>
        </div>
    )
}

export const Farming = observer(FarmingInner)
