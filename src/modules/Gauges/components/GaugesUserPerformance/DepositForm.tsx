import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'

import { AmountInput } from '@/components/common/AmountInput'
import { Button } from '@/components/common/Button'
import { useContext } from '@/hooks/useContext'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'
import { GaugesUserDataContext } from '@/modules/Gauges/providers/GaugesUserDataProvider'
import { GaugesDepositFormContext } from '@/modules/Gauges/providers/GaugesDepositFormProvider'
import { decimalAmount, secsToDays } from '@/modules/Gauges/utils'
import { Spinner } from '@/components/common/Spinner'
import { formattedAmount } from '@/utils'
import { GaugesPanel } from '@/modules/Gauges/components/GaugesPanel'
import { GaugesUserPerformanceContext } from '@/modules/Gauges/providers/GaugesUserPerformanceProvider'

import styles from './index.module.scss'

type Props = {
    asPopup?: boolean;
    onCancel?: () => void;
}

function UserPerformanceDepositFormInner({
    asPopup,
    onCancel,
}: Props): JSX.Element {
    const intl = useIntl()
    const data = useContext(GaugesDataStoreContext)
    const userData = useContext(GaugesUserDataContext)
    const depositForm = useContext(GaugesDepositFormContext)
    const userPerformance = useContext(GaugesUserPerformanceContext)

    const isMounted = React.useRef(false)

    const walletAmount = React.useMemo(
        () => (data.rootToken && userData.walletBalance
            ? decimalAmount(userData.walletBalance, data.rootToken.decimals)
            : undefined),
        [data.rootToken, userData.walletBalance],
    )

    const years = React.useMemo(
        () => (
            Math.min(
                data.maxLockTime
                    ? new BigNumber(data.maxLockTime)
                        .dividedBy(365)
                        .dividedBy(86400)
                        .decimalPlaces(0, BigNumber.ROUND_DOWN)
                        .toNumber()
                    : 0,
                4,
            )
        ),
        [data.maxLockTime],
    )

    const onClickMax = () => {
        if (walletAmount) {
            depositForm.setAmount(walletAmount)
        }
    }

    const onClickDayMax = () => {
        if (data.maxLockTime) {
            depositForm.setDays(secsToDays(data.maxLockTime))
        }
    }

    const onClickYearFn = (value: number) => () => {
        depositForm.setDays((value * 365).toString())
    }

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const success = await depositForm.submit()

        if (success && isMounted.current) {
            userPerformance.setRoot()
        }
    }

    React.useEffect(() => {
        isMounted.current = true
        return () => {
            isMounted.current = false
        }
    }, [])

    return (
        <GaugesPanel
            as="form"
            type="blue"
            className={classNames(styles.form, {
                [styles.asPopup]: asPopup,
            })}
            onSubmit={onSubmit}
        >
            <h3 className={styles.title}>
                {intl.formatMessage({
                    id: 'GAUGE_DEPOSIT_LP_TOKENS',
                })}
            </h3>

            <div className={styles.field}>
                <div className={styles.label}>
                    {intl.formatMessage({
                        id: 'GAUGE_FORM_AMOUNT',
                    })}
                </div>

                <AmountInput
                    value={depositForm.amount}
                    onChange={depositForm.setAmount}
                    onClickMax={onClickMax}
                    maxIsVisible={walletAmount !== undefined}
                    decimals={data.rootToken?.decimals}
                    disabled={walletAmount === undefined || depositForm.isLoading}
                    invalid={depositForm.amount && !depositForm.isLoading ? !depositForm.amountIsValid : undefined}
                    placeholder="0"
                />

                <div className={styles.hint}>
                    {intl.formatMessage({
                        id: 'GAUGE_FORM_YOUR_BALANCE',
                    }, {
                        value: walletAmount && data.rootToken
                            ? `${formattedAmount(walletAmount, undefined, { preserve: true, roundOn: false })} ${data.rootToken.symbol}`
                            : '',
                    })}
                </div>
            </div>

            <div className={styles.field}>
                <div className={styles.label}>
                    {intl.formatMessage({
                        id: 'GAUGE_FORM_LOCK_PERIOD',
                    })}
                </div>

                <div className={styles.lockPeriod}>
                    <div className={styles.days}>
                        {intl.formatMessage({
                            id: 'GAUGE_FORM_DAYS',
                        })}
                    </div>
                    <AmountInput
                        value={depositForm.days}
                        onChange={depositForm.setDays}
                        onClickMax={onClickDayMax}
                        maxIsVisible={data.maxLockTime !== undefined}
                        disabled={!data.maxLockTime || depositForm.isLoading}
                        invalid={depositForm.days ? !depositForm.daysIsValid : undefined}
                        placeholder="0"
                    />
                </div>

                {data.maxLockTime && (
                    <div className={styles.hint}>
                        {intl.formatMessage({
                            id: 'GAUGE_MIN_MAX_VALUE',
                        }, {
                            max: secsToDays(data.maxLockTime),
                            min: 2,
                        })}
                    </div>
                )}

                {years > 0 && (
                    <div className={styles.tags}>
                        {Array.from({ length: years }, (_, i) => i + 1).map(value => (
                            <Button
                                key={value}
                                size="xs"
                                type="secondary"
                                className={styles.tag}
                                onClick={onClickYearFn(value)}
                                disabled={depositForm.isLoading}
                            >
                                {intl.formatMessage({
                                    id: 'GAUGE_FORM_YEAR',
                                }, {
                                    value,
                                })}
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            <div className={styles.boost}>
                {intl.formatMessage({
                    id: 'GAUGE_YOUR_FARMING_BOOST',
                })}

                <span className={styles.value}>
                    {`x${depositForm.boost}`}
                </span>
            </div>

            <div className={styles.action}>
                {onCancel ? (
                    <>
                        <Button
                            size="md"
                            type="secondary"
                            className={styles.btn}
                            onClick={onCancel}
                        >
                            {intl.formatMessage({
                                id: 'GAUGE_FORM_CANCEL',
                            })}
                        </Button>
                        <Button
                            submit
                            size="md"
                            type="primary"
                            className={styles.btn}
                            disabled={walletAmount === undefined || depositForm.isLoading || !depositForm.isValid}
                        >
                            {depositForm.isLoading ? (
                                <Spinner size="s" />
                            ) : (
                                intl.formatMessage({
                                    id: 'GAUGE_FORM_DEPOSIT',
                                })
                            )}
                        </Button>
                    </>
                ) : (
                    <Button
                        submit
                        size="md"
                        type="primary"
                        className={styles.btn}
                        disabled={walletAmount === undefined || depositForm.isLoading || !depositForm.isValid}
                    >
                        {depositForm.isLoading ? (
                            <Spinner size="s" />
                        ) : (
                            intl.formatMessage({
                                id: 'GAUGE_DEPOSIT_TO_START_FARMING',
                            })
                        )}
                    </Button>
                )}
            </div>
        </GaugesPanel>
    )
}

export const UserPerformanceDepositForm = observer(UserPerformanceDepositFormInner)
