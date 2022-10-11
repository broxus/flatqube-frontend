import * as React from 'react'
import { useIntl } from 'react-intl'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'

import { CreateFormPanel } from '@/modules/Gauges/components/GaugesCreateForm/Panel'
import { Checkbox } from '@/components/common/Checkbox'
import { GaugesCreateFormContext } from '@/modules/Gauges/providers/GaugesCreateFormProvider'
import { useContext } from '@/hooks/useContext'
import { AmountInput } from '@/components/common/AmountInput'

import styles from './index.module.scss'

function CreateFormBoostInner(): JSX.Element {
    const intl = useIntl()
    const form = useContext(GaugesCreateFormContext)

    return (
        <CreateFormPanel
            title={intl.formatMessage({
                id: 'GAUGE_CREATE_LOCK_BOOST',
            })}
        >
            <div>
                <Checkbox
                    disabled={form.isLoading}
                    checked={form.boostEnabled}
                    onChange={form.setBoostEnabled}
                    label={intl.formatMessage({
                        id: 'GAUGE_CREATE_ACTIVATE_BOOST',
                    })}
                />
            </div>

            <div className={styles.hint}>
                {intl.formatMessage({
                    id: 'GAUGE_CREATE_BOOST_HINT',
                })}
            </div>

            <div className={styles.fields}>
                <div className={styles.field}>
                    <div className={styles.label}>
                        {intl.formatMessage({
                            id: 'GAUGE_CREATE_MAX_LOCK_PERIOD',
                        })}
                    </div>

                    <div className={classNames(styles.ctrl, styles.days)}>
                        <div className={styles.prefix}>
                            {intl.formatMessage({
                                id: 'GAUGE_FORM_DAYS',
                            })}
                        </div>

                        <AmountInput
                            placeholder="0"
                            value={form.maxLockPeriod}
                            onChange={form.setMaxLockPeriod}
                            disabled={form.isLoading || !form.boostEnabled}
                            invalid={!!form.maxLockPeriod && !form.maxLockPeriodIsValid}
                            maxIsVisible={false}
                        />
                    </div>
                </div>

                <div className={styles.field}>
                    <div className={styles.label}>
                        {intl.formatMessage({
                            id: 'GAUGE_CREATE_MAX_BOOST',
                        })}
                    </div>

                    <div className={classNames(styles.ctrl, styles.x)}>
                        <div className={styles.prefix}>
                            x
                        </div>

                        <AmountInput
                            placeholder="0"
                            value={form.maxBoost}
                            onChange={form.setMaxBoost}
                            disabled={form.isLoading || !form.boostEnabled}
                            invalid={!!form.maxBoost && !form.maxBoostIsValid}
                            maxIsVisible={false}
                        />
                    </div>
                </div>
            </div>
        </CreateFormPanel>
    )
}

export const CreateFormBoost = observer(CreateFormBoostInner)
