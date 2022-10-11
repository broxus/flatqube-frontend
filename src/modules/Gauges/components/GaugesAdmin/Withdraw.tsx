import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { GaugesPanel } from '@/modules/Gauges/components/GaugesPanel'
import { Button } from '@/components/common/Button'
import { useContext } from '@/hooks/useContext'
import { GaugesAdminWithdrawContext } from '@/modules/Gauges/providers/GaugesAdminWithdrawProvider'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'
import { Placeholder } from '@/components/common/Placeholder'
import { formattedAmount } from '@/utils'
import { GaugesTokens } from '@/modules/Gauges/components/GaugesTokens'
import { Spinner } from '@/components/common/Spinner'

import styles from './index.module.scss'

function AdminBalanceWithdrawInner(): JSX.Element {
    const intl = useIntl()
    const { extraTokens, tokenDetails } = useContext(GaugesDataStoreContext)
    const adminWithdraw = useContext(GaugesAdminWithdrawContext)

    const { availableTokens } = adminWithdraw

    if (extraTokens && availableTokens && tokenDetails) {
        return (
            <GaugesPanel>
                <div className={styles.desc}>
                    <h3>
                        {intl.formatMessage({
                            id: 'GAUGE_ADMIN_WITHDRAW_TITLE',
                        })}
                    </h3>
                    <p>
                        {intl.formatMessage({
                            id: 'GAUGE_ADMIN_WITHDRAW_TEXT',
                        })}
                    </p>
                </div>

                {extraTokens.length > 0 ? (
                    <>
                        <div className={styles.balances}>
                            <div className={styles.title}>
                                {intl.formatMessage({
                                    id: 'GAUGE_ADMIN_WITHDRAW_TOKENS_TITLE',
                                })}
                            </div>

                            <GaugesTokens
                                items={extraTokens.map((token, index) => ({
                                    amount: availableTokens[index] ? (
                                        formattedAmount(
                                            tokenDetails._extraTokenData[index].balance,
                                            token.decimals,
                                            { preserve: true, roundOn: false },
                                        )
                                    ) : '0',
                                    token,
                                }))}
                            />
                        </div>

                        <div>
                            <Button
                                type="secondary"
                                disabled={!availableTokens.some(item => item) || adminWithdraw.isLoading}
                                onClick={adminWithdraw.submit}
                                className={styles.btnWithdraw}
                            >
                                {intl.formatMessage({
                                    id: 'GAUGE_ADMIN_WITHDRAW_BTN',
                                })}
                                {adminWithdraw.isLoading && (
                                    <Spinner size="s" />
                                )}
                            </Button>
                        </div>
                    </>
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

export const AdminBalanceWithdraw = observer(AdminBalanceWithdrawInner)
