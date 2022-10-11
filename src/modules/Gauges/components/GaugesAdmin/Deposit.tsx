import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { GaugesPanel } from '@/modules/Gauges/components/GaugesPanel'
import { useContext } from '@/hooks/useContext'
import { GaugesAdminDepositContext } from '@/modules/Gauges/providers/GaugesAdminDepositProvider'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'
import { Placeholder } from '@/components/common/Placeholder'
import { GaugesAdminDepositFormProvider } from '@/modules/Gauges/providers/GaugesAdminDepositFormProvider'
import { AdminBalanceDepositForm } from '@/modules/Gauges/components/GaugesAdmin/DepositForm'

import styles from './index.module.scss'

function AdminBalanceDepositInner(): JSX.Element {
    const intl = useIntl()
    const { extraTokens } = useContext(GaugesDataStoreContext)
    const { extraTokensBalances } = useContext(GaugesAdminDepositContext)

    if (extraTokens && extraTokensBalances) {
        return (
            <GaugesPanel>
                <div className={styles.desc}>
                    <h3>
                        {intl.formatMessage({
                            id: 'GAUGE_ADMIN_DEPOSIT_TITLE',
                        })}
                    </h3>
                    <p>
                        {intl.formatMessage({
                            id: 'GAUGE_ADMIN_DEPOSIT_DESC',
                        })}
                    </p>
                </div>

                {extraTokens.length > 0 ? (
                    extraTokens.map((token, index) => (
                        <GaugesAdminDepositFormProvider
                            key={token.root}
                            extraTokenIndex={index}
                        >
                            <AdminBalanceDepositForm />
                        </GaugesAdminDepositFormProvider>
                    ))
                ) : (
                    <div className={styles.message}>
                        {intl.formatMessage({
                            id: 'GAUGE_ADMIN_NO_REWARD_TOKENS',
                        })}
                    </div>
                )}
            </GaugesPanel>
        )
    }

    return (
        <GaugesPanel>
            <div className={styles.desc}>
                <h3>
                    <Placeholder width={220} />
                </h3>
                <p>
                    <Placeholder width={100} />
                </p>
            </div>
        </GaugesPanel>
    )
}

export const AdminBalanceDeposit = observer(AdminBalanceDepositInner)
