import * as React from 'react'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { Observer } from 'mobx-react-lite'
import Slider from 'rc-slider'
import { useIntl } from 'react-intl'

import { AmountInput } from '@/components/common/AmountInput'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { TextInput } from '@/components/common/TextInput'
import { TokenBadge } from '@/components/common/TokenBadge'
import { useQubeDaoDepositFormStore } from '@/modules/QubeDao/providers/QubeDaoDepositFormStoreProvider'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { debounce, formattedTokenAmount, isGoodBignumber } from '@/utils'

import styles from './index.module.scss'


export function QubeDaoDepositForm(): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()
    const depositForm = useQubeDaoDepositFormStore()

    const debouncedCalculation = debounce(async () => {
        await depositForm.calculateVeMintAmount()
    }, 400)

    const onChange = React.useCallback(async (value: string) => {
        depositForm.setData('amount', value)
        depositForm.setState('isCalculating', true)
        await debouncedCalculation()
    }, [])

    const onChangeLockPeriod = React.useCallback<<T>(value: T) => void>(async value => {
        const lockPeriod = Number(value || 0)
        depositForm.setData('lockPeriod', lockPeriod)
        if (isGoodBignumber(depositForm.amount)) {
            depositForm.setState('isCalculating', true)
            await debouncedCalculation()
        }
    }, [])

    const onSelectLockPeriod = React.useCallback((value: number) => async () => {
        depositForm.setData('lockPeriod', value)
        if (isGoodBignumber(depositForm.amount)) {
            depositForm.setState('isCalculating', true)
            await debouncedCalculation()
        }
    }, [])

    const onMaximize = React.useCallback(async () => {
        depositForm.setData(
            'amount',
            new BigNumber(daoContext.token?.balance ?? 0)
                .shiftedBy(-daoContext.tokenDecimals)
                .toFixed(),
        )
        depositForm.setState('isCalculating', true)
        await debouncedCalculation()
    }, [])

    return (
        <Observer>
            {() => {
                const value = depositForm.lockPeriod.toFixed(0)
                return (
                    <form className={styles.deposit_form}>
                        <div className={styles.deposit_form__fieldset}>
                            <label className={styles.deposit_form__field_label} htmlFor="amount">
                                {intl.formatMessage({ id: 'QUBE_DAO_DEPOSIT_FORM_LABEL_AMOUNT' })}
                            </label>
                            <div className={styles.deposit_form__field_control}>
                                <AmountInput
                                    id="amount"
                                    decimals={daoContext.tokenDecimals}
                                    invalid={!depositForm.isAmountValid}
                                    maxIsVisible
                                    placeholder=""
                                    prefix={(
                                        <TokenBadge
                                            address={daoContext.tokenAddress.toString()}
                                            className={styles.token_amount_badge__label}
                                            icon={daoContext.token?.icon}
                                            size="xsmall"
                                            symbol={daoContext.tokenSymbol}
                                        />
                                    )}
                                    readOnly={daoContext.isDepositing}
                                    value={depositForm.amount}
                                    onChange={onChange}
                                    onClickMax={onMaximize}
                                />
                            </div>
                            <div className={styles.deposit_form__field_meta}>
                                {intl.formatMessage(
                                    { id: 'QUBE_DAO_DEPOSIT_FORM_TOKEN_BALANCE' },
                                    {
                                        symbol: daoContext.tokenSymbol,
                                        value: formattedTokenAmount(
                                            daoContext.token?.balance || '0',
                                            daoContext.tokenDecimals,
                                        ),
                                    },
                                )}
                            </div>
                        </div>
                        <div className={styles.deposit_form__fieldset}>
                            <label className={styles.deposit_form__field_label} htmlFor="lock-period">
                                {intl.formatMessage({ id: 'QUBE_DAO_DEPOSIT_FORM_LABEL_LOCK_PERIOD' })}
                            </label>
                            <div className={styles.deposit_form__field_control}>
                                <Slider
                                    defaultValue={90}
                                    disabled={daoContext.isDepositing}
                                    max={365 * 4}
                                    min={1}
                                    value={Number(value)}
                                    onChange={onChangeLockPeriod}
                                />
                            </div>
                            <div className={styles.deposit_form__field_control}>
                                <TextInput
                                    disabled={daoContext.isDepositing}
                                    id="lock-period"
                                    inputMode="numeric"
                                    prefix={(
                                        <span className={styles.token_amount_badge__label}>
                                            {intl.formatMessage({ id: 'QUBE_DAO_DEPOSIT_FORM_LABEL_DAYS' })}
                                        </span>
                                    )}
                                    value={value}
                                    onChange={onChangeLockPeriod}
                                />
                            </div>
                        </div>
                        <div className={styles.deposit_form__fieldset}>
                            <div className={styles.deposit_form__labeled_buttons}>
                                <button
                                    disabled={daoContext.isDepositing}
                                    className={classNames(styles.deposit_form__labeled_button, {
                                        [styles.deposit_form__labeled_button__active]: (
                                            depositForm.lockPeriod === 90
                                        ),
                                    })}
                                    type="button"
                                    value={90}
                                    onClick={onSelectLockPeriod(90)}
                                >
                                    {intl.formatMessage(
                                        { id: 'QUBE_DAO_DEPOSIT_FORM_LABEL_DAYS_PREDEFINED' },
                                        { value: 90 },
                                    )}
                                </button>
                                <button
                                    disabled={daoContext.isDepositing}
                                    className={classNames(styles.deposit_form__labeled_button, {
                                        [styles.deposit_form__labeled_button__active]: (
                                            depositForm.lockPeriod === 180
                                        ),
                                    })}
                                    type="button"
                                    value={180}
                                    onClick={onSelectLockPeriod(180)}
                                >
                                    {intl.formatMessage(
                                        { id: 'QUBE_DAO_DEPOSIT_FORM_LABEL_DAYS_PREDEFINED' },
                                        { value: 180 },
                                    )}
                                </button>
                                <button
                                    disabled={daoContext.isDepositing}
                                    className={classNames(styles.deposit_form__labeled_button, {
                                        [styles.deposit_form__labeled_button__active]: (
                                            depositForm.lockPeriod === 365
                                        ),
                                    })}
                                    type="button"
                                    value={365}
                                    onClick={onSelectLockPeriod(365)}
                                >
                                    {intl.formatMessage(
                                        { id: 'QUBE_DAO_DEPOSIT_FORM_LABEL_YEARS_PREDEFINED' },
                                        { value: 1 },
                                    )}
                                </button>
                                <button
                                    disabled={daoContext.isDepositing}
                                    className={classNames(styles.deposit_form__labeled_button, {
                                        [styles.deposit_form__labeled_button__active]: (
                                            depositForm.lockPeriod === 365 * 2
                                        ),
                                    })}
                                    type="button"
                                    value={365 * 2}
                                    onClick={onSelectLockPeriod(365 * 2)}
                                >
                                    {intl.formatMessage(
                                        { id: 'QUBE_DAO_DEPOSIT_FORM_LABEL_YEARS_PREDEFINED' },
                                        { value: 2 },
                                    )}
                                </button>
                            </div>
                        </div>
                        <hr className="divider" />
                        <div className={styles.deposit_form__fieldset}>
                            <label className={styles.deposit_form__field_label}>
                                {intl.formatMessage({
                                    id: 'QUBE_DAO_DEPOSIT_FORM_LABEL_RECEIVE_FOR_VOTING',
                                })}
                            </label>
                            <div className="text-bold text-lg">
                                {`${formattedTokenAmount(
                                    depositForm.veMintAmount || 0,
                                    daoContext.tokenDecimals,
                                )} ${daoContext.veSymbol}`}
                            </div>
                        </div>
                        <div className={styles.deposit_form__fieldset}>
                            <Button
                                disabled={(
                                    depositForm.isCalculating
                                    || daoContext.isDepositing
                                    || !depositForm.isValid
                                )}
                                size="md"
                                type="primary"
                                onClick={depositForm.deposit}
                            >
                                {(depositForm.isCalculating || daoContext.isDepositing) ? (
                                    <Icon icon="loader" className="spin" />
                                ) : intl.formatMessage({ id: 'QUBE_DAO_DEPOSIT_FORM_SUBMIT_BTN_TEXT' })}
                            </Button>
                        </div>
                    </form>
                )
            }}
        </Observer>
    )
}
