import * as React from 'react'
import { useIntl } from 'react-intl'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'

import { TextInput } from '@/components/common/TextInput'
import { CreateFormPanel } from '@/modules/Gauges/components/GaugesCreateForm/Panel'
import { AmountInput } from '@/components/common/AmountInput'
import { GaugesCreateFormContext } from '@/modules/Gauges/providers/GaugesCreateFormProvider'
import { useContext } from '@/hooks/useContext'
import { Icon } from '@/components/common/Icon'

import styles from './index.module.scss'

type Props = {
    rewardIndex: number;
}
function CreateFormRewardInner({
    rewardIndex,
}: Props): JSX.Element | null {
    const intl = useIntl()
    const form = useContext(GaugesCreateFormContext)
    const reward = form.rewards[rewardIndex]
    const validation = form.rewardValidation[rewardIndex]

    const onChangeFn = (fn: (v: string, i: number) => void) => (value: string) => {
        fn(value, rewardIndex)
    }

    const onRemove = () => {
        form.removeReward(rewardIndex)
    }

    return (
        <CreateFormPanel
            title={intl.formatMessage({
                id: 'GAUGE_CREATE_POOL_ADDITIONAL_REWARD_TOKEN',
            }, {
                index: rewardIndex + 1,
            })}
            tools={(
                <button
                    type="button"
                    className={styles.remove}
                    onClick={onRemove}
                >
                    <Icon icon="delete" />
                </button>
            )}
        >
            <div className={styles.field}>
                <div className={styles.label}>
                    {intl.formatMessage({
                        id: 'GAUGE_CREATE_FIELD_REWARD_TOKEN_ROOT_LABEL',
                    })}
                </div>

                <TextInput
                    value={reward.tokenRoot}
                    onChange={onChangeFn(form.setRewardTokenRoot)}
                    disabled={form.isLoading}
                    invalid={!!reward.tokenRoot && !validation.tokenRoot}
                    placeholder={intl.formatMessage({
                        id: 'GAUGE_CREATE_ENTER_ADDRESS',
                    })}
                />
            </div>

            <div className={styles.fields}>
                <div className={styles.field}>
                    <div className={styles.label}>
                        {intl.formatMessage({
                            id: 'GAUGE_CREATE_FIELD_FARM_VESTING_PERIOD_LABEL',
                        })}
                    </div>

                    <div className={classNames(styles.ctrl, styles.days)}>
                        <div className={styles.prefix}>
                            {intl.formatMessage({
                                id: 'GAUGE_FORM_DAYS',
                            })}
                        </div>

                        <AmountInput
                            value={reward.vestingPeriod}
                            onChange={onChangeFn(form.setRewardVestingPeriod)}
                            disabled={form.isLoading}
                            invalid={!!reward.vestingPeriod && !validation.vestingPeriod}
                            placeholder="0"
                            maxIsVisible={false}
                        />
                    </div>
                </div>

                <div className={styles.field}>
                    <div className={styles.label}>
                        {intl.formatMessage({
                            id: 'GAUGE_CREATE_FIELD_FARM_VESTING_RATIO_LABEL',
                        })}
                    </div>

                    <div className={classNames(styles.ctrl, styles.x)}>
                        <div className={styles.prefix}>
                            %
                        </div>

                        <AmountInput
                            value={reward.vestingRatio}
                            onChange={onChangeFn(form.setRewardVestingRatio)}
                            disabled={form.isLoading}
                            invalid={!!reward.vestingRatio && !validation.vestingRatio}
                            placeholder="0"
                            maxIsVisible={false}
                        />
                    </div>
                </div>
            </div>
        </CreateFormPanel>
    )
}

export const CreateFormReward = observer(CreateFormRewardInner)
