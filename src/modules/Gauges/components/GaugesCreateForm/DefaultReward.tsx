import { observer } from 'mobx-react-lite'
import * as React from 'react'
import { useIntl } from 'react-intl'

import { CreateFormPanel } from '@/modules/Gauges/components/GaugesCreateForm/Panel'
import { TextInput } from '@/components/common/TextInput'
import { useContext } from '@/hooks/useContext'
import { GaugesCreateFormContext } from '@/modules/Gauges/providers/GaugesCreateFormProvider'
import { TokenIcon } from '@/components/common/TokenIcon'

import styles from './index.module.scss'

function DefaultRewardInner(): JSX.Element {
    const intl = useIntl()
    const form = useContext(GaugesCreateFormContext)

    return (
        <CreateFormPanel
            title={intl.formatMessage({
                id: 'GAUGE_CREATE_POOL_DEFAULT_REWARD_TOKEN',
            })}
        >
            <div className={styles.field}>
                <div className={styles.label}>
                    {intl.formatMessage({
                        id: 'GAUGE_CREATE_FIELD_REWARD_TOKEN_ROOT_LABEL',
                    })}
                </div>

                <TextInput
                    readOnly
                    value={form.qubeToken?.symbol}
                    prefix={!!form.qubeToken && (
                        <TokenIcon
                            address={form.qubeToken.root}
                            icon={form.qubeToken.icon}
                            size="xsmall"
                        />
                    )}
                />
            </div>

            <div className={styles.alert}>
                {intl.formatMessage({
                    id: 'GAUGE_CREATE_POOL_DEFAULT_REWARD_HINT',
                })}
            </div>
        </CreateFormPanel>
    )
}

export const DefaultReward = observer(DefaultRewardInner)
