import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { TextInput } from '@/components/common/TextInput'
import { Button } from '@/components/common/Button'
import { useContext } from '@/hooks/useContext'
import { GaugesAdminSpeedFormContext } from '@/modules/Gauges/providers/GaugesAdminSpeedFormProvider'
import { AmountInput } from '@/components/common/AmountInput'
import { Spinner } from '@/components/common/Spinner'
import { GaugesAdminPopupContext } from '@/modules/Gauges/providers/GaugesAdminPopupProvider'
import { formatDate } from '@/utils'

import styles from './index.module.scss'

function AdminPopupSpeedFormInner(): JSX.Element {
    const intl = useIntl()
    const form = useContext(GaugesAdminSpeedFormContext)
    const adminPopup = useContext(GaugesAdminPopupContext)

    const onChangeFn = (index: number) => (value: string) => {
        form.setReward(index, value)
    }

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const success = await form.submit()
        if (success) {
            adminPopup.hide()
        }
    }

    return (
        <form className={styles.form} onSubmit={onSubmit}>
            {form.tokens?.map((token, index) => (
                // eslint-disable-next-line
                <div className={styles.field} key={index}>
                    <div className={styles.label}>
                        {intl.formatMessage({
                            id: 'GAUGE_CONFIG_REWARD_AMOUNT_LABEL',
                        }, {
                            symbol: token.symbol,
                        })}
                    </div>

                    <AmountInput
                        disabled={form.isLoading || (form.rewardEnded && form.rewardEnded[index] === true)}
                        invalid={!!form.reward[index] && !form.rewardValidation[index]}
                        value={form.reward[index]}
                        onChange={onChangeFn(index)}
                        maxIsVisible={false}
                        decimals={token.decimals}
                    />
                </div>
            ))}

            <div>
                <div className={styles.fields}>
                    <div className={styles.field}>
                        <div className={styles.label}>
                            {intl.formatMessage({
                                id: 'GAUGE_CONFIG_START_LABEL',
                            })}
                        </div>

                        <TextInput
                            disabled={form.isLoading}
                            value={form.date}
                            onChange={form.setDate}
                            placeholder={intl.formatMessage({
                                id: 'GAUGE_CONFIG_DATE_PLACEHOLDER',
                            })}
                        />
                    </div>
                    <div className={styles.field}>
                        <div className={styles.label}>
                            {'\u200B'}
                        </div>

                        <TextInput
                            disabled={form.isLoading}
                            value={form.time}
                            onChange={form.setTime}
                            placeholder={intl.formatMessage({
                                id: 'GAUGE_CONFIG_TIME_PLACEHOLDER',
                            })}
                        />
                    </div>
                </div>
                {form.minStartTime && (
                    <div className={styles.hint}>
                        {intl.formatMessage({
                            id: 'GAUGE_MIN_DATE',
                        }, {
                            date: formatDate(form.minStartTime),
                        })}
                    </div>
                )}
            </div>

            <div className={styles.actions}>
                <Button
                    submit
                    type="primary"
                    disabled={form.isLoading || !form.isValid}
                    className={styles.btn}
                >
                    {intl.formatMessage({
                        id: 'GAUGE_CONFIG_SAVE_CHANGES',
                    })}
                    {form.isLoading && (
                        <Spinner size="s" />
                    )}
                </Button>
            </div>
        </form>
    )
}

export const AdminPopupSpeedForm = observer(AdminPopupSpeedFormInner)
