import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { TextInput } from '@/components/common/TextInput'
import { Button } from '@/components/common/Button'
import { useContext } from '@/hooks/useContext'
import { GaugesAdminPopupContext } from '@/modules/Gauges/providers/GaugesAdminPopupProvider'
import { GaugesAdminEndDateFormContext } from '@/modules/Gauges/providers/GaugesAdminEndDateFormProvider'
import { formatDate } from '@/utils'

import styles from './index.module.scss'

function AdminPopupEndDateFormInner(): JSX.Element {
    const intl = useIntl()
    const adminPopup = useContext(GaugesAdminPopupContext)
    const form = useContext(GaugesAdminEndDateFormContext)

    const onChangeDate = (index: number) => (value: string) => {
        form.setDate(index, value)
    }

    const onChangeTime = (index: number) => (value: string) => {
        form.setTime(index, value)
    }

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        adminPopup.showEndDateConfirmation()
    }

    return (
        <form
            onSubmit={onSubmit}
            className={styles.form}
        >
            <div className={styles.warn}>
                {intl.formatMessage({
                    id: 'GAUGE_CONFIG_CONFIRMATION_TEXT',
                })}
            </div>

            {form.tokens?.map((token, index) => (
                <div key={token.root}>
                    <div className={styles.fields}>
                        <div className={styles.field}>
                            <div className={styles.label}>
                                {intl.formatMessage({
                                    id: 'GAUGE_CONFIG_TOKEN_END_LABEL',
                                }, {
                                    token: token.symbol,
                                })}
                            </div>

                            <TextInput
                                disabled={form.isLoading || !form.rewardEnded || form.rewardEnded[index]}
                                value={form.date[index]}
                                onChange={onChangeDate(index)}
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
                                disabled={form.isLoading || !form.rewardEnded || form.rewardEnded[index]}
                                value={form.time[index]}
                                onChange={onChangeTime(index)}
                                placeholder={intl.formatMessage({
                                    id: 'GAUGE_CONFIG_TIME_PLACEHOLDER',
                                })}
                            />
                        </div>
                    </div>
                    {form.minEndTimes && form.rewardEnded && form.rewardEnded[index] === false ? (
                        <div className={styles.hint}>
                            {intl.formatMessage({
                                id: 'GAUGE_MIN_DATE',
                            }, {
                                date: formatDate(form.minEndTimes[index]),
                            })}
                        </div>
                    ) : undefined}
                </div>
            ))}

            <div className={styles.actions}>
                <Button
                    submit
                    type="danger"
                    disabled={form.isLoading || !form.isValid}
                >
                    {intl.formatMessage({
                        id: 'GAUGE_CONFIG_CLOSE_POOL',
                    })}
                </Button>
            </div>
        </form>
    )
}

export const AdminPopupEndDateForm = observer(AdminPopupEndDateFormInner)
