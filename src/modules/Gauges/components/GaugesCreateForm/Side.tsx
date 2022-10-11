import { observer } from 'mobx-react-lite'
import * as React from 'react'
import { useIntl } from 'react-intl'

import { useContext } from '@/hooks/useContext'
import { GaugesTokens } from '@/modules/Gauges/components/GaugesTokens'
import { GaugesCreateFormContext } from '@/modules/Gauges/providers/GaugesCreateFormProvider'

import styles from './index.module.scss'

function CreateFormSideInner(): JSX.Element {
    const intl = useIntl()
    const form = useContext(GaugesCreateFormContext)

    return (
        <div className={styles.side}>
            <h3 className={styles.title}>
                {intl.formatMessage({
                    id: 'GAUGE_CREATE_SUMMARY',
                })}
            </h3>

            <div className={styles.keyVal}>
                <div className={styles.key}>
                    {intl.formatMessage({
                        id: 'GAUGE_CREATE_POOL_PARAMS_FARM_TOKEN',
                    })}
                </div>
                <div className={styles.val}>
                    {form.token ? (
                        <GaugesTokens
                            items={[{
                                token: form.token,
                            }]}
                        />
                    ) : '—'}
                </div>
            </div>

            <hr />

            <div className={styles.keyVal}>
                <div className={styles.key}>
                    {intl.formatMessage({
                        id: 'GAUGE_CREATE_QUBE_VESTING_RATIO',
                    })}
                </div>
                <div className={styles.val}>
                    {form.qubeVestingRatio ? (
                        <>
                            {form.qubeVestingRatio}
                            %
                        </>
                    ) : (
                        '—'
                    )}
                </div>
            </div>

            <div className={styles.keyVal}>
                <div className={styles.key}>
                    {intl.formatMessage({
                        id: 'GAUGE_CREATE_QUBE_VESTING_PERIOD',
                    })}
                </div>
                <div className={styles.val}>
                    {form.qubeVestingPeriod ? (
                        intl.formatMessage({
                            id: 'GAUGE_CREATE_POOL_PARAMS_FARM_PERIOD_VALUE',
                        }, {
                            days: form.qubeVestingPeriod,
                        })
                    ) : '—'}
                </div>
            </div>

            <hr />

            <div className={styles.keyVal}>
                <div className={styles.key}>
                    {intl.formatMessage({
                        id: 'GAUGE_CREATE_MAX_LOCK_PERIOD',
                    })}
                </div>
                <div className={styles.val}>
                    {form.maxLockPeriod ? (
                        intl.formatMessage({
                            id: 'GAUGE_CREATE_POOL_PARAMS_FARM_PERIOD_VALUE',
                        }, {
                            days: form.maxLockPeriod,
                        })
                    ) : '—'}
                </div>
            </div>

            <div className={styles.keyVal}>
                <div className={styles.key}>
                    {intl.formatMessage({
                        id: 'GAUGE_CREATE_MAX_BOOST',
                    })}
                </div>
                <div className={styles.val}>
                    {form.maxBoost ? `x${form.maxBoost}` : '—'}
                </div>
            </div>

            {form.rewardTokes.map((token, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <React.Fragment key={index}>
                    <hr />
                    <div className={styles.keyVal}>
                        <div className={styles.key}>
                            {intl.formatMessage({
                                id: 'GAUGE_CREATE_POOL_PARAMS_REWARD_TOKEN',
                            }, {
                                index: index + 1,
                            })}
                        </div>
                        <div className={styles.val}>
                            {token ? (
                                <GaugesTokens
                                    items={[{ token }]}
                                />
                            ) : '—'}
                        </div>
                    </div>

                    <div className={styles.keyVal}>
                        <div className={styles.key}>
                            {intl.formatMessage({
                                id: 'GAUGE_CREATE_FIELD_FARM_VESTING_PERIOD_LABEL',
                            })}
                        </div>
                        <div className={styles.val}>
                            {form.rewards[index].vestingPeriod ? (
                                intl.formatMessage({
                                    id: 'GAUGE_CREATE_POOL_PARAMS_FARM_PERIOD_VALUE',
                                }, {
                                    days: form.rewards[index].vestingPeriod,
                                })
                            ) : '—'}
                        </div>
                    </div>

                    <div className={styles.keyVal}>
                        <div className={styles.key}>
                            {intl.formatMessage({
                                id: 'GAUGE_CREATE_FIELD_FARM_VESTING_RATIO_LABEL',
                            })}
                        </div>
                        <div className={styles.val}>
                            {form.rewards[index].vestingRatio ? (
                                `${form.rewards[index].vestingRatio}%`
                            ) : '—'}
                        </div>
                    </div>
                </React.Fragment>
            ))}
        </div>
    )
}

export const CreateFormSide = observer(CreateFormSideInner)
