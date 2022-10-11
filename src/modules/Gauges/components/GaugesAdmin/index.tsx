import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { AdminBalanceDeposit } from '@/modules/Gauges/components/GaugesAdmin/Deposit'
import { AdminBalanceWithdraw } from '@/modules/Gauges/components/GaugesAdmin/Withdraw'
import { GaugesTitle } from '@/modules/Gauges/components/GaugesTitle'
import { GaugesAdminDepositProvider } from '@/modules/Gauges/providers/GaugesAdminDepositProvider'
import { GaugesAdminWithdrawProvider } from '@/modules/Gauges/providers/GaugesAdminWithdrawProvider'
import { Icon } from '@/components/common/Icon'
import { GaugesToolBtn } from '@/modules/Gauges/components/GaugesToolBtn'
import { useContext } from '@/hooks/useContext'
import { GaugesAdminPopup } from '@/modules/Gauges/components/GaugesAdminPopup'
import { GaugesAdminPopupContext } from '@/modules/Gauges/providers/GaugesAdminPopupProvider'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'
import { useWallet } from '@/stores/WalletService'

import styles from './index.module.scss'

function GaugesAdminInner(): JSX.Element | null {
    const intl = useIntl()
    const wallet = useWallet()
    const data = useContext(GaugesDataStoreContext)
    const adminPopup = useContext(GaugesAdminPopupContext)

    if (wallet.address && data.ownerAddress === wallet.address) {
        return (
            <>
                <GaugesTitle>
                    {intl.formatMessage({
                        id: 'GAUGE_ITEM_MANAGEMENT_TITLE',
                    })}
                    {data.extraTokens && data.extraTokens.length > 0 && (
                        <GaugesToolBtn
                            className={styles.configBtn}
                            onClick={adminPopup.show}
                        >
                            <Icon icon="config" />
                        </GaugesToolBtn>
                    )}
                </GaugesTitle>

                <div className={styles.adminBalance}>
                    <GaugesAdminDepositProvider>
                        <AdminBalanceDeposit />
                    </GaugesAdminDepositProvider>

                    <GaugesAdminWithdrawProvider>
                        <AdminBalanceWithdraw />
                    </GaugesAdminWithdrawProvider>
                </div>

                {adminPopup.visible && (
                    <GaugesAdminPopup />
                )}
            </>
        )
    }

    return null
}

export const GaugesAdmin = observer(GaugesAdminInner)
