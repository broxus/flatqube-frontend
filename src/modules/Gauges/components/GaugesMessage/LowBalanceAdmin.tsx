import { observer } from 'mobx-react-lite'
import * as React from 'react'
import { useIntl } from 'react-intl'

import { useContext } from '@/hooks/useContext'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'
import { useWallet } from '@/stores/WalletService'

import styles from './index.module.scss'

function GaugesMessageLowBalanceAdminInner(): JSX.Element | null {
    const intl = useIntl()
    const wallet = useWallet()
    const data = useContext(GaugesDataStoreContext)

    if (
        data.ownerAddress
        && wallet.address
        && data.ownerAddress === wallet.address
        && data.isLowBalance
    ) {
        return (
            <div className={`${styles.message} ${styles.danger}`}>
                <div>
                    <h3>
                        {intl.formatMessage({
                            id: 'GAUGE_MESSAGE_ADMIN_LOW_BALANCE_TITLE',
                        })}
                    </h3>
                    <p
                        dangerouslySetInnerHTML={{
                            __html: intl.formatMessage({
                                id: 'GAUGE_MESSAGE_ADMIN_LOW_BALANCE_TEXT',
                            }),
                        }}
                    />
                </div>
            </div>
        )
    }

    return null
}

export const GaugesMessageLowBalanceAdmin = observer(GaugesMessageLowBalanceAdminInner)
