import { observer } from 'mobx-react-lite'
import * as React from 'react'
import { useIntl } from 'react-intl'

import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'
import { useContext } from '@/hooks/useContext'
import { useWallet } from '@/stores/WalletService'

import styles from './index.module.scss'

function GaugesMessageLowBalanceInner(): JSX.Element | null {
    const intl = useIntl()
    const wallet = useWallet()
    const data = useContext(GaugesDataStoreContext)

    if (
        data.ownerAddress
        && wallet.address
        && data.ownerAddress !== wallet.address
        && data.isLowBalance
    ) {
        return (
            <div className={`${styles.message} ${styles.danger}`}>
                <h3>
                    {intl.formatMessage({
                        id: 'GAUGE_MESSAGE_LOW_BALANCE_TITLE',
                    })}
                </h3>
            </div>
        )
    }

    return null
}

export const GaugesMessageLowBalance = observer(GaugesMessageLowBalanceInner)
