import * as React from 'react'
import { useIntl } from 'react-intl'
import Slider from 'rc-slider'
import { observer } from 'mobx-react-lite'
import classNames from 'classnames'

import { Checkbox } from '@/components/common/Checkbox'
import { TextInput } from '@/components/common/TextInput'
import { Button } from '@/components/common/Button'
import { TokenIcon } from '@/components/common/TokenIcon'
import { useContext } from '@/hooks/useContext'
import { GaugesCalcContext } from '@/modules/Gauges/providers/GaugesCalcProvider'
import { AmountInput } from '@/components/common/AmountInput'
import { formatDate, formattedAmount, formattedTokenAmount } from '@/utils'

import styles from './index.module.scss'

type Props = {
    asPopup?: boolean;
    onClose?: () => void;
}

function GaugesCalcFormFieldsInner({
    asPopup,
    onClose,
}: Props): JSX.Element {
    const intl = useIntl()
    const calc = useContext(GaugesCalcContext)

    const clear = () => {
        calc.clear()
        onClose?.()
    }

    const changeSliderFn = (cb: (value: string) => void) => (value: number | number[]) => {
        cb(value.toString())
    }

    return (
        <div
            className={classNames(styles.form, {
                [styles.asPopup]: asPopup,
            })}
        >
            <h3 className={styles.title}>
                {intl.formatMessage({
                    id: 'GAUGE_CALC_FILTER_TITLE',
                })}
            </h3>

            <Checkbox
                checked={calc.onlyFav}
                onChange={calc.setOnlyFav}
                label={intl.formatMessage({
                    id: 'GAUGE_CALC_FILTER_ONLY_FAV',
                })}
            />

            <hr />

            <div className={styles.field}>
                <div className={styles.label}>
                    {intl.formatMessage({
                        id: 'GAUGE_CALC_FILTER_DEPOSIT',
                    })}
                </div>

                <AmountInput
                    value={calc.lpAmount}
                    onChange={calc.setLpAmount}
                    maxIsVisible={false}
                    prefix={(
                        <span className={styles.prefix}>
                            $
                        </span>
                    )}
                />
            </div>

            <div className={styles.field}>
                <div className={styles.label}>
                    {intl.formatMessage({
                        id: 'GAUGE_CALC_FILTER_DEPOSIT_LOCK',
                    })}
                </div>

                <div className={styles.slider}>
                    <Slider
                        defaultValue={calc.lpLockMinDays}
                        disabled={calc.lpLockMaxDays === undefined}
                        max={calc.lpLockMaxDays}
                        min={calc.lpLockMinDays}
                        value={calc.lpLockMaxDays ? calc.lpLockDaysNumber : undefined}
                        onChange={changeSliderFn(calc.setLpLockDays)}
                    />
                </div>

                <TextInput
                    value={calc.lpLockDays}
                    onChange={calc.setLpLockDays}
                    disabled={calc.lpLockMaxDays === undefined}
                    invalid={!!calc.lpLockDays && !calc.lpLockDaysValid}
                    prefix={(
                        <span className={styles.prefix}>
                            {intl.formatMessage({
                                id: 'GAUGE_CALC_FILTER_DAYS',
                            })}
                        </span>
                    )}
                />

                <div className={styles.hint}>
                    {intl.formatMessage({
                        id: 'GAUGE_CALC_FILTER_END_DATE',
                    }, {
                        date: calc.lpLockEndDate
                            ? formatDate(calc.lpLockEndDate, 'MMM dd, yyyy')
                            : undefined,
                    })}
                </div>
            </div>

            <hr />

            <div className={styles.field}>
                <div className={styles.label}>
                    {intl.formatMessage({
                        id: 'GAUGE_CALC_FILTER_QUBE_DEPOSIT',
                    })}
                </div>

                <AmountInput
                    value={calc.qubeAmount}
                    onChange={calc.setQubeAmount}
                    maxIsVisible={false}
                    prefix={calc.qube ? (
                        <TokenIcon
                            address={calc.qube?.root}
                            icon={calc.qube?.icon}
                            size="xsmall"
                        />
                    ) : undefined}
                />

                <div className={styles.hint}>
                    {intl.formatMessage({
                        id: 'GAUGE_CALC_FILTER_YOUR_BALANCE',
                    }, {
                        value: calc.qube && calc.qubeBalance
                            ? `${formattedTokenAmount(calc.qubeBalance, calc.qube.decimals)} ${calc.qube.symbol}`
                            : '',
                    })}
                </div>
            </div>

            <div className={styles.field}>
                <div className={styles.label}>
                    {intl.formatMessage({
                        id: 'GAUGE_CALC_FILTER_DEPOSIT_LOCK',
                    })}
                </div>

                <div className={styles.slider}>
                    <Slider
                        defaultValue={calc.veLockMinDays}
                        max={calc.veLockMaxDays}
                        min={calc.veLockMinDays}
                        value={calc.veLockDaysNumber}
                        onChange={changeSliderFn(calc.setVeLockDays)}
                        className={styles.slider}
                    />
                </div>

                <TextInput
                    value={calc.veLockDays}
                    onChange={calc.setVeLockDays}
                    invalid={!!calc.veLockDays && !calc.veLockDaysValid}
                    prefix={(
                        <span className={styles.prefix}>
                            {intl.formatMessage({
                                id: 'GAUGE_CALC_FILTER_DAYS',
                            })}
                        </span>
                    )}
                />

                <div className={styles.hint}>
                    {intl.formatMessage({
                        id: 'GAUGE_CALC_FILTER_END_DATE',
                    }, {
                        date: calc.veLockEndDate
                            ? formatDate(calc.veLockEndDate, 'MMM dd, yyyy')
                            : undefined,
                    })}
                </div>
            </div>

            <div className={styles.field}>
                <div className={styles.label}>
                    {intl.formatMessage({
                        id: 'GAUGE_CALC_FILTER_RECEIVE_VEQUBE',
                    })}
                </div>

                <TextInput
                    readOnly
                    value={calc.veQubesMinted
                        ? formattedTokenAmount(calc.veQubesMinted)
                        : '0'}
                    prefix={(
                        <TokenIcon
                            icon={calc.veIcon}
                            size="xsmall"
                        />
                    )}
                />

                <div className={styles.hint}>
                    {intl.formatMessage({
                        id: 'GAUGE_CALC_FILTER_TOTAL_VEQUBE',
                    }, {
                        value: calc.totalVeAmount ? formattedAmount(calc.totalVeAmount) : '',
                    })}
                </div>
            </div>

            <div className={styles.actions}>
                {asPopup && (
                    <Button
                        type="primary"
                        onClick={onClose}
                    >
                        {intl.formatMessage({
                            id: 'GAUGE_CALC_FILTER_APPLY',
                        })}
                    </Button>
                )}

                <Button
                    type="secondary"
                    onClick={clear}
                >
                    {intl.formatMessage({
                        id: 'GAUGE_CALC_FILTER_CLEAR_ALL',
                    })}
                </Button>
            </div>
        </div>
    )
}

export const GaugesCalcFormFields = observer(GaugesCalcFormFieldsInner)
