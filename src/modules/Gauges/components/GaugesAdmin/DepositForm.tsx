import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { AmountInput } from '@/components/common/AmountInput'
import { Button } from '@/components/common/Button'
import { formattedAmount } from '@/utils'
import { useContext } from '@/hooks/useContext'
import { GaugesAdminDepositFormContext } from '@/modules/Gauges/providers/GaugesAdminDepositFormProvider'
import { GaugesTokens } from '@/modules/Gauges/components/GaugesTokens'
import { Spinner } from '@/components/common/Spinner'
import { decimalAmount } from '@/modules/Gauges/utils'

import styles from './index.module.scss'

function AdminBalanceDepositFormInner(): JSX.Element | null {
    const intl = useIntl()
    const form = useContext(GaugesAdminDepositFormContext)

    if (form.token && form.deposited) {
        const onClickMax = () => {
            if (form.balance && form.token) {
                form.setAmount(decimalAmount(form.balance, form.token.decimals))
            }
        }

        const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            form.submit()
        }

        return (
            <form
                onSubmit={onSubmit}
                className={styles.field}
            >
                <GaugesTokens
                    items={[{
                        label: intl.formatMessage({
                            id: 'GAUGE_ADMIN_DEPOSIT_BALANCE',
                        }, {
                            amount: formattedAmount(
                                form.deposited,
                                form.token.decimals,
                                { preserve: true, roundOn: false },
                            ),
                            symbol: form.token.symbol,
                        }),
                        token: form.token,
                    }]}
                />

                <div className={styles.action}>
                    <AmountInput
                        value={form.amount}
                        onChange={form.setAmount}
                        onClickMax={onClickMax}
                        maxIsVisible={form.balance !== undefined}
                        decimals={form.token.decimals}
                        disabled={form.balance === undefined || form.isLoading}
                        invalid={form.amount && !form.isLoading ? !form.amountIsValid : undefined}
                        className={styles.input}
                        placeholder="0"
                    />
                    <Button
                        submit
                        type="primary"
                        disabled={form.isLoading || !form.amountIsValid}
                        className={styles.btnDeposit}
                    >
                        {intl.formatMessage({
                            id: 'GAUGE_BALANCE_DEPOSIT_ACTION',
                        })}
                        {form.isLoading && (
                            <Spinner size="s" />
                        )}
                    </Button>
                </div>

                <div className={styles.hint}>
                    {intl.formatMessage({
                        id: 'GAUGE_ADMIN_DEPOSIT_HINT',
                    }, {
                        amount: formattedAmount(
                            form.balance,
                            form.token.decimals,
                            { preserve: true, roundOn: false },
                        ),
                        symbol: form.token.symbol,
                    })}
                </div>
            </form>
        )
    }

    return null
}

export const AdminBalanceDepositForm = observer(AdminBalanceDepositFormInner)
