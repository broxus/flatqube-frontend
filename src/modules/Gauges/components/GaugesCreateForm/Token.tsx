import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { CreateFormPanel } from '@/modules/Gauges/components/GaugesCreateForm/Panel'
import { TextInput } from '@/components/common/TextInput'
import { useContext } from '@/hooks/useContext'
import { GaugesCreateFormContext } from '@/modules/Gauges/providers/GaugesCreateFormProvider'

import styles from './index.module.scss'

function CreateFormTokenInner(): JSX.Element {
    const intl = useIntl()
    const form = useContext(GaugesCreateFormContext)

    return (
        <CreateFormPanel
            title={intl.formatMessage({
                id: 'GAUGE_CREATE_DEPOSIT_TOKEN',
            })}
        >
            <div className={styles.field}>
                <div className={styles.label}>
                    {intl.formatMessage({
                        id: 'GAUGE_CREATE_FIELD_FARM_TOKEN_ROOT_LABEL',
                    })}
                </div>

                <TextInput
                    onChange={form.setTokenRoot}
                    value={form.tokenRoot}
                    disabled={form.isLoading}
                    invalid={!!form.tokenRoot && !form.tokenRootIsValid}
                    placeholder={intl.formatMessage({
                        id: 'GAUGE_CREATE_ENTER_ADDRESS',
                    })}
                />
            </div>
        </CreateFormPanel>
    )
}

export const CreateFormToken = observer(CreateFormTokenInner)
