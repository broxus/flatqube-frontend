import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'
import classNames from 'classnames'

import { AmountInput } from '@/components/common/AmountInput'
import { Button } from '@/components/common/Button'
import { Checkbox } from '@/components/common/Checkbox'
import { useContext } from '@/hooks/useContext'
import { GaugesUserDataContext } from '@/modules/Gauges/providers/GaugesUserDataProvider'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'
import { decimalAmount } from '@/modules/Gauges/utils'
import { formattedAmount } from '@/utils'
import { GaugesWithdrawFormContext } from '@/modules/Gauges/providers/GaugesWithdrawFormProvider'
import { Spinner } from '@/components/common/Spinner'
import { GaugesPanel } from '@/modules/Gauges/components/GaugesPanel'
import { GaugesUserPerformanceContext } from '@/modules/Gauges/providers/GaugesUserPerformanceProvider'

import styles from './index.module.scss'

type Props = {
    asPopup?: boolean;
    onCancel?: () => void;
}

function UserPerformanceWithdrawFormInner({
    asPopup,
    onCancel,
}: Props): JSX.Element {
    const intl = useIntl()
    const data = useContext(GaugesDataStoreContext)
    const userData = useContext(GaugesUserDataContext)
    const withdrawForm = useContext(GaugesWithdrawFormContext)
    const userPerformance = useContext(GaugesUserPerformanceContext)

    const isMounted = React.useRef(false)

    const withdrawBalance = React.useMemo(
        () => (data.rootToken && userData.withdrawBalance
            ? decimalAmount(userData.withdrawBalance, data.rootToken.decimals)
            : undefined),
        [data.rootToken, userData.withdrawBalance],
    )

    const onClickMax = () => {
        if (withdrawBalance) {
            withdrawForm.setAmount(withdrawBalance)
        }
    }

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const success = await withdrawForm.submit()

        if (success && isMounted.current) {
            userPerformance.setRoot()
        }
    }

    React.useEffect(() => {
        isMounted.current = true
        return () => {
            isMounted.current = false
        }
    }, [])

    return (
        <GaugesPanel
            as="form"
            className={classNames(styles.form, {
                [styles.asPopup]: asPopup,
            })}
            onSubmit={onSubmit}
        >
            <h3 className={styles.title}>
                {intl.formatMessage({
                    id: 'GAUGE_WITHDRAW_LP_TOKENS',
                })}
            </h3>

            <div className={styles.field}>
                <div className={styles.label}>
                    {intl.formatMessage({
                        id: 'GAUGE_FORM_AMOUNT',
                    })}
                </div>

                <AmountInput
                    value={withdrawForm.amount}
                    onChange={withdrawForm.setAmount}
                    onClickMax={onClickMax}
                    maxIsVisible={withdrawBalance !== undefined}
                    decimals={data.rootToken?.decimals}
                    disabled={withdrawBalance === undefined || withdrawForm.isLoading}
                    invalid={withdrawForm.amount && !withdrawForm.isLoading ? !withdrawForm.amountIsValid : undefined}
                    placeholder="0"
                />

                <div className={styles.hint}>
                    {intl.formatMessage({
                        id: 'GAUGE_FORM_UNLOCKED_BALANCE',
                    }, {
                        value: withdrawBalance && data.rootToken
                            ? `${formattedAmount(withdrawBalance, undefined, { preserve: true, roundOn: false })} ${data.rootToken.symbol}`
                            : '',
                    })}
                </div>
            </div>

            <div className={styles.field}>
                <Checkbox
                    disabled={withdrawForm.isLoading}
                    checked={withdrawForm.claim}
                    onChange={withdrawForm.setClaim}
                    label={intl.formatMessage({
                        id: 'GAUGE_CLAIM_AVAILABLE_REWARD',
                    })}
                />
            </div>

            <div className={styles.action}>
                <Button
                    size="md"
                    type="secondary"
                    className={styles.btn}
                    onClick={onCancel}
                >
                    {intl.formatMessage({
                        id: 'GAUGE_FORM_CANCEL',
                    })}
                </Button>
                <Button
                    submit
                    size="md"
                    type="primary"
                    className={styles.btn}
                    disabled={withdrawBalance === undefined || withdrawForm.isLoading || !withdrawForm.isValid}
                >
                    {withdrawForm.isLoading ? (
                        <Spinner size="s" />
                    ) : (
                        intl.formatMessage({
                            id: 'GAUGE_FORM_WITHDRAW',
                        })
                    )}
                </Button>
            </div>
        </GaugesPanel>
    )
}

export const UserPerformanceWithdrawForm = observer(UserPerformanceWithdrawFormInner)
