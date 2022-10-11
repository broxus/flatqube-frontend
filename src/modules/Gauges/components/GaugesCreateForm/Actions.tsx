import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { Button } from '@/components/common/Button'
import { GaugesToolBtn } from '@/modules/Gauges/components/GaugesToolBtn'
import { useContext } from '@/hooks/useContext'
import { GaugesCreateFormContext } from '@/modules/Gauges/providers/GaugesCreateFormProvider'
import { Spinner } from '@/components/common/Spinner'

import styles from './index.module.scss'

function CreateFormActionsInner(): JSX.Element {
    const intl = useIntl()
    const form = useContext(GaugesCreateFormContext)

    return (
        <div className={styles.actions}>
            <div>
                {form.rewards.length < 3 && (
                    <GaugesToolBtn
                        disabled={form.isLoading}
                        className={styles.add}
                        onClick={form.addReward}
                    >
                        +
                        {' '}
                        {intl.formatMessage({
                            id: 'GAUGE_CREATE_ADD_REWARD_TOKEN_LINK_TEXT',
                        })}
                    </GaugesToolBtn>
                )}
            </div>

            <Button
                submit
                disabled={form.isLoading || !form.isValid}
                type="primary"
                size="lg"
                className={styles.submit}
            >
                {intl.formatMessage({
                    id: 'GAUGE_CREATE_BTN_TEXT_SUBMIT',
                })}
                {form.isLoading && (
                    <Spinner />
                )}
            </Button>
        </div>
    )
}

export const CreateFormActions = observer(CreateFormActionsInner)
